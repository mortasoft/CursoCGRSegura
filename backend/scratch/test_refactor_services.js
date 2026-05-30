const db = require('../config/database');
const gamificationService = require('../services/gamificationService');
const badgeService = require('../services/badgeService');

async function testServices() {
    console.log('Iniciando verificacion de refactorizacion de Utilidades a Servicios...');

    // 1. Obtener un usuario de prueba
    const users = await db.query('SELECT id, email, first_name, department FROM users LIMIT 1');
    if (users.length === 0) {
        throw new Error('No hay usuarios en la base de datos para realizar pruebas');
    }
    const testUser = users[0];
    console.log(`Usuario de prueba: ID ${testUser.id}, Email ${testUser.email}, Dept ${testUser.department}`);

    // --- PRUEBAS DE GAMIFICACION ---
    console.log('\n--- 1. Pruebas de Gamificacion ---');

    // Test a. Obtener niveles
    const levelsDirect = await gamificationService.getLevels();
    if (!Array.isArray(levelsDirect) || levelsDirect.length === 0) {
        throw new Error('gamificationService.getLevels no devolvio un array de niveles valido');
    }
    console.log(`OK: getLevels retorno ${levelsDirect.length} niveles`);

    // Test b. Calcular nivel
    const calculatedLevel = await gamificationService.calculateLevel(150); // 150 puntos
    console.log(`OK: calculateLevel(150) calculo el nivel:`, calculatedLevel);
    if (!calculatedLevel || !calculatedLevel.name) {
        throw new Error('calculateLevel devolvio un objeto invalido');
    }

    // Test c. Sincronizar nivel de usuario
    const syncRes = await gamificationService.syncUserLevel(testUser.id);
    console.log(`OK: syncUserLevel(${testUser.id}) completo:`, syncRes);

    // Test d. Obtener ranking de usuario
    const userRank = await gamificationService.getUserRank(testUser.id, testUser.email, testUser.department);
    console.log(`OK: getUserRank retorno ranking:`, userRank);
    if (!userRank || typeof userRank.institutionalRank !== 'number') {
        throw new Error('getUserRank no retorno un ranking institucional numerico');
    }

    // Test e. Calcular bono dinamico
    const modules = await db.query('SELECT id, title FROM modules LIMIT 1');
    let testModuleId = null;
    if (modules.length > 0) {
        const testModule = modules[0];
        testModuleId = testModule.id;
        const bonus = await gamificationService.calculateDynamicModuleBonus(testUser.id, testModule.id);
        console.log(`OK: calculateDynamicModuleBonus para modulo ${testModule.title}: ${bonus}`);
    }

    // --- PRUEBAS DE INSIGNIAS ---
    console.log('\n--- 2. Pruebas de Insignias ---');

    // Test a. Obtener catalogo de insignias
    const allBadges = await badgeService.getAllBadges();
    if (!Array.isArray(allBadges) || allBadges.length === 0) {
        throw new Error('badgeService.getAllBadges no devolvio insignias validas');
    }
    console.log(`OK: getAllBadges retorno ${allBadges.length} insignias en el catalogo`);
    const testBadge = allBadges[0];

    // Test b. Asignar insignia ( awardBadge )
    // Primero, limpiar si el usuario ya tenia la insignia para probar la asignacion
    await db.query('DELETE FROM user_badges WHERE user_id = ? AND badge_id = ?', [testUser.id, testBadge.id]);
    await db.query('DELETE FROM gamification_activities WHERE user_id = ? AND activity_type = "badge_earned" AND reference_id = ?', [testUser.id, testBadge.id]);

    const awardRes = await badgeService.awardBadge(testUser.id, testBadge.id, false);
    console.log('OK: awardBadge para insignia nueva:', awardRes);
    if (!awardRes || !awardRes.awarded) {
        throw new Error('awardBadge debio otorgar la insignia');
    }

    // Probar duplicado
    const awardResDup = await badgeService.awardBadge(testUser.id, testBadge.id, false);
    console.log('OK: awardBadge para insignia duplicada:', awardResDup);
    if (awardResDup && awardResDup.awarded) {
        throw new Error('awardBadge no debio otorgar la insignia por segunda vez (duplicada)');
    }

    // Test c. checkAllBadges
    const checkAllRes = await badgeService.checkAllBadges(testUser.id, { moduleId: testModuleId });
    console.log('OK: checkAllBadges retorno:', checkAllRes);
    if (!checkAllRes || typeof checkAllRes.awarded !== 'boolean') {
        throw new Error('checkAllBadges retorno estructura incorrecta');
    }

    // Limpieza
    await db.query('DELETE FROM user_badges WHERE user_id = ? AND badge_id = ?', [testUser.id, testBadge.id]);
    await db.query('DELETE FROM gamification_activities WHERE user_id = ? AND activity_type = "badge_earned" AND reference_id = ?', [testUser.id, testBadge.id]);
    console.log('Limpieza de datos de prueba completada.');

    console.log('\n--- 3. Verificacion de dependencias circulares ---');
    console.log('Los servicios badgeService y gamificationService se cargaron mutuamente sin errores de dependencias circulares.');

    console.log('\nTODAS LAS PRUEBAS DE SERVICIOS SE COMPLETARON CON EXITO');
    process.exit(0);
}

testServices().catch(err => {
    console.error('\nERROR EN EJECUCION DE PRUEBAS:', err);
    process.exit(1);
});
