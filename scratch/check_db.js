const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const db = require('../backend/config/database');

async function main() {
    try {
        console.log('Testing connection to DB...');
        const [users] = await db.pool.execute('SELECT COUNT(*) as count FROM users');
        console.log('Users count:', users[0].count);

        const [directory] = await db.pool.execute('SELECT COUNT(*) as count FROM staff_directory');
        console.log('Staff directory count:', directory[0].count);

        const [sampleUsers] = await db.pool.execute('SELECT id, email, role, is_active FROM users LIMIT 5');
        console.log('Sample users:', sampleUsers);

        const [sampleDirectory] = await db.pool.execute('SELECT email, full_name, department FROM staff_directory LIMIT 5');
        console.log('Sample staff directory:', sampleDirectory);

        const [systemSettings] = await db.pool.execute('SELECT * FROM system_settings');
        console.log('System settings:', systemSettings);

    } catch (error) {
        console.error('Error running DB check:', error);
    } finally {
        process.exit(0);
    }
}

main();
