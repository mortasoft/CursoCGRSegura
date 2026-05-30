const userController = require('../controllers/userController');
const badgeController = require('../controllers/badgeController');
const AppError = require('../utils/appError');

async function runTests() {
    // Test 1: User Controller
    await new Promise((resolve, reject) => {
        console.log('Running test 1: getUserById with non-existent user...');
        const mockReq = {
            params: { id: 99999 },
            user: { id: 1, role: 'admin' }
        };
        const mockRes = {
            json: (data) => reject(new Error('Expected error flow, but got JSON response')),
            status: (code) => reject(new Error('Expected error flow, but got status ' + code))
        };
        const mockNext = (err) => {
            if (err instanceof AppError && err.statusCode === 404 && err.message === 'Usuario no encontrado') {
                console.log('Test 1 Passed: Correct AppError 404 caught.');
                resolve();
            } else {
                reject(err || new Error('Incorrect error caught'));
            }
        };
        userController.getUserById(mockReq, mockRes, mockNext);
    });

    // Test 2: Badge Controller Validation
    await new Promise((resolve, reject) => {
        console.log('\nRunning test 2: createBadge validation check...');
        const mockReq = {
            body: { name: 'Insignia Test' } // Falta description
        };
        const mockRes = {
            json: (data) => reject(new Error('Expected validation error, but got success JSON')),
            status: (code) => reject(new Error('Expected validation error, but got status ' + code))
        };
        const mockNext = (err) => {
            if (err instanceof AppError && err.statusCode === 400 && err.message === 'Nombre y descripción son obligatorios') {
                console.log('Test 2 Passed: Correct AppError 400 caught.');
                resolve();
            } else {
                reject(err || new Error('Incorrect error caught'));
            }
        };
        badgeController.createBadge(mockReq, mockRes, mockNext);
    });
    
    console.log('\nALL SCRATCH TESTS PASSED');
    process.exit(0);
}

runTests().catch(err => {
    console.error('\nTEST RUN FAILED:', err);
    process.exit(1);
});
