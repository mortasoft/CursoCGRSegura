const db = require('../config/database');
const systemController = require('../controllers/systemController');

async function testSystem() {
    console.log('Testing SystemController...');

    // Mock Express req, res, next
    const reqGet = {};
    const resGet = {
        json: (data) => {
            console.log('GET settings result success:', data.success);
            if (!data.settings) throw new Error('No settings returned');
            console.log('Current settings keys:', Object.keys(data.settings));
        }
    };
    
    // Test GET settings
    await systemController.getSettings(reqGet, resGet, (err) => {
        if (err) throw err;
    });

    // Test PUT settings
    const reqPut = {
        body: {
            ranking_limit_global: 100,
            ranking_limit_department: 10
        }
    };
    const resPut = {
        json: (data) => {
            console.log('PUT settings result success:', data.success);
            console.log('Message:', data.message);
        }
    };

    await systemController.updateSettings(reqPut, resPut, (err) => {
        if (err) throw err;
    });

    console.log('SystemController tests passed successfully!');
    process.exit(0);
}

testSystem().catch(err => {
    console.error('SystemController tests failed:', err);
    process.exit(1);
});
