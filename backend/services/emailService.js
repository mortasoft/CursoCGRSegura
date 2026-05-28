const nodemailer = require('nodemailer');
const logger = require('../config/logger');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT),
            secure: false, // true para 465, false para otros
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
            tls: {
                // Requerido para Gmail y otros servicios modernos
                rejectUnauthorized: false
            }
        });

        // Verificar conexión al inicio
        this.transporter.verify((error, success) => {
            if (error) {
                logger.error('Error en conexión SMTP:', error);
            } else {
                logger.info('Servidor de correo listo para enviar mensajes');
            }
        });
    }

    /**
     * Envía un correo electrónico cuando un usuario gana una insignia
     */
    async sendBadgeNotification(userEmail, userName, badge) {
        const path = require('path');
        const fs = require('fs');

        // Buscamos las imágenes en la nueva carpeta interna del backend
        const assetsPath = path.resolve(__dirname, '../assets/images');

        // Priorizamos la versión PNG para el correo (mejor compatibilidad)
        const badgeImageName = badge.image_url ? badge.image_url.replace('.svg', '.png') : 'bienvenida-seguridad.png';
        let badgePath = path.join(assetsPath, 'badges', badgeImageName);

        // Fallback al SVG si por alguna razón no existe el PNG
        if (!fs.existsSync(badgePath)) {
            badgePath = path.join(assetsPath, 'badges', badge.image_url || 'bienvenida-seguridad.svg');
        }

        // Segundo fallback si la imagen no existe físicamente en absoluto
        if (!fs.existsSync(badgePath)) {
            badgePath = path.join(assetsPath, 'shield.svg');
        }

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #04060b; margin: 0; padding: 0; color: #ffffff; }
                .container { max-width: 600px; margin: 20px auto; background-color: #0b0f1c; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
                .header { background-color: #0d111d; padding: 40px 20px; text-align: center; border-bottom: 2px solid #EF8843; }
                .logo-institucional { width: 120px; margin-bottom: 20px; }
                .content { padding: 40px; text-align: center; }
                .badge-container { margin: 30px auto; width: 200px; height: 200px; background-color: #111627; border-radius: 40px; border: 1px solid rgba(255,255,255,0.1); text-align: center; line-height: 200px; box-shadow: 0 15px 30px rgba(0,0,0,0.3); }
                .badge-image { width: 140px; height: 140px; vertical-align: middle; object-fit: contain; }
                .congrats { color: #EF8843; text-transform: uppercase; font-weight: 900; letter-spacing: 2px; font-size: 14px; margin-bottom: 10px; }
                h1 { font-size: 26px; margin: 0 0 15px 0; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; }
                p { color: #94a3b8; line-height: 1.6; font-size: 15px; }
                .badge-name { color: #ffffff; font-weight: 700; font-size: 22px; margin: 20px 0 5px 0; }
                .badge-desc { color: #64748b; font-size: 14px; font-style: italic; margin-bottom: 35px; max-width: 80%; margin-left: auto; margin-right: auto; }
                .button { display: inline-block; background-color: #384A99; color: #ffffff !important; text-decoration: none; padding: 16px 40px; border-radius: 16px; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
                .footer { background-color: rgba(0,0,0,0.2); padding: 30px; text-align: center; font-size: 11px; color: #475569; border-top: 1px solid rgba(255,255,255,0.05); }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="cid:logo_institucional" alt="CGR" class="logo-institucional">
                    <div style="margin-top: 10px;">
                        <span style="color: #ffffff; font-size: 38px; font-weight: 900; letter-spacing: -1.5px;">CGR</span>
                        <span style="color: #EF8843; font-size: 38px; font-weight: 900; letter-spacing: -1.5px;"> SEGUR@</span>
                    </div>
                    <div style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">
                        Programa de Concientización en Ciberseguridad
                    </div>
                </div>
                <div class="content">
                    <div class="congrats">¡Felicidades, ${userName}!</div>
                    <h1>¡Has ganado un nuevo logro!</h1>
                    
                    <div class="badge-container">
                        <img src="cid:user_badge" alt="${badge.name}" class="badge-image">
                    </div>
                    
                    <div class="badge-name">${badge.name}</div>
                    <div class="badge-desc">"${badge.description}"</div>
                    
                    <p>Tu dedicación en el programa de concientización está fortaleciendo la seguridad de nuestra institución.</p>
                    
                    <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Ir a la plataforma</a>
                </div>
                <div class="footer">
                    &copy; 2026 Contraloría General de la República de Costa Rica<br>
                    Programa de Concientización en Ciberseguridad
                </div>
            </div>
        </body>
        </html>
        `;

        const attachments = [
            {
                filename: 'logo-cgr-blanco.png',
                path: path.join(assetsPath, 'Logotipo-CGR-blanco-transp.png'),
                cid: 'logo_institucional'
            },
            {
                filename: path.basename(badgePath),
                path: badgePath,
                cid: 'user_badge',
                contentType: badgePath.endsWith('.svg') ? 'image/svg+xml' : 'image/png'
            }
        ];

        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: userEmail,
                subject: `🏆 ¡Nueva insignia ganada: ${badge.name}!`,
                html: htmlContent,
                attachments: attachments
            });
            logger.info(`Email de insignia enviado a: ${userEmail}`);
        } catch (error) {
            logger.error(`Error enviando email de insignia a ${userEmail}:`, error);
            throw error;
        }
    }

    /**
     * Envía un correo de invitación a funcionarios que no han ingresado
     */
    async sendInvitationEmail(userEmail, userName) {
        const path = require('path');
        const fs = require('fs');
        const assetsPath = path.resolve(__dirname, '../assets/images');

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: 'Segoe UI', sans-serif; background-color: #04060b; margin: 0; padding: 0; color: #ffffff; }
                .container { max-width: 600px; margin: 20px auto; background-color: #0b0f1c; border-radius: 24px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); }
                .header { background-color: #0d111d; padding: 40px 20px; text-align: center; border-bottom: 2px solid #EF8843; }
                .logo-institucional { width: 120px; }
                .content { padding: 40px; text-align: center; }
                h1 { font-size: 26px; font-weight: 800; color: #ffffff; margin-bottom: 20px; }
                p { color: #94a3b8; line-height: 1.6; font-size: 16px; margin-bottom: 30px; }
                .button { display: inline-block; background-color: #384A99; color: #ffffff !important; text-decoration: none; padding: 16px 40px; border-radius: 16px; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
                .footer { background-color: rgba(0,0,0,0.2); padding: 30px; text-align: center; font-size: 11px; color: #475569; border-top: 1px solid rgba(255,255,255,0.05); }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="cid:logo_institucional" alt="CGR" class="logo-institucional">
                    <div style="margin-top: 10px;">
                        <span style="color: #ffffff; font-size: 38px; font-weight: 900;">CGR</span>
                        <span style="color: #EF8843; font-size: 38px; font-weight: 900;"> SEGUR@</span>
                    </div>
                </div>
                <div class="content">
                    <h1>¡Hola, ${userName}!</h1>
                    <p>Te invitamos a formar parte del <strong>Programa de Concientización en Ciberseguridad</strong> de la Contraloría General de la República.</p>
                    <p>Te informamos que este programa es de carácter <strong>obligatorio</strong> y fundamental para fortalecer la seguridad digital de nuestra institución.</p>
                    
                    <div style="background: rgba(56, 74, 153, 0.1); border: 1px solid rgba(56, 74, 153, 0.2); padding: 20px; border-radius: 16px; margin-bottom: 30px; text-align: left;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                                <td style="vertical-align: top; width: 30px; font-size: 20px;">📅</td>
                                <td style="font-size: 14px; color: #94a3b8; line-height: 1.4;">
                                    <strong style="color: #ffffff;">Cronograma de Aprendizaje:</strong><br>
                                    El curso se imparte de forma progresiva. <strong>Cada mes se habilitará un nuevo módulo</strong> con contenidos clave para tu protección y la de la CGR.
                                </td>
                            </tr>
                        </table>
                    </div>

                    <a href="${process.env.FRONTEND_URL}" class="button">Ingresar a la Plataforma</a>
                </div>
                <div class="footer">
                    &copy; 2026 Contraloría General de la República de Costa Rica<br>
                    Programa de Concientización en Ciberseguridad
                </div>
            </div>
        </body>
        </html>
        `;

        const attachments = [
            {
                filename: 'logo-cgr-blanco.png',
                path: path.join(assetsPath, 'Logotipo-CGR-blanco-transp.png'),
                cid: 'logo_institucional'
            }
        ];

        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: userEmail,
                subject: '🛡️ [OBLIGATORIO] Invitación: Programa de Concientización en Ciberseguridad CGR Segur@',
                html: htmlContent,
                attachments: attachments
            });
            logger.info(`Email de invitación enviado a: ${userEmail}`);
        } catch (error) {
            logger.error(`Error enviando email de invitación a ${userEmail}:`, error);
        }
    }

    /**
     * Envía un correo de recordatorio a usuarios con avance crítico
     */
    async sendRiskReminder(userEmail, userName, progress) {
        const path = require('path');
        const assetsPath = path.resolve(__dirname, '../assets/images');

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: 'Segoe UI', sans-serif; background-color: #04060b; margin: 0; padding: 0; color: #ffffff; }
                .container { max-width: 600px; margin: 20px auto; background-color: #0b0f1c; border-radius: 24px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); }
                .header { background-color: #0d111d; padding: 40px 20px; text-align: center; border-bottom: 2px solid #ef4444; }
                .logo-institucional { width: 120px; }
                .content { padding: 40px; text-align: center; }
                h1 { font-size: 26px; font-weight: 800; color: #ffffff; margin-bottom: 20px; }
                p { color: #94a3b8; line-height: 1.6; font-size: 16px; margin-bottom: 30px; }
                .progress-box { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); padding: 20px; border-radius: 16px; margin-bottom: 30px; }
                .progress-value { color: #ef4444; font-size: 32px; font-weight: 900; }
                .button { display: inline-block; background-color: #ef4444; color: #ffffff !important; text-decoration: none; padding: 16px 40px; border-radius: 16px; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
                .footer { background-color: rgba(0,0,0,0.2); padding: 30px; text-align: center; font-size: 11px; color: #475569; border-top: 1px solid rgba(255,255,255,0.05); }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="cid:logo_institucional" alt="CGR" class="logo-institucional">
                    <div style="margin-top: 10px;">
                        <span style="color: #ffffff; font-size: 38px; font-weight: 900;">CGR</span>
                        <span style="color: #ef4444; font-size: 38px; font-weight: 900;"> SEGUR@</span>
                    </div>
                </div>
                <div class="content">
                    <h1>¡Atención, ${userName}!</h1>
                    <p>Hemos notado que tu avance en el <strong>Programa de Concientización CGR Segur@</strong> se encuentra en un nivel crítico.</p>
                    
                    <div class="progress-box">
                        <div style="text-transform: uppercase; font-size: 10px; font-weight: 800; color: #94a3b8; letter-spacing: 1px; margin-bottom: 5px;">Tu avance actual</div>
                        <div class="progress-value">${progress}%</div>
                    </div>

                    <p>La ciberseguridad es responsabilidad de todos y el cumplimiento de este programa es de carácter <strong>obligatorio</strong>.</p>
                    <p>Recuerda que <strong>cada mes se libera un nuevo módulo</strong> de capacitación. Te invitamos a retomar el curso y completar los contenidos pendientes para fortalecer nuestras defensas institucionales.</p>
                    <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Continuar mi Capacitación</a>
                </div>
                <div class="footer">
                    &copy; 2026 Contraloría General de la República de Costa Rica<br>
                    Programa de Concientización en Ciberseguridad
                </div>
            </div>
        </body>
        </html>
        `;

        const attachments = [
            {
                filename: 'logo-cgr-blanco.png',
                path: path.join(assetsPath, 'Logotipo-CGR-blanco-transp.png'),
                cid: 'logo_institucional'
            }
        ];

        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: userEmail,
                subject: '⚠️ Recordatorio: Tu avance en CGR Segur@ es crítico',
                html: htmlContent,
                attachments: attachments
            });
            logger.info(`Email de alerta de riesgo enviado a: ${userEmail}`);
        } catch (error) {
            logger.error(`Error enviando email de alerta a ${userEmail}:`, error);
        }
    }
    /**
     * Notifica al instructor cuando un usuario envía una tarea
     */
    async sendAssignmentSubmissionNotification(adminEmail, userData, assignmentData) {
        const path = require('path');
        const assetsPath = path.resolve(__dirname, '../assets/images');

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: 'Segoe UI', sans-serif; background-color: #04060b; margin: 0; padding: 0; color: #ffffff; }
                .container { max-width: 600px; margin: 20px auto; background-color: #0b0f1c; border-radius: 24px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); }
                .header { background-color: #0d111d; padding: 40px 20px; text-align: center; border-bottom: 2px solid #384A99; }
                .logo-institucional { width: 120px; }
                .content { padding: 40px; }
                h1 { font-size: 22px; font-weight: 800; color: #ffffff; margin-bottom: 20px; text-align: center; }
                .info-box { background: rgba(56, 74, 153, 0.1); border: 1px solid rgba(56, 74, 153, 0.2); padding: 25px; border-radius: 20px; margin-bottom: 30px; }
                .info-row { margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px; }
                .info-row:last-child { border-bottom: none; }
                .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; font-weight: 800; margin-bottom: 4px; }
                .value { font-size: 16px; color: #ffffff; font-weight: 600; }
                .button { display: block; text-align: center; background-color: #384A99; color: #ffffff !important; text-decoration: none; padding: 18px; border-radius: 16px; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
                .footer { background-color: rgba(0,0,0,0.2); padding: 30px; text-align: center; font-size: 11px; color: #475569; border-top: 1px solid rgba(255,255,255,0.05); }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="cid:logo_institucional" alt="CGR" class="logo-institucional">
                    <div style="margin-top: 10px;">
                        <span style="color: #ffffff; font-size: 30px; font-weight: 900;">CGR</span>
                        <span style="color: #EF8843; font-size: 30px; font-weight: 900;"> SEGUR@</span>
                    </div>
                </div>
                <div class="content">
                    <h1>Nueva Tarea Recibida</h1>
                    <p style="color: #94a3b8; text-align: center; margin-bottom: 30px;">Se ha registrado una nueva entrega en la plataforma de capacitación.</p>
                    
                    <div class="info-box">
                        <div class="info-row">
                            <div class="label">Funcionario</div>
                            <div class="value">${userData.name}</div>
                        </div>
                        <div class="info-row">
                            <div class="label">Correo</div>
                            <div class="value">${userData.email}</div>
                        </div>
                        <div class="info-row">
                            <div class="label">Módulo / Lección</div>
                            <div class="value">${assignmentData.module} / ${assignmentData.lesson}</div>
                        </div>
                        <div class="info-row">
                            <div class="label">Tarea</div>
                            <div class="value">${assignmentData.title}</div>
                        </div>
                    </div>

                    <a href="${process.env.FRONTEND_URL}/admin/assignments" class="button">Ir a Revisar Entregas</a>
                </div>
                <div class="footer">
                    &copy; 2026 Contraloría General de la República de Costa Rica<br>
                    Sistema de Notificaciones Automáticas CGR Segur@
                </div>
            </div>
        </body>
        </html>
        `;

        const attachments = [{
            filename: 'logo-cgr-blanco.png',
            path: path.join(assetsPath, 'Logotipo-CGR-blanco-transp.png'),
            cid: 'logo_institucional'
        }];

        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: adminEmail,
                subject: `📝 Nueva entrega: ${userData.name} - ${assignmentData.title}`,
                html: htmlContent,
                attachments: attachments
            });
            logger.info(`Notificación de tarea enviada al instructor: ${adminEmail}`);
        } catch (error) {
            logger.error(`Error enviando notificación de tarea a ${adminEmail}:`, error);
        }
    }

    /**
     * Notifica al usuario cuando su tarea ha sido calificada
     */
    async sendAssignmentGradedNotification(userEmail, userName, assignmentData) {
        const path = require('path');
        const assetsPath = path.resolve(__dirname, '../assets/images');
        const isApproved = assignmentData.status === 'approved';
        const statusText = isApproved ? 'APROBADA' : 'RECHAZADA';
        const statusColor = isApproved ? '#22c55e' : '#ef4444';
        const icon = isApproved ? '✅' : '❌';

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: 'Segoe UI', sans-serif; background-color: #04060b; margin: 0; padding: 0; color: #ffffff; }
                .container { max-width: 600px; margin: 20px auto; background-color: #0b0f1c; border-radius: 24px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); }
                .header { background-color: #0d111d; padding: 40px 20px; text-align: center; border-bottom: 2px solid ${statusColor}; }
                .logo-institucional { width: 120px; }
                .content { padding: 40px; }
                h1 { font-size: 24px; font-weight: 800; color: #ffffff; margin-bottom: 10px; text-align: center; }
                .status-badge { display: inline-block; padding: 6px 16px; border-radius: 10px; background: ${statusColor}20; color: ${statusColor}; font-weight: 900; font-size: 14px; letter-spacing: 1px; margin-bottom: 30px; border: 1px solid ${statusColor}40; }
                .info-box { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); padding: 25px; border-radius: 20px; margin-bottom: 30px; }
                .info-row { margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px; }
                .info-row:last-child { border-bottom: none; }
                .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; font-weight: 800; margin-bottom: 4px; }
                .value { font-size: 16px; color: #ffffff; font-weight: 600; }
                .feedback-box { background: #1a1f2e; border-left: 4px solid #EF8843; padding: 20px; border-radius: 0 16px 16px 0; margin-top: 20px; }
                .button { display: block; text-align: center; background-color: #384A99; color: #ffffff !important; text-decoration: none; padding: 18px; border-radius: 16px; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
                .footer { background-color: rgba(0,0,0,0.2); padding: 30px; text-align: center; font-size: 11px; color: #475569; border-top: 1px solid rgba(255,255,255,0.05); }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="cid:logo_institucional" alt="CGR" class="logo-institucional">
                    <div style="margin-top: 10px;">
                        <span style="color: #ffffff; font-size: 30px; font-weight: 900;">CGR</span>
                        <span style="color: #EF8843; font-size: 30px; font-weight: 900;"> SEGUR@</span>
                    </div>
                </div>
                <div class="content" style="text-align: center;">
                    <h1>Tu tarea ha sido calificada</h1>
                    <div class="status-badge">${icon} ${statusText}</div>
                    
                    <div class="info-box" style="text-align: left;">
                        <div class="info-row">
                            <div class="label">Tarea</div>
                            <div class="value">${assignmentData.title}</div>
                        </div>
                        <div class="info-row">
                            <div class="label">Nota Final</div>
                            <div class="value" style="color: ${statusColor}; font-size: 24px; font-weight: 900;">${assignmentData.grade}</div>
                        </div>
                        ${assignmentData.feedback ? `
                        <div class="feedback-box">
                            <div class="label" style="color: #EF8843;">Comentario del Instructor</div>
                            <div class="value" style="font-weight: 400; font-size: 14px; color: #cbd5e1; margin-top: 5px;">${assignmentData.feedback}</div>
                        </div>
                        ` : ''}
                    </div>

                    <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Ver mi progreso</a>
                </div>
                <div class="footer">
                    &copy; 2026 Contraloría General de la República de Costa Rica<br>
                    Programa de Concientización en Ciberseguridad
                </div>
            </div>
        </body>
        </html>
        `;

        const attachments = [{
            filename: 'logo-cgr-blanco.png',
            path: path.join(assetsPath, 'Logotipo-CGR-blanco-transp.png'),
            cid: 'logo_institucional'
        }];

        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: userEmail,
                subject: `${icon} Tu tarea "${assignmentData.title}" ha sido calificada - ${statusText}`,
                html: htmlContent,
                attachments: attachments
            });
            logger.info(`Notificación de calificación enviada a: ${userEmail}`);
        } catch (error) {
            logger.error(`Error enviando notificación de calificación a ${userEmail}:`, error);
        }
    }

    async sendDriveAuditReportNotification(userEmail, userName, reportUrl, stats) {
        const path = require('path');
        const fs = require('fs');
        const assetsPath = path.resolve(__dirname, '../assets/images');

        const { totalScanned = 0, riskCount = 0, points = 100, durationText = 'N/A' } = stats || {};

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #04060b; margin: 0; padding: 0; color: #ffffff; }
                .container { max-width: 600px; margin: 20px auto; background-color: #0b0f1c; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
                .header { background-color: #0d111d; padding: 40px 20px; text-align: center; border-bottom: 2px solid #EF8843; }
                .logo-institucional { width: 120px; margin-bottom: 20px; }
                .content { padding: 40px; text-align: center; }
                .status-badge { display: inline-block; padding: 6px 16px; border-radius: 10px; background: rgba(34, 197, 94, 0.1); color: #22c55e; font-weight: 900; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 25px; border: 1px solid rgba(34, 197, 94, 0.2); }
                h1 { font-size: 26px; margin: 0 0 15px 0; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; }
                p { color: #94a3b8; line-height: 1.6; font-size: 15px; margin-bottom: 25px; }
                .info-box { background: #111627; border: 1px solid rgba(255,255,255,0.05); padding: 25px; border-radius: 20px; margin-bottom: 30px; text-align: left; }
                .info-row { display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 10px; }
                .info-row:last-child { border-bottom: none; padding-bottom: 0; margin-bottom: 0; }
                .label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 800; }
                .value { font-size: 14px; color: #ffffff; font-weight: 700; }
                .value.points-won { color: #f59e0b; }
                .value.risks-found { color: ${riskCount > 0 ? '#ef4444' : '#10b981'}; }
                .button { display: inline-block; background-color: #384A99; color: #ffffff !important; text-decoration: none; padding: 16px 40px; border-radius: 16px; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(56, 74, 153, 0.3); }
                .footer { background-color: rgba(0,0,0,0.2); padding: 30px; text-align: center; font-size: 11px; color: #475569; border-top: 1px solid rgba(255,255,255,0.05); }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="cid:logo_institucional" alt="CGR" class="logo-institucional">
                    <div style="margin-top: 10px;">
                        <span style="color: #ffffff; font-size: 38px; font-weight: 900; letter-spacing: -1.5px;">CGR</span>
                        <span style="color: #EF8843; font-size: 38px; font-weight: 900; letter-spacing: -1.5px;"> SEGUR@</span>
                    </div>
                    <div style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">
                        Programa de Concientización en Ciberseguridad
                    </div>
                </div>
                <div class="content">
                    <div class="status-badge">Análisis Completado</div>
                    <h1>¡Tu auditoría de Drive está lista!</h1>
                    <p>Hola, ${userName}. El proceso de escaneo y auditoría de seguridad sobre tu cuenta de Google Drive institucional ha finalizado exitosamente. Aquí tienes un resumen del análisis:</p>
                    
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin-bottom: 30px; background-color: #111627; border: 1px solid rgba(255,255,255,0.05); border-radius: 20px;">
                        <tr>
                            <td align="left" style="padding: 18px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 800; border-bottom: 1px solid rgba(255,255,255,0.03); text-align: left; width: 45%;">Archivos analizados:</td>
                            <td align="right" style="padding: 18px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; color: #ffffff; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.03); text-align: right; width: 55%;">${totalScanned.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td align="left" style="padding: 18px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 800; border-bottom: 1px solid rgba(255,255,255,0.03); text-align: left; width: 45%;">Riesgos detectados:</td>
                            <td align="right" style="padding: 18px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 700; color: ${riskCount > 0 ? '#ef4444' : '#10b981'}; border-bottom: 1px solid rgba(255,255,255,0.03); text-align: right; width: 55%;">${riskCount > 0 ? `${riskCount.toLocaleString()} archivos con riesgo` : '0 riesgos encontrados'}</td>
                        </tr>
                        <tr>
                            <td align="left" style="padding: 18px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 800; ${points > 0 ? 'border-bottom: 1px solid rgba(255,255,255,0.03);' : ''} text-align: left; width: 45%;">Duración del proceso:</td>
                            <td align="right" style="padding: 18px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; color: #ffffff; font-weight: 700; ${points > 0 ? 'border-bottom: 1px solid rgba(255,255,255,0.03);' : ''} text-align: right; width: 55%;">${durationText}</td>
                        </tr>
                        ${points > 0 ? `
                        <tr>
                            <td align="left" style="padding: 18px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 800; text-align: left; width: 45%;">Recompensa obtenida:</td>
                            <td align="right" style="padding: 18px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; color: #f59e0b; font-weight: 700; text-align: right; width: 55%;">🏆 +${points} PTS GANADOS</td>
                        </tr>
                        ` : ''}
                    </table>

                    <p>Te invitamos a ingresar al panel para ver los detalles específicos sobre los accesos públicos de tus archivos y las recomendaciones de seguridad.</p>
                    
                    <a href="${reportUrl}" class="button">Ver Reporte Detallado</a>
                </div>
                <div class="footer">
                    &copy; 2026 Contraloría General de la República de Costa Rica<br>
                    Programa de Concientización en Ciberseguridad
                </div>
            </div>
        </body>
        </html>
        `;

        const attachments = [
            {
                filename: 'logo-cgr-blanco.png',
                path: path.join(assetsPath, 'Logotipo-CGR-blanco-transp.png'),
                cid: 'logo_institucional'
            }
        ];

        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: userEmail,
                subject: `🛡️ Drive Auditor: El análisis de seguridad está listo (${riskCount > 0 ? `${riskCount} riesgos` : 'Sin riesgos'})`,
                html: htmlContent,
                attachments: attachments
            });
            logger.info(`Email de auditoría Drive enviado a: ${userEmail}`);
        } catch (error) {
            logger.error(`Error enviando email de auditoría a ${userEmail}:`, error);
        }
    }

    async sendDriveAuditFileWarning(ownerEmail, ownerName, fileName, sharingLevel, fileLink, auditorName, auditorEmail) {
        const path = require('path');
        const fs = require('fs');
        const assetsPath = path.resolve(__dirname, '../assets/images');

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #04060b; margin: 0; padding: 0; color: #ffffff; }
                .container { max-width: 600px; margin: 20px auto; background-color: #0b0f1c; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
                .header { background-color: #0d111d; padding: 40px 20px; text-align: center; border-bottom: 2px solid #EF8843; }
                .logo-institucional { width: 120px; margin-bottom: 20px; }
                .content { padding: 40px; text-align: left; }
                .status-badge { display: inline-block; padding: 6px 16px; border-radius: 10px; background: rgba(239, 68, 68, 0.1); color: #ef4444; font-weight: 900; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 25px; border: 1px solid rgba(239, 68, 68, 0.2); }
                h1 { font-size: 24px; margin: 0 0 15px 0; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; }
                p { color: #94a3b8; line-height: 1.6; font-size: 15px; margin-bottom: 25px; }
                .info-box { background: #111627; border: 1px solid rgba(255,255,255,0.05); padding: 25px; border-radius: 20px; margin-bottom: 30px; }
                .info-row { display: flex; flex-direction: column; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 10px; }
                .info-row:last-child { border-bottom: none; padding-bottom: 0; margin-bottom: 0; }
                .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 800; margin-bottom: 5px; }
                .value { font-size: 14px; color: #ffffff; font-weight: 700; word-break: break-all; }
                .value.warning-level { color: #f59e0b; }
                .button { display: inline-block; background-color: #ef4444; color: #ffffff !important; text-decoration: none; padding: 14px 30px; border-radius: 16px; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3); }
                .footer { background-color: rgba(0,0,0,0.2); padding: 30px; text-align: center; font-size: 11px; color: #475569; border-top: 1px solid rgba(255,255,255,0.05); }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="cid:logo_institucional" alt="CGR" class="logo-institucional">
                    <div style="margin-top: 10px;">
                        <span style="color: #ffffff; font-size: 38px; font-weight: 900; letter-spacing: -1.5px;">CGR</span>
                        <span style="color: #EF8843; font-size: 38px; font-weight: 900; letter-spacing: -1.5px;"> SEGUR@</span>
                    </div>
                    <div style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">
                        Programa de Concientización en Ciberseguridad
                    </div>
                </div>
                <div class="content">
                    <div style="text-align: center;">
                        <div class="status-badge">Alerta de Seguridad</div>
                    </div>
                    <h1>Revisión de Archivo Compartido</h1>
                    <p>Estimado(a) funcionario(a) <strong>${ownerName}</strong>,</p>
                    <p>Se le notifica que el funcionario <strong>${auditorName}</strong> (${auditorEmail}) ha identificado un archivo de su propiedad con un nivel de exposición que podría representar un riesgo para la seguridad de la información de la institución.</p>
                    <p>Por favor, ingrese al siguiente enlace y <strong>valore si es necesario que este archivo continúe compartido</strong> con los permisos actuales:</p>
                    
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin-bottom: 30px; background-color: #111627; border: 1px solid rgba(255,255,255,0.05); border-radius: 20px;">
                        <tr>
                            <td style="padding: 20px 25px; border-bottom: 1px solid rgba(255,255,255,0.03);">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td width="160" valign="top" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 800; padding-right: 10px; line-height: 20px;">Archivo:</td>
                                        <td valign="top" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; color: #ffffff; font-weight: 700; word-break: break-all; line-height: 20px;">${fileName}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px 25px;">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td width="160" valign="top" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 800; padding-right: 10px; line-height: 20px;">Nivel de Exposición:</td>
                                        <td valign="top" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; color: #f59e0b; font-weight: 700; line-height: 20px;">${sharingLevel}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>

                    <div style="text-align: center; margin-top: 10px; margin-bottom: 10px;">
                        <a href="${fileLink}" class="button" target="_blank">Revisar Archivo</a>
                    </div>
                    
                    <p style="font-size: 13px; color: #64748b; margin-top: 20px;"><em>Nota: Si considera que el archivo debe seguir compartido, recuerde asegurarse de que solo las personas autorizadas tengan acceso y evite compartir de forma pública o generalizada a través de enlaces abiertos.</em></p>
                </div>
                <div class="footer">
                    &copy; 2026 Contraloría General de la República de Costa Rica<br>
                    Programa de Concientización en Ciberseguridad
                </div>
            </div>
        </body>
        </html>
        `;

        const attachments = [
            {
                filename: 'logo-cgr-blanco.png',
                path: path.join(assetsPath, 'Logotipo-CGR-blanco-transp.png'),
                cid: 'logo_institucional'
            }
        ];

        try {
            let systemEmail = 'seguridad.informacion@cgr.go.cr';
            const fromEnv = process.env.EMAIL_FROM || '';
            const match = fromEnv.match(/<([^>]+)>/);
            if (match && match[1]) {
                systemEmail = match[1];
            }

            await this.transporter.sendMail({
                from: `"${auditorName} (vía CGR Segura)" <${systemEmail}>`,
                replyTo: auditorEmail,
                to: ownerEmail,
                subject: `🛡️ Alerta de Seguridad: Valore si sigue compartiendo "${fileName}"`,
                html: htmlContent,
                attachments: attachments
            });
            logger.info(`Email de alerta enviado a ${ownerEmail} por el archivo "${fileName}"`);
            return true;
        } catch (error) {
            logger.error(`Error enviando email de alerta a ${ownerEmail}:`, error);
            throw error;
        }
    }
}

module.exports = new EmailService();
