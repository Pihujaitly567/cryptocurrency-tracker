import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        cryptoId: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        symbol: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            default: 1,
            min: 0,
        },
        purchasePrice: {
            type: Number,
            required: true,
            min: 0,
        },
        currentPrice: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Create compound index for user and cryptoId to prevent duplicates
portfolioSchema.index({ user: 1, cryptoId: 1 }, { unique: true });

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

export default Portfolio;
