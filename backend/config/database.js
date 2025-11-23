const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vehicle_rental_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    console.log(`Connected to database: ${process.env.DB_NAME || 'vehicle_rental_db'}`);
    connection.release();
  })
  .catch(err => {
    console.error('Database connection error:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState
    });
    console.error('Please check your database configuration in .env file');
    console.error('Required: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
  });

module.exports = pool;