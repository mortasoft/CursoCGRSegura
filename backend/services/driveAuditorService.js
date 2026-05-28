const { google } = require('googleapis');
const db = require('../config/database');
const logger = require('../config/logger');
const emailService = require('./emailService');

class DriveAuditorService {
    /**
     * Inicia la auditoría en segundo plano. No espera a que termine.
     * 
     * @param {number} userId 
     * @param {string} userEmail 
     * @param {string} userName
     * @param {string} accessToken 
     */
    async startAudit(userId, userEmail, userName, accessToken) {
        // 1. Check if there's any active running audit for this user within the last 2 hours
        const [running] = await db.pool.execute(
            `SELECT id FROM drive_audit_reports 
             WHERE user_id = ? AND status = 'running' AND started_at >= DATE_SUB(NOW(), INTERVAL 2 HOUR)
             LIMIT 1`,
            [userId]
        );
        if (running.length > 0) {
            const err = new Error('Ya tienes un análisis de Drive en curso. Por favor, espera a que termine.');
            err.statusCode = 400;
            throw err;
        }

        // 2. Check if the user has reached the daily limit of 2 audits in the last 24 hours
        const [recent] = await db.pool.execute(
            `SELECT started_at FROM drive_audit_reports 
             WHERE user_id = ? AND started_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) 
             ORDER BY started_at ASC`,
            [userId]
        );
        if (recent.length >= 2) {
            const oldestRecent = new Date(recent[0].started_at);
            const nextAvailable = new Date(oldestRecent.getTime() + 24 * 60 * 60 * 1000);
            const nextAvailableStr = nextAvailable.toLocaleString('es-CR', { 
                timeZone: 'America/Costa_Rica',
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            });
            
            const err = new Error(`Límite diario excedido (máximo 2 análisis por día). Podrás volver a correr la auditoría a partir de: ${nextAvailableStr}`);
            err.statusCode = 429;
            err.nextAvailableDate = nextAvailable.toISOString();
            throw err;
        }

        const crypto = require('crypto');
        const uuid = crypto.randomUUID();

        // Crear registro inicial en drive_audit_reports
        const [result] = await db.pool.execute(
            `INSERT INTO drive_audit_reports 
            (uuid, user_id, status, sharing_map_json, external_domains_json) 
            VALUES (?, ?, 'running', ?, ?)`,
            [
                uuid,
                userId, 
                JSON.stringify({ private: 0, restricted: 0, domain: 0, link: 0, public: 0 }),
                JSON.stringify({})
            ]
        );
        const reportId = result.insertId;
        
        logger.info(`Iniciando auditoría de Drive en segundo plano para usuario ${userId}, reporte: ${reportId} (UUID: ${uuid})`);
        
        // Ejecutar proceso asíncrono
        this.runBackgroundAudit(reportId, uuid, userId, userEmail, userName, accessToken).catch(err => {
            logger.error(`Error en auditoría en segundo plano (Reporte ${reportId}):`, err);
        });

        return { reportId: uuid, status: 'running' };
    }

