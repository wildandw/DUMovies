require('dotenv').config();
const db = require('../config/db');
const bcrypt = require('bcrypt'); // Hapus spasi ekstra

// 🔹 Fungsi untuk mendapatkan user terakhir berdasarkan user_id
async function getLastUserId() {
    const query = 'SELECT user_id FROM users ORDER BY user_id DESC LIMIT 1';
    const [rows] = await db.execute(query);
    return rows.length > 0 ? rows[0].user_id : null;
}

// 🔹 Fungsi untuk membuat user_id baru
function generateUserId(lastUserId) {
    if (!lastUserId) {
        return 'USR001';
    }
    const number = parseInt(lastUserId.slice(3)) + 1;
    return `USR${String(number).padStart(3, '0')}`;
}

// 🔹 Fungsi untuk mendaftarkan user baru
async function registerUser(username, email, password) {
    try {
        if (!username || !email || !password) {
            throw new Error('Username, email, dan password harus diisi');
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds); // Hash password dengan salt

        const lastUserId = await getLastUserId();
        const newUserId = generateUserId(lastUserId);

        const query = `
            INSERT INTO users (user_id, username, email, password_hash)
            VALUES (?, ?, ?, ?)
        `;
        await db.execute(query, [newUserId, username.trim(), email.trim(), hashedPassword]); // Trim username & email
        console.log(`User ${username} berhasil didaftarkan.`);
    } catch (error) {
        console.error('Error saat registrasi user:', error.message);
        throw error; // Lempar error agar bisa ditangani di `authRoutes.js`
    }
}

// 🔹 Fungsi untuk mendapatkan user berdasarkan email
async function getUserByEmail(email) {
    try {
        const query = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await db.execute(query, [email.trim()]); // Trim untuk mencegah spasi tidak sengaja
        return rows[0] || null;
    } catch (error) {
        console.error('Error saat mencari user berdasarkan email:', error.message);
        throw error;
    }
}

// 🔹 Fungsi untuk mendapatkan user berdasarkan username
async function getUserByUsername(username) {
    try {
        const query = 'SELECT * FROM users WHERE username = ?';
        const [rows] = await db.execute(query, [username.trim()]); // Trim untuk mencegah spasi tidak sengaja
        return rows[0] || null;
    } catch (error) {
        console.error('Error saat mencari user berdasarkan username:', error.message);
        throw error;
    }
}

// 🔹 Perbarui password user
async function updatePassword(email, newPassword) {
    try {
        if (!newPassword) {
            throw new Error('Password baru harus diisi');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const query = 'UPDATE users SET password_hash = ? WHERE email = ?';
        await db.execute(query, [hashedPassword, email.trim()]); // Trim untuk email
        console.log(`🔑 Password untuk ${email} telah diperbarui.`);
    } catch (error) {
        console.error('Error saat memperbarui password:', error.message);
        throw error;
    }
}

module.exports = {
    getLastUserId,
    generateUserId,
    registerUser,
    getUserByEmail,
    updatePassword,
    getUserByUsername
};
