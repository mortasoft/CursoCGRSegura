const db = require('./backend/config/database');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function check() {
    try {
        const levels = await db.query('SELECT * FROM gamification_levels ORDER BY min_points ASC');
        console.log('Levels found:', JSON.stringify(levels, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
