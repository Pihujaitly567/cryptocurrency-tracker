import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: ['buy', 'sell'],
            required: true,
        },
        cryptoId: {
            type: String,
            required: true,
        },
        cryptoName: {
            type: String,
            required: true,
        },
        cryptoSymbol: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        pricePerUnit: {
            type: Number,
            required: true,
            min: 0,
        },
        totalValue: {
            type: Number,
            required: true,
            min: 0,
        },
        portfolioId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Portfolio',
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying by user and date
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ user: 1, type: 1 });
transactionSchema.index({ user: 1, cryptoId: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
