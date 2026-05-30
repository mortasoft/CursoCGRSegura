/**
 * find_orphaned_resources.js
 *
 * Script para identificar y eliminar cuestionarios (quizzes) y encuestas (surveys) huérfanos
 * en la base de datos (que no están asociados a ningún bloque de contenido activo en lesson_contents).
 *
 * MODO DE USO:
 *   node find_orphaned_resources.js           <- Simulación (dry-run)
 *   node find_orphaned_resources.js --apply   <- Aplica los cambios y elimina los huérfanos
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const db = require('../config/database');

const DRY_RUN = !process.argv.includes('--apply');

function separator() {
    console.log('------------------------------------------------------------------------');
}

async function main() {
    console.log('');
    console.log('================================================================');
    console.log('  BUSQUEDA DE RECURSOS HUERFANOS (QUIZZES Y SURVEYS)');
    if (DRY_RUN) {
        console.log('  MODO    : DRY-RUN (simulacion, ningun cambio se aplicara)');
        console.log('  Para aplicar: agregar flag --apply');
    } else {
        console.log('  MODO    : APPLY (los cambios se aplicaran en la base de datos)');
    }
    console.log('================================================================');
    console.log('');

    try {
        // -------------------------------------------------------------
        // 1. Cuestionarios (Quizzes) Huérfanos
        // -------------------------------------------------------------
        separator();
        console.log('Fase 1: Identificando cuestionarios (quizzes) huerfanos');
        separator();

        const orphanedQuizzes = await db.query(`
            SELECT q.id, q.title, q.module_id, q.lesson_id, m.title as module_title
            FROM quizzes q
            LEFT JOIN modules m ON q.module_id = m.id
            WHERE NOT EXISTS (
                SELECT 1 FROM lesson_contents lc
                WHERE lc.content_type = 'quiz'
                  AND JSON_VALUE(lc.data, '$.quiz_id') = q.id
            )
        `);

        if (orphanedQuizzes.length === 0) {
            console.log('  [OK] No se encontraron cuestionarios huerfanos.');
        } else {
            console.log(`  Se encontraron ${orphanedQuizzes.length} cuestionarios huerfanos:`);
            for (const q of orphanedQuizzes) {
                console.log(`    - ID: ${q.id} | Titulo: "${q.title}" | Modulo: ${q.module_id} (${q.module_title || 'N/A'}) | Lesson ID: ${q.lesson_id || 'NULL'}`);
            }

            if (!DRY_RUN) {
                for (const q of orphanedQuizzes) {
                    console.log(`    Eliminando cuestionario ID ${q.id}...`);
                    await db.query('DELETE FROM quizzes WHERE id = ?', [q.id]);
                }
                console.log(`  [SUCCESS] ${orphanedQuizzes.length} cuestionarios huerfanos eliminados.`);
            }
        }

        // -------------------------------------------------------------
        // 2. Encuestas (Surveys) Huérfanos
        // -------------------------------------------------------------
        console.log('');
        separator();
        console.log('Fase 2: Identificando encuestas (surveys) huerfanos');
        separator();

        const orphanedSurveys = await db.query(`
            SELECT s.id, s.title, s.module_id, s.lesson_id, m.title as module_title
            FROM surveys s
            LEFT JOIN modules m ON s.module_id = m.id
            WHERE NOT EXISTS (
                SELECT 1 FROM lesson_contents lc
                WHERE lc.content_type = 'survey'
                  AND JSON_VALUE(lc.data, '$.survey_id') = s.id
            )
        `);

        if (orphanedSurveys.length === 0) {
            console.log('  [OK] No se encontraron encuestas huerfanas.');
        } else {
            console.log(`  Se encontraron ${orphanedSurveys.length} encuestas huerfanas:`);
            for (const s of orphanedSurveys) {
                console.log(`    - ID: ${s.id} | Titulo: "${s.title}" | Modulo: ${s.module_id} (${s.module_title || 'N/A'}) | Lesson ID: ${s.lesson_id || 'NULL'}`);
            }

            if (!DRY_RUN) {
                for (const s of orphanedSurveys) {
                    console.log(`    Eliminando encuesta ID ${s.id}...`);
                    await db.query('DELETE FROM surveys WHERE id = ?', [s.id]);
                }
                console.log(`  [SUCCESS] ${orphanedSurveys.length} encuestas huerfanas eliminadas.`);
            }
        }

        console.log('');
        separator();
        console.log('RESUMEN');
        separator();
        console.log(`  Cuestionarios huerfanos: ${orphanedQuizzes.length}`);
        console.log(`  Encuestas huerfanas    : ${orphanedSurveys.length}`);
        console.log('');
        if (DRY_RUN) {
            console.log('  Ningun cambio fue aplicado. Ejecute con --apply para confirmar.');
        } else {
            console.log('  Limpieza completada exitosamente.');
        }
        console.log('');

    } catch (err) {
        console.error('ERROR CRITICO durante la busqueda/limpieza:', err);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

main();