    async runBackgroundAudit(reportId, reportUuid, userId, userEmail, userName, accessToken) {
        const startTime = Date.now();
        try {
            const oauth2Client = new google.auth.OAuth2();
            oauth2Client.setCredentials({ access_token: accessToken });
            const drive = google.drive({ version: 'v3', auth: oauth2Client });

            const userDomain = userEmail.includes('@') ? userEmail.split('@')[1] : '';

            let pageToken = null;
            let totalScanned = 0;
            let riskCount = 0;
            
            const sharingMap = { private: 0, restricted_internal: 0, restricted_external: 0, domain: 0, link: 0, public: 0 };
            const externalDomains = {};
            
            const filesToInsert = [];

            const fetchFilesWithBackoff = async (params, retries = 5, backoff = 1000) => {
                try {
                    return await drive.files.list(params);
                } catch (error) {
                    if (retries > 0 && (error.code === 429 || error.code === 403 || error.code >= 500)) {
                        logger.warn(`Google Drive API Rate Limit o Error temporal. Reintentando en ${backoff}ms...`);
                        await new Promise(r => setTimeout(r, backoff));
                        return fetchFilesWithBackoff(params, retries - 1, backoff * 2);
                    }
                    throw error;
                }
            };

            do {
                const res = await fetchFilesWithBackoff({
                    q: "trashed = false",
                    pageSize: 1000,
                    fields: "nextPageToken, files(id, name, mimeType, shared, owners, permissions, webViewLink, size)",
                    supportsAllDrives: true,
                    includeItemsFromAllDrives: true,
                    pageToken: pageToken
                });

                const files = res.data.files || [];
                pageToken = res.data.nextPageToken;

                // Pequeña pausa entre páginas para no saturar la cuota
                if (pageToken) await new Promise(r => setTimeout(r, 200));

                for (const file of files) {
                    totalScanned++;
                    
                    let sharingLevel = "Privado";
                    let sharedWith = [];
                    let hasExternalCollaborator = false;

                    let ownerName = "Unknown";
                    let ownerEmail = "";
                    if (file.owners && file.owners.length > 0) {
                        ownerName = file.owners[0].displayName || "Unknown";
                        ownerEmail = file.owners[0].emailAddress || "";
                    }

                    if (file.shared) {
                        sharingLevel = "Restringido";
                        if (file.permissions) {
                            const fileExternalDomains = new Set();
                            for (const perm of file.permissions) {
                                if (perm.role === 'owner') continue;
                                
                                if (perm.type === 'anyone') {
                                    sharingLevel = perm.allowFileDiscovery ? "Publico" : "Con Enlace";
                                    riskCount++;
                                } else if (perm.type === 'domain') {
                                    sharingLevel = perm.allowFileDiscovery ? "Dominio Publico" : "Dominio con Enlace";
                                } else if (perm.emailAddress) {
                                    sharedWith.push(perm.emailAddress);
                                    
                                    const parts = perm.emailAddress.split("@");
                                    if (parts.length > 1) {
                                        const domain = parts[1];
                                        if (domain !== userDomain) {
                                            fileExternalDomains.add(domain);
                                            hasExternalCollaborator = true;
                                        }
                                    }
                                }
                            }
                            for (const domain of fileExternalDomains) {
                                externalDomains[domain] = (externalDomains[domain] || 0) + 1;
                            }
                        }
                    }

                    // Mapeo general
                    if (sharingLevel === "Publico") {
                        sharingMap.public++;
                    } else if (sharingLevel === "Con Enlace") {
                        sharingMap.link++;
                    } else if (sharingLevel === "Dominio Publico" || sharingLevel === "Dominio con Enlace") {
                        sharingMap.domain++;
                    } else if (sharingLevel === "Restringido") {
                        if (hasExternalCollaborator) {
                            sharingMap.restricted_external++;
                        } else {
                            sharingMap.restricted_internal++;
                        }
                    } else {
                        sharingMap.private++;
                    }

                    const isPublicOrDomain = ["Publico", "Con Enlace", "Dominio Publico", "Dominio con Enlace"].includes(sharingLevel);
                    const shouldInclude = isPublicOrDomain || (sharingLevel === "Restringido" && hasExternalCollaborator);

                    if (shouldInclude) {
                        filesToInsert.push([
                            reportId,
                            file.id,
                            file.name || "Untitled File",
                            file.mimeType || "unknown",
                            file.size ? Math.round(parseInt(file.size) / 1024) : 0,
                            ownerName,
                            ownerEmail,
                            sharingLevel,
                            sharedWith.join(', '),
                            file.webViewLink || ""
                        ]);
                    }
                }
                
                // Insertar en BD en lotes de hasta 500 para evitar queries gigantes
                if (filesToInsert.length > 0) {
                    await this.bulkInsertFiles(filesToInsert);
                    filesToInsert.length = 0; // vaciar
                }

                // Actualizar contadores en la BD periódicamente para que el panel de admin pueda ver el progreso en vivo
                await db.pool.execute(
                    `UPDATE drive_audit_reports SET total_scanned = ?, risk_count = ? WHERE id = ?`,
                    [totalScanned, riskCount, reportId]
                );

            } while (pageToken);

            // Finalizar reporte
            await db.pool.execute(
                `UPDATE drive_audit_reports 
                 SET status = 'completed', completed_at = CURRENT_TIMESTAMP, total_scanned = ?, risk_count = ?, sharing_map_json = ?, external_domains_json = ? 
                 WHERE id = ?`,
                [totalScanned, riskCount, JSON.stringify(sharingMap), JSON.stringify(externalDomains), reportId]
            );

            logger.info(`Auditoría de Drive completada para reporte ${reportId}`);

            // Calcular duración
            const durationMs = Date.now() - startTime;
            const durationSecs = Math.max(1, Math.floor(durationMs / 1000));
            let durationText = '';
            if (durationSecs < 60) {
                durationText = `${durationSecs} seg`;
            } else {
                const mins = Math.floor(durationSecs / 60);
                const secs = durationSecs % 60;
                durationText = `${mins} min ${secs} seg`;
            }

            // Enviar correo electrónico
            const reportUrl = `${process.env.FRONTEND_URL}/dashboard/drive-auditor/report/${reportUuid}`;
            if (emailService.sendDriveAuditReportNotification) {
                let points = 100;
                try {
                    const [contentRows] = await db.pool.execute("SELECT points FROM lesson_contents WHERE content_type = 'drive_auditor' LIMIT 1");
                    if (contentRows && contentRows.length > 0) {
                        points = contentRows[0].points;
                    }
                } catch (e) {
                    logger.error("Error fetching drive_auditor points for email:", e);
                }

                await emailService.sendDriveAuditReportNotification(userEmail, userName, reportUrl, {
                    totalScanned,
                    riskCount,
                    points,
                    durationText
                });
            } else {
                logger.warn('El método sendDriveAuditReportNotification no existe en emailService');
            }

        } catch (error) {
            logger.error(`Error en auditoría en segundo plano (Reporte ${reportId}):`, error);
            await db.pool.execute(
                `UPDATE drive_audit_reports SET status = 'failed', error_message = ? WHERE id = ?`,
                [error.message || 'Error desconocido', reportId]
            );
        }
    }

