import express from 'express';
import Alert from '../models/Alert.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/alerts
// @desc    Get all alerts for logged in user
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const alerts = await Alert.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(alerts);
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({ message: 'Server error fetching alerts' });
    }
});

// @route   POST /api/alerts
// @desc    Create a new alert
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { cryptoId, cryptoName, cryptoSymbol, targetPrice, alertType } = req.body;

        if (!cryptoId || !targetPrice || !alertType) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const alert = await Alert.create({
            user: req.user._id,
            cryptoId,
            cryptoName,
            cryptoSymbol,
            targetPrice,
            alertType, // 'above' or 'below'
            isActive: true
        });

        res.status(201).json(alert);
    } catch (error) {
        console.error('Error creating alert:', error);
        res.status(500).json({ message: 'Server error creating alert' });
    }
});

// @route   DELETE /api/alerts/:id
// @desc    Delete an alert
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);

        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }

        // Check ownership
        if (alert.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await alert.deleteOne();
        res.json({ message: 'Alert removed' });
    } catch (error) {
        console.error('Error deleting alert:', error);
        res.status(500).json({ message: 'Server error deleting alert' });
    }
});

export default router;
