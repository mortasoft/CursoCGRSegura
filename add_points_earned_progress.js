const db = require('./backend/config/database');

async function migrate() {
    try {
        console.log('Adding points_earned column to user_progress table...');
        await db.query("ALTER TABLE user_progress ADD COLUMN points_earned INT DEFAULT 0;");
        console.log('Migration successful.');
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Column already exists, skipping.');
        } else {
            console.error('Migration failed:', error);
        }
    }
    process.exit();
}

migrate();