    async bulkInsertFiles(filesData) {
        if (!filesData || filesData.length === 0) return;
        
        const query = `INSERT INTO drive_audit_files 
            (report_id, file_id, file_name, mime_type, size_kb, owner_name, owner_email, sharing_level, shared_with_emails, file_link) 
            VALUES ?`;
        
        await db.pool.query(query, [filesData]);
    }

    async getLatestReport(userId) {
        const [rows] = await db.pool.execute(
            `SELECT uuid AS id, status, started_at, completed_at, error_message, total_scanned, risk_count
             FROM drive_audit_reports 
             WHERE user_id = ? 
             ORDER BY started_at DESC LIMIT 1`,
            [userId]
        );
        return rows.length > 0 ? rows[0] : null;
    }

    async getReportStatus(reportUuid, userId) {
        const isNumeric = /^\d+$/.test(reportUuid);
        const queryField = isNumeric ? 'id' : 'uuid';
        const [rows] = await db.pool.execute(
            `SELECT uuid AS id, status, started_at, completed_at, total_scanned, risk_count, error_message 
             FROM drive_audit_reports WHERE ${queryField} = ? AND user_id = ?`,
            [reportUuid, userId]
        );
        return rows.length > 0 ? rows[0] : null;
    }

    async getReportDetails(reportUuid, userId) {
        const isNumeric = /^\d+$/.test(reportUuid);
        const queryField = isNumeric ? 'id' : 'uuid';
        const [reportRows] = await db.pool.execute(
            `SELECT * FROM drive_audit_reports WHERE ${queryField} = ? AND user_id = ?`,
            [reportUuid, userId]
        );
        
        if (reportRows.length === 0) return null;
        const report = reportRows[0];
        const reportDbId = report.id;
        report.id = report.uuid;

        const [filesRows] = await db.pool.execute(
            `SELECT * FROM drive_audit_files WHERE report_id = ? ORDER BY id DESC`,
            [reportDbId]
        );

        return {
            report: report,
            files: filesRows
        };
    }

    async getAdminReportDetails(reportUuid) {
        const isNumeric = /^\d+$/.test(reportUuid);
        const queryField = isNumeric ? 'id' : 'uuid';
        const [reportRows] = await db.pool.execute(
            `SELECT d.*, u.first_name, u.last_name, u.email 
             FROM drive_audit_reports d
             JOIN users u ON d.user_id = u.id
             WHERE d.${queryField} = ?`,
            [reportUuid]
        );
        
        if (reportRows.length === 0) return null;
        const report = reportRows[0];
        const reportDbId = report.id;
        report.id = report.uuid;

        // Obtener archivos encontrados (límite 100 para la vista en vivo del admin)
        const [filesRows] = await db.pool.execute(
            `SELECT * FROM drive_audit_files WHERE report_id = ? ORDER BY id DESC LIMIT 100`,
            [reportDbId]
        );

        return {
            report: report,
            files: filesRows
        };
    }

