const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // 
const { saveOTP, verifyOTP, removeOTP } = require('../models/otpModel');
const { 
    registerUser, 
    getUserByUsername, 
    getUserByEmail,
    updatePassword
} = require('../models/userModel');
const { sendEmail } = require('../utils/emailUtils');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'DuMovie1239390';



/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Username or email already exists
 *       500:
 *         description: Internal server error
 */
// 🔹 Rute untuk registrasi user baru
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    try {
        const existingUser = await getUserByUsername(username);
        const existingEmail = await getUserByEmail(email);

        if (existingUser) return res.status(400).json({ message: 'Username already exists' });
        if (existingEmail) return res.status(400).json({ message: 'Email already registered' });

        await registerUser(username, email, password);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('❌ Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emailOrUsername:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid password
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
// 🔹 Rute untuk login
router.post('/login', async (req, res) => {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
        return res.status(400).json({ message: 'Email/Username and password are required' });
    }

    try {
        let user;
        if (emailOrUsername.includes('@')) {
            user = await getUserByEmail(emailOrUsername);
        } else {
            user = await getUserByUsername(emailOrUsername);
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log("Stored Hashed Password:", user.password_hash); // Debugging
        console.log("Entered Password:", password); // Debugging

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = jwt.sign(
            { user_id: user.user_id, username: user.username, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email
            },
        });
    } catch (error) {
        console.error('❌ Error logging in:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Send OTP for password reset
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent to your email
 *       404:
 *         description: User not found
 *       500:
 *         description: Error sending OTP
 */
// 🔹 Rute untuk lupa password (kirim OTP)
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    try {
        const user = await getUserByEmail(email);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6 digit OTP
        await saveOTP(email, otp);
        await sendEmail(email, 'Password Reset OTP', `Your OTP is: ${otp}`);

        res.status(200).json({ message: 'OTP sent to your email' });
    } catch (error) {
        console.error('❌ Error sending OTP:', error);
        res.status(500).json({ message: 'Error sending OTP' });
    }
});

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password with OTP
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: integer
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password has been reset successfully
 *       400:
 *         description: Invalid or expired OTP
 *       500:
 *         description: Internal server error
 */
// 🔹 Rute untuk reset password dengan OTP
router.post('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ message: 'All fields are required' });

    try {
        const isValidOTP = await verifyOTP(email, otp);
        if (!isValidOTP) return res.status(400).json({ message: 'Invalid or expired OTP' });

        await updatePassword(email, newPassword);
        await removeOTP(email);

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error('❌ Error resetting password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;