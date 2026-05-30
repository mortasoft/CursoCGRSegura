/**
 * fix_duplicate_points.js
 *
 * Script de correccion para eliminar puntos duplicados causados por dos bugs:
 *
 * BUG 1 - quiz_passed: El campo pointsAlreadyAwarded siempre era 0 debido a un
 *          acceso incorrecto al resultado de la query (`?.[0]?.total` en vez de `?.total`).
 *          Esto hacia que cada reintento exitoso de una evaluacion otorgara los puntos
 *          completos de nuevo, en lugar de otorgar solo la diferencia respecto al maximo anterior.
 *
 * BUG 2 - lesson_completed: No se validaba si la leccion ya estaba completada antes
 *          de insertar el registro de actividad, permitiendo duplicados si el usuario
 *          (o la UI) llamaba al endpoint de finalizacion mas de una vez.
 *
 * MODO DE USO:
 *   node fix_duplicate_points.js                    <- Simulacion (dry-run, solo modulo 2)
 *   node fix_duplicate_points.js --apply            <- Aplica cambios en modulo 2
 *   node fix_duplicate_points.js --module=all       <- Dry-run en TODOS los modulos
 *   node fix_duplicate_points.js --module=all --apply  <- Aplica cambios en todos los modulos
 *
 * SIEMPRE ejecutar primero sin --apply para revisar el reporte.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const db = require('../config/database');

const DRY_RUN  = !process.argv.includes('--apply');
const ALL_MODS = process.argv.includes('--module=all');
const TARGET_MODULE_ID = 2; // Modulo 2: Proteccion de Datos y Confidencialidad en la CGR

// ─────────────────────────────────────────────────────────────
// Obtener IDs de lecciones y quizzes del modulo objetivo
// ─────────────────────────────────────────────────────────────

async function getModuleScope() {
    if (ALL_MODS) {
        return { lessonIds: null, quizIds: null, label: 'TODOS LOS MODULOS' };
    }

    const lessons = await db.query(
        `SELECT id FROM lessons WHERE module_id = ?`,
        [TARGET_MODULE_ID]
    );
    const quizzes = await db.query(
        `SELECT id FROM quizzes WHERE module_id = ?`,
        [TARGET_MODULE_ID]
    );

    const [moduleInfo] = await db.query(
        `SELECT title FROM modules WHERE id = ?`,
        [TARGET_MODULE_ID]
    );

    const lessonIds = lessons.map(l => l.id);
    const quizIds   = quizzes.map(q => q.id);

    return {
        lessonIds,
        quizIds,
        label: `Modulo ${TARGET_MODULE_ID}: ${moduleInfo ? moduleInfo.title : ''}`
    };
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

async function runQuery(sql, params = []) {
    if (DRY_RUN && /^(DELETE|UPDATE|INSERT)/i.test(sql.trim())) {
        console.log('  [DRY-RUN] Omitido:', sql.replace(/\s+/g, ' ').slice(0, 120));
        return { affectedRows: 0 };
    }
    return db.query(sql, params);
}

function separator() {
    console.log('─'.repeat(72));
}

function buildInClause(ids) {
    return ids.map(() => '?').join(', ');
}

// ─────────────────────────────────────────────────────────────
// FIX 1: Puntos duplicados en quiz_passed
// ─────────────────────────────────────────────────────────────

async function fixQuizPassedDuplicates(quizIds) {
    separator();
    console.log('FIX 1: Corrección de duplicados en "quiz_passed"');
    separator();

    let whereClause = `WHERE activity_type = 'quiz_passed'`;
    let params = [];

    if (quizIds !== null) {
        if (quizIds.length === 0) {
            console.log('  [SKIP] El modulo no tiene quizzes asociados.');
            return 0;
        }
        whereClause += ` AND reference_id IN (${buildInClause(quizIds)})`;
        params = quizIds;
        console.log(`  Filtrando quizzes: [${quizIds.join(', ')}]`);
    }

    const duplicates = await db.query(`
        SELECT
            user_id,
            reference_id AS quiz_id,
            COUNT(*)              AS qty,
            SUM(points_earned)    AS total_awarded,
            MAX(points_earned)    AS correct_points,
            SUM(points_earned) - MAX(points_earned) AS excess_points
        FROM gamification_activities
        ${whereClause}
        GROUP BY user_id, reference_id
        HAVING COUNT(*) > 1
        ORDER BY excess_points DESC
    `, params);

    if (duplicates.length === 0) {
        console.log('  [OK] No se encontraron duplicados en quiz_passed.');
        return 0;
    }

    let totalUsersAffected = duplicates.length;
    let totalExcess = 0;

    console.log(`  Usuarios/quizzes afectados: ${totalUsersAffected}`);

    for (const row of duplicates) {
        const user_id       = parseInt(row.user_id);
        const quiz_id       = parseInt(row.quiz_id);
        const qty           = parseInt(row.qty);
        const total_awarded = parseInt(row.total_awarded);
        const correct_points = parseInt(row.correct_points);
        const excess_points  = parseInt(row.excess_points);
        totalExcess += excess_points;

        console.log(`\n  Usuario ${user_id} | Quiz ${quiz_id}`);
        console.log(`    Registros actuales : ${qty}`);
        console.log(`    Puntos otorgados   : ${total_awarded}`);
        console.log(`    Puntos correctos   : ${correct_points}`);
        console.log(`    Exceso a descontar : ${excess_points}`);

        // Conservar el de mayor puntaje (empate: el mas antiguo)
        const allRows = await db.query(
            `SELECT id, points_earned FROM gamification_activities
             WHERE user_id = ? AND activity_type = 'quiz_passed' AND reference_id = ?
             ORDER BY points_earned DESC, id ASC`,
            [user_id, quiz_id]
        );

        const keepId    = allRows[0].id;
        const removeIds = allRows.slice(1).map(r => r.id);

        console.log(`    Conservar ID  : ${keepId}`);
        console.log(`    Eliminar IDs  : ${removeIds.join(', ')}`);

        for (const rid of removeIds) {
            await runQuery(`DELETE FROM gamification_activities WHERE id = ?`, [rid]);
        }

        if (excess_points > 0) {
            await runQuery(
                `UPDATE user_points SET points = GREATEST(0, points - ?) WHERE user_id = ?`,
                [excess_points, user_id]
            );
        }
    }

    separator();
    console.log(`  TOTAL exceso descontado por quiz_passed: ${totalExcess} pts en ${totalUsersAffected} usuario(s)`);
    return totalExcess;
}

// ─────────────────────────────────────────────────────────────
// FIX 2: Puntos duplicados en lesson_completed
// ─────────────────────────────────────────────────────────────

async function fixLessonCompletedDuplicates(lessonIds) {
    separator();
    console.log('FIX 2: Corrección de duplicados en "lesson_completed"');
    separator();

    let whereClause = `WHERE activity_type = 'lesson_completed'`;
    let params = [];

    if (lessonIds !== null) {
        if (lessonIds.length === 0) {
            console.log('  [SKIP] El modulo no tiene lecciones asociadas.');
            return 0;
        }
        whereClause += ` AND reference_id IN (${buildInClause(lessonIds)})`;
        params = lessonIds;
        console.log(`  Filtrando lecciones: [${lessonIds.join(', ')}]`);
    }

    const duplicates = await db.query(`
        SELECT
            user_id,
            reference_id   AS lesson_id,
            COUNT(*)       AS qty,
            SUM(points_earned)                           AS total_awarded,
            (SELECT points_earned
             FROM gamification_activities ga2
             WHERE ga2.user_id = ga.user_id
               AND ga2.reference_id = ga.reference_id
               AND ga2.activity_type = 'lesson_completed'
             ORDER BY ga2.id ASC LIMIT 1)                AS first_entry_points
        FROM gamification_activities ga
        ${whereClause}
        GROUP BY user_id, reference_id
        HAVING COUNT(*) > 1
        ORDER BY (SUM(points_earned) - first_entry_points) DESC
    `, params);

    if (duplicates.length === 0) {
        console.log('  [OK] No se encontraron duplicados en lesson_completed.');
        return 0;
    }

    let totalExcess = 0;
    let totalUsersAffected = new Set();

    console.log(`  Usuarios/lecciones afectados: ${duplicates.length}`);

    for (const row of duplicates) {
        const user_id          = parseInt(row.user_id);
        const lesson_id        = parseInt(row.lesson_id);
        const qty              = parseInt(row.qty);
        const total_awarded    = parseInt(row.total_awarded);
        const first_entry_points = parseInt(row.first_entry_points);
        const excess = total_awarded - first_entry_points;
        totalExcess += excess;
        totalUsersAffected.add(user_id);

        console.log(`\n  Usuario ${user_id} | Leccion ${lesson_id}`);
        console.log(`    Registros actuales : ${qty}`);
        console.log(`    Puntos otorgados   : ${total_awarded}`);
        console.log(`    Puntos correctos   : ${first_entry_points}`);
        console.log(`    Exceso a descontar : ${excess}`);

        // Conservar el mas antiguo (menor id)
        const allRows = await db.query(
            `SELECT id, points_earned, created_at FROM gamification_activities
             WHERE user_id = ? AND activity_type = 'lesson_completed' AND reference_id = ?
             ORDER BY id ASC`,
            [user_id, lesson_id]
        );

        const keepId    = allRows[0].id;
        const removeIds = allRows.slice(1).map(r => r.id);

        console.log(`    Conservar ID  : ${keepId} (${allRows[0].created_at})`);
        console.log(`    Eliminar IDs  : ${removeIds.join(', ')}`);

        for (const rid of removeIds) {
            await runQuery(`DELETE FROM gamification_activities WHERE id = ?`, [rid]);
        }

        if (excess > 0) {
            await runQuery(
                `UPDATE user_points SET points = GREATEST(0, points - ?) WHERE user_id = ?`,
                [excess, user_id]
            );
        }
    }

    separator();
    console.log(`  TOTAL exceso descontado por lesson_completed: ${totalExcess} pts en ${totalUsersAffected.size} usuario(s)`);
    return totalExcess;
}

// ─────────────────────────────────────────────────────────────
// Re-sincronizar niveles de usuarios afectados por el modulo
// ─────────────────────────────────────────────────────────────

async function resyncLevels(lessonIds, quizIds) {
    separator();
    console.log('Resincronizando niveles de usuarios afectados...');
    separator();

    let userQuery;
    let userParams = [];

    if (lessonIds === null && quizIds === null) {
        // Todos los modulos
        userQuery = `SELECT DISTINCT user_id FROM gamification_activities
                     WHERE activity_type IN ('quiz_passed', 'lesson_completed')`;
    } else {
        // Solo usuarios con actividad en las lecciones/quizzes del modulo
        const parts = [];
        if (lessonIds && lessonIds.length > 0) {
            parts.push(`(activity_type = 'lesson_completed' AND reference_id IN (${buildInClause(lessonIds)}))`);
            userParams.push(...lessonIds);
        }
        if (quizIds && quizIds.length > 0) {
            parts.push(`(activity_type = 'quiz_passed' AND reference_id IN (${buildInClause(quizIds)}))`);
            userParams.push(...quizIds);
        }
        userQuery = `SELECT DISTINCT user_id FROM gamification_activities WHERE ${parts.join(' OR ')}`;
    }

    const affected = await db.query(userQuery, userParams);
    const levels   = await db.query(`SELECT * FROM gamification_levels ORDER BY min_points ASC`);

    if (!levels || levels.length === 0) {
        console.log('  [SKIP] No se encontro tabla de niveles o esta vacia.');
        return;
    }

    let updated = 0;
    for (const { user_id } of affected) {
        const [userPoints] = await db.query(
            `SELECT points FROM user_points WHERE user_id = ?`,
            [user_id]
        );
        if (!userPoints) continue;

        const pts = userPoints.points || 0;
        let correctLevel = levels[0].name;
        for (const lvl of levels) {
            if (pts >= lvl.min_points) correctLevel = lvl.name;
        }

        await runQuery(
            `UPDATE user_points SET level = ? WHERE user_id = ?`,
            [correctLevel, user_id]
        );
        updated++;
    }

    console.log(`  Niveles revisados: ${updated} usuario(s)`);
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

async function main() {
    const scope = await getModuleScope();

    console.log('');
    console.log('================================================================');
    console.log(`  ALCANCE : ${scope.label}`);
    if (DRY_RUN) {
        console.log('  MODO    : DRY-RUN (simulacion, ningun cambio se aplicara)');
        console.log('  Para aplicar: agregar flag --apply');
    } else {
        console.log('  MODO    : APPLY (los cambios se aplicaran en la base de datos)');
    }
    console.log('================================================================');
    console.log('');

    try {
        const excessQuiz   = await fixQuizPassedDuplicates(scope.quizIds);
        const excessLesson = await fixLessonCompletedDuplicates(scope.lessonIds);

        if (!DRY_RUN) {
            await resyncLevels(scope.lessonIds, scope.quizIds);
        }

        separator();
        console.log('RESUMEN FINAL');
        separator();
        console.log(`  Alcance                : ${scope.label}`);
        console.log(`  Exceso quiz_passed     : ${excessQuiz} pts`);
        console.log(`  Exceso lesson_completed: ${excessLesson} pts`);
        console.log(`  TOTAL EXCESO           : ${excessQuiz + excessLesson} pts`);
        console.log('');
        if (DRY_RUN) {
            console.log('  Ningun cambio fue aplicado. Ejecute con --apply para confirmar.');
        } else {
            console.log('  Corrección completada. Revise los balances en el panel de admin.');
        }
        console.log('');
    } catch (err) {
        console.error('ERROR CRITICO durante la corrección:', err);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

main();
