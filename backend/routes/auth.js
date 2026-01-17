import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import crypto from 'crypto';
import PasswordReset from '../models/PasswordReset.js';
import { sendEmail } from '../utils/emailService.js';


const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all fields' });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Find user and include password
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Create reset record
        await PasswordReset.create({
            user: user._id,
            resetToken: resetTokenHash,
            expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
        });

        // Create reset URL
        // Assuming frontend is running on localhost:5173 or configured URL
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Token',
                message,
                html: `
                    <h1>You have requested a password reset</h1>
                    <p>Please go to this link to reset your password:</p>
                    <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
                    <p>This link will expire in 10 minutes.</p>
                `,
            });

            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (err) {
            console.error(err);
            await PasswordReset.deleteOne({ resetToken: resetTokenHash });
            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/reset-password/:resetToken
// @desc    Reset password
// @access  Public
router.post('/reset-password/:resetToken', async (req, res) => {
    try {
        const resetTokenHash = crypto
            .createHash('sha256')
            .update(req.params.resetToken)
            .digest('hex');

        const resetRecord = await PasswordReset.findOne({
            resetToken: resetTokenHash,
            expiresAt: { $gt: Date.now() },
            used: false,
        });

        if (!resetRecord) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const user = await User.findById(resetRecord.user);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Set new password
        user.password = req.body.password;
        await user.save();

        // Mark token as used
        resetRecord.used = true;
        await resetRecord.save();

        // Delete used tokens for this user (optional cleanup)
        // await PasswordReset.deleteMany({ user: user._id });

        res.status(200).json({
            success: true,
            message: 'Password Reset Success',
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
