import express from 'express';
import Portfolio from '../models/Portfolio.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/portfolio
// @desc    Get user's portfolio
// @access  Private
router.get('/', async (req, res) => {
    try {
        const portfolio = await Portfolio.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(portfolio);
    } catch (error) {
        console.error('Get portfolio error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/portfolio
// @desc    Add or update crypto to portfolio
// @access  Private
router.post('/', async (req, res) => {
    try {
        const { cryptoId, name, symbol, image, amount, purchasePrice, currentPrice } = req.body;

        // Validate required fields
        if (!cryptoId || !name || !symbol || !image || amount === undefined || purchasePrice === undefined) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if portfolio item already exists
        let portfolioItem = await Portfolio.findOne({
            user: req.user._id,
            cryptoId,
        });

        if (portfolioItem) {
            // Update existing item (add to amount)
            portfolioItem.amount += amount;
            portfolioItem.currentPrice = currentPrice || purchasePrice;
            await portfolioItem.save();
        } else {
            // Create new portfolio item
            portfolioItem = await Portfolio.create({
                user: req.user._id,
                cryptoId,
                name,
                symbol,
                image,
                amount,
                purchasePrice,
                currentPrice: currentPrice || purchasePrice,
            });
        }

        res.status(201).json(portfolioItem);
    } catch (error) {
        console.error('Add to portfolio error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/portfolio/:id
// @desc    Update portfolio item
// @access  Private
router.put('/:id', async (req, res) => {
    try {
        const portfolioItem = await Portfolio.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!portfolioItem) {
            return res.status(404).json({ message: 'Portfolio item not found' });
        }

        // Update fields
        const { amount, currentPrice } = req.body;
        if (amount !== undefined) portfolioItem.amount = amount;
        if (currentPrice !== undefined) portfolioItem.currentPrice = currentPrice;

        await portfolioItem.save();
        res.json(portfolioItem);
    } catch (error) {
        console.error('Update portfolio error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/portfolio/:id
// @desc    Remove crypto from portfolio
// @access  Private
router.delete('/:id', async (req, res) => {
    try {
        const portfolioItem = await Portfolio.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!portfolioItem) {
            return res.status(404).json({ message: 'Portfolio item not found' });
        }

        res.json({ message: 'Portfolio item removed successfully' });
    } catch (error) {
        console.error('Delete portfolio error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
