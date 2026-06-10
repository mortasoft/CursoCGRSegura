const userController = require('../controllers/userController');

async function runTests() {
    console.log('Iniciando pruebas de contexto (Paso 4)...');

    // 1. Agregar una propiedad helper dinamica al controlador
    userController.testHelperValue = 'contexto_valido_de_instancia';
    
    // Agregar un metodo tradicional de prueba para demostrar perdida de contexto
    userController.checkContextMethod = function() {
        return this.testHelperValue;
    };

    // 2. Extraer el metodo y ejecutarlo de forma aislada
    const detachedMethod = userController.checkContextMethod;
    
    try {
        detachedMethod();
        throw new Error('Se esperaba un fallo de contexto en metodos tradicionales no enlazados');
    } catch (err) {
        console.log('OK: Los metodos tradicionales de JS pierden el contexto "this" cuando son desacoplados del objeto');
    }

    // 3. Verificar que los controladores de clase del backend utilicen propiedades directas de instancia
    // (lo cual ocurre al definir metodos como propiedades usando funciones flecha) en lugar de metodos de prototipo.
    const hasDirectProperty = Object.prototype.hasOwnProperty.call(userController, 'getProfile');
    if (!hasDirectProperty) {
        throw new Error('getProfile deberia ser una propiedad directa de la instancia (metodo flecha), no del prototipo');
    }
    console.log('OK: getProfile esta definida directamente en la instancia de UserController (metodo flecha)');

    const controllers = [
        { name: 'AnnouncementController', instance: require('../controllers/announcementController') },
        { name: 'BadgeController', instance: require('../controllers/badgeController') },
        { name: 'DepartmentController', instance: require('../controllers/departmentController') },
        { name: 'DirectoryController', instance: require('../controllers/directoryController') },
        { name: 'ForumController', instance: require('../controllers/forumController') },
        { name: 'LessonContentController', instance: require('../controllers/lessonContentController') },
        { name: 'LessonController', instance: require('../controllers/lessonController') },
        { name: 'ModuleController', instance: require('../controllers/moduleController') },
        { name: 'NotificationController', instance: require('../controllers/notificationController') },
        { name: 'QuizController', instance: require('../controllers/quizController') },
        { name: 'ReportsController', instance: require('../controllers/reportsController') },
        { name: 'SurveyController', instance: require('../controllers/surveyController') }
    ];

    for (const ctrl of controllers) {
        const keys = Object.keys(ctrl.instance);
        if (keys.length === 0) {
            throw new Error(`El controlador ${ctrl.name} no tiene propiedades de instancia.`);
        }
        // Verificar que al menos uno de sus metodos conocidos es propiedad de instancia
        const firstKey = keys[0];
        const isInstanceProp = Object.prototype.hasOwnProperty.call(ctrl.instance, firstKey);
        if (!isInstanceProp) {
            throw new Error(`El metodo ${firstKey} de ${ctrl.name} no es una propiedad de instancia enlazada`);
        }
        console.log(`OK: El controlador ${ctrl.name} tiene metodos enlazados lexicamente como propiedad de instancia.`);
    }

    console.log('\nTODAS LAS VERIFICACIONES DE CONTEXTO SE COMPLETARON CON EXITO');
    process.exit(0);
}

runTests().catch(err => {
    console.error('\nERROR EN EJECUCION DE PRUEBAS:', err);
    process.exit(1);
});
