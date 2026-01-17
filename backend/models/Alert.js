import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
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
        cryptoName: {
            type: String,
            required: true,
        },
        cryptoSymbol: {
            type: String,
            required: true,
        },
        targetPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        currentPrice: {
            type: Number,
            default: 0,
        },
        alertType: {
            type: String,
            enum: ['above', 'below'],
            required: true,
        },
        isTriggered: {
            type: Boolean,
            default: false,
        },
        triggeredAt: {
            type: Date,
        },
        emailSent: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient queries
alertSchema.index({ user: 1, isActive: 1 });
alertSchema.index({ isTriggered: 1, isActive: 1 });

const Alert = mongoose.model('Alert', alertSchema);

export default Alert;
