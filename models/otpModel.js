const db = require('../config/db');

async function saveOTP(email, otp) {
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // OTP berlaku selama 10 menit
    await db.execute('DELETE FROM otp_codes WHERE email = ?', [email]);
    await db.execute('INSERT INTO otp_codes (email, otp_code, expiry_time) VALUES (?, ?, ?)', [email, otp, expiry]);
}

async function verifyOTP(email, otp) {
    const [rows] = await db.execute('SELECT otp_code, expiry_time FROM otp_codes WHERE email = ?', [email]);
    if (!rows.length || new Date() > new Date(rows[0].expiry_time)) return false;
    return rows[0].otp_code === otp;
}

async function removeOTP(email) {
    await db.execute('DELETE FROM otp_codes WHERE email = ?', [email]);
}

module.exports = { saveOTP, verifyOTP, removeOTP };