    async getRunningAudits() {
        const [rows] = await db.pool.execute(
            `SELECT d.uuid AS id, d.user_id, d.status, d.started_at, d.total_scanned, d.risk_count,
                    u.first_name, u.last_name, u.email
             FROM drive_audit_reports d
             JOIN users u ON d.user_id = u.id
             WHERE d.status = 'running'
             ORDER BY d.started_at DESC`
        );
        return rows;
    }

    async cancelAudit(reportUuid, userId) {
        const isNumeric = /^\d+$/.test(reportUuid);
        const queryField = isNumeric ? 'id' : 'uuid';
        const [result] = await db.pool.execute(
            `UPDATE drive_audit_reports 
             SET status = 'failed', error_message = 'Cancelado por el usuario', completed_at = CURRENT_TIMESTAMP
             WHERE ${queryField} = ? AND user_id = ? AND status = 'running'`,
            [reportUuid, userId]
        );
        return result.affectedRows > 0;
    }

    async cancelAdminAudit(reportUuid) {
        const isNumeric = /^\d+$/.test(reportUuid);
        const queryField = isNumeric ? 'id' : 'uuid';
        const [result] = await db.pool.execute(
            `UPDATE drive_audit_reports 
             SET status = 'failed', error_message = 'Cancelado por el administrador', completed_at = CURRENT_TIMESTAMP
             WHERE ${queryField} = ? AND status = 'running'`,
            [reportUuid]
        );
        return result.affectedRows > 0;
    }

    async getUserReports(userId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const [rows] = await db.pool.execute(
            `SELECT uuid AS id, status, started_at, completed_at, total_scanned, risk_count, error_message
             FROM drive_audit_reports
             WHERE user_id = ?
             ORDER BY started_at DESC
             LIMIT ? OFFSET ?`,
            [userId, limit, offset]
        );
        const [[countRow]] = await db.pool.execute(
            `SELECT COUNT(*) AS total FROM drive_audit_reports WHERE user_id = ?`,
            [userId]
        );
        return {
            reports: rows,
            total: countRow.total,
            page,
            limit,
            totalPages: Math.ceil(countRow.total / limit)
        };
    }

    async deleteReport(reportUuid, userId) {
        const isNumeric = /^\d+$/.test(reportUuid);
        const queryField = isNumeric ? 'id' : 'uuid';

        // Obtener el ID numerico real y verificar propiedad
        const [rows] = await db.pool.execute(
            `SELECT id, status FROM drive_audit_reports WHERE ${queryField} = ? AND user_id = ? LIMIT 1`,
            [reportUuid, userId]
        );
        if (rows.length === 0) return { deleted: false, reason: 'not_found' };
        if (rows[0].status === 'running') return { deleted: false, reason: 'running' };

        const reportDbId = rows[0].id;

        // Eliminar archivos del reporte primero (FK constraint)
        await db.pool.execute(`DELETE FROM drive_audit_files WHERE report_id = ?`, [reportDbId]);
        // Eliminar el reporte
        await db.pool.execute(`DELETE FROM drive_audit_reports WHERE id = ?`, [reportDbId]);

        return { deleted: true };
    }

    async getLimitStatus(userId) {
        // 1. Check if there's any active running audit for this user within the last 2 hours
        const [running] = await db.pool.execute(
            `SELECT uuid FROM drive_audit_reports 
             WHERE user_id = ? AND status = 'running' AND started_at >= DATE_SUB(NOW(), INTERVAL 2 HOUR)
             LIMIT 1`,
            [userId]
        );
        if (running.length > 0) {
            return {
                canRun: false,
                reason: 'running',
                runningUuid: running[0].uuid,
                nextAvailableDate: null
            };
        }

        // 2. Check if the user has reached the daily limit of 2 audits in the last 24 hours
        const [recent] = await db.pool.execute(
            `SELECT started_at FROM drive_audit_reports 
             WHERE user_id = ? AND started_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) 
             ORDER BY started_at ASC`,
            [userId]
        );
        if (recent.length >= 2) {
            const oldestRecent = new Date(recent[0].started_at);
            const nextAvailable = new Date(oldestRecent.getTime() + 24 * 60 * 60 * 1000);
            return {
                canRun: false,
                reason: 'limit_reached',
                runningUuid: null,
                nextAvailableDate: nextAvailable.toISOString(),
                recentCount: recent.length
            };
        }

        return {
            canRun: true,
            reason: null,
            runningUuid: null,
            nextAvailableDate: null,
            recentCount: recent.length
        };
    }
}

module.exports = new DriveAuditorService();
