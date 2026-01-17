import express from 'express';
import Favorite from '../models/Favorite.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/favorites
// @desc    Get user's favorites
// @access  Private
router.get('/', async (req, res) => {
    try {
        let favorites = await Favorite.findOne({ user: req.user._id });

        // If no favorites document exists, create one
        if (!favorites) {
            favorites = await Favorite.create({
                user: req.user._id,
                cryptoIds: [],
            });
        }

        res.json(favorites.cryptoIds);
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/favorites
// @desc    Add crypto to favorites
// @access  Private
router.post('/', async (req, res) => {
    try {
        const { cryptoId } = req.body;

        if (!cryptoId) {
            return res.status(400).json({ message: 'Please provide cryptoId' });
        }

        let favorites = await Favorite.findOne({ user: req.user._id });

        if (!favorites) {
            // Create new favorites document
            favorites = await Favorite.create({
                user: req.user._id,
                cryptoIds: [cryptoId],
            });
        } else {
            // Add to existing favorites if not already present
            if (!favorites.cryptoIds.includes(cryptoId)) {
                favorites.cryptoIds.push(cryptoId);
                await favorites.save();
            }
        }

        res.json(favorites.cryptoIds);
    } catch (error) {
        console.error('Add favorite error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/favorites/:cryptoId
// @desc    Remove crypto from favorites
// @access  Private
router.delete('/:cryptoId', async (req, res) => {
    try {
        const { cryptoId } = req.params;

        const favorites = await Favorite.findOne({ user: req.user._id });

        if (!favorites) {
            return res.status(404).json({ message: 'Favorites not found' });
        }

        // Remove cryptoId from array
        favorites.cryptoIds = favorites.cryptoIds.filter(id => id !== cryptoId);
        await favorites.save();

        res.json(favorites.cryptoIds);
    } catch (error) {
        console.error('Remove favorite error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
