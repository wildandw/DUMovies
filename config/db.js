const mysql = require('mysql2/promise'); // Menggunakan mysql2/promise
require('dotenv').config(); // Tambahkan ini untuk membaca file .env

// Membuat pool koneksi ke database menggunakan promise
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'movierecommendation', // Default ke 'movierecommendation' jika DB_NAME kosong
  port:3306
});

// Menggunakan async/await saat memanggil query
async function testConnection() {
  try {
    // Mendapatkan koneksi dari pool
    const connection = await db.getConnection();
    console.log('Connected to the database');
    connection.release(); // Pastikan melepaskan koneksi setelah digunakan
  } catch (err) {
    console.error('Error connecting to the database: ', err.stack);
  }
}

testConnection();

module.exports = db;
