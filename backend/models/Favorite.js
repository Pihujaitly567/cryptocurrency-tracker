import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true, // One favorites document per user
        },
        cryptoIds: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

const Favorite = mongoose.model('Favorite', favoriteSchema);

export default Favorite;
