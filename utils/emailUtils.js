const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // Gunakan SMTP Gmail
    port: 465, // Gunakan port yang benar untuk SSL (465) atau TLS (587)
    secure: true, // `true` untuk SSL, `false` untuk TLS
    auth: {
        user: process.env.EMAIL_USER, // Pastikan variabel ini benar
        pass: process.env.EMAIL_PASS, // Gunakan app password
    },
});

/**
 * Fungsi untuk mengirim email OTP untuk reset password.
 * @param {string} to - Alamat email penerima.
 * @param {string} subject - Subjek email.
 * @param {string} otp - Kode OTP untuk reset password.
 * @returns {Promise<boolean>} - Hasil pengiriman email (true jika berhasil).
 */
async function sendEmail(to, subject, otp) {
    try {
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>OTP for Password Reset</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        font-size: 16px;
                        color: #333;
                    }
                    .otp-container {
                        font-size: 20px; 
                        font-weight: bold; 
                        color: white; 
                        background-color: #808080; /* Abu-abu */
                        text-align: center; 
                        padding: 10px 20px; 
                        border-radius: 8px; 
                        display: inline-block; 
                        margin: 20px 0;
                    }
                </style>
            </head>
            <body>
                <div>
                    <h2>Your OTP for Password Reset</h2>
                    <p>Hello,</p>
                    <p>We received a request to reset your password. Please use the OTP below to reset your password:</p>
                    <div class="otp-container">
                        ${otp}
                    </div>
                    <p>This OTP is valid for 10 minutes. If you didn’t request a password reset, please ignore this email.</p>
                    <p>Thank you,<br>DuMovie Support</p>
                </div>
            </body>
            </html>
        `;

        const info = await transporter.sendMail({
            from: `"DuMovie Support" <${process.env.EMAIL_USER}>`,
            to, // Email penerima
            subject,
            html: htmlContent, // Pesan dalam format HTML
        });

        console.log(`OTP email sent to ${to}: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

module.exports = { sendEmail };
