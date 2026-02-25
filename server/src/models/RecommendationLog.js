const mongoose = require('mongoose');

const rankingItemSchema = new mongoose.Schema({
    instrumentId: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentInstrument' },
    instrumentName: String,
    estimatedReward: Number,
    effectiveRate: String,
    rank: Number,
    explanation: String,
    milestoneAlert: String,
    capReached: { type: Boolean, default: false },
}, { _id: false });

const recommendationLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        transactionAmount: {
            type: Number,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        merchantName: String,
        rankings: [rankingItemSchema],
        topRecommendation: rankingItemSchema,
    },
    { timestamps: true }
);

module.exports = mongoose.model('RecommendationLog', recommendationLogSchema);
