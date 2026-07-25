const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

async function createDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '1596',
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'freshbasket_db'}\`;`);
    console.log(`✅ Database '${process.env.DB_NAME || 'freshbasket_db'}' created or already exists.`);
    await connection.end();
  } catch (err) {
    console.error('❌ Error creating database:', err.message);
    process.exit(1);
  }
}

createDatabase();
