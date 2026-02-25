const PaymentInstrument = require('../models/PaymentInstrument');
const RecommendationLog = require('../models/RecommendationLog');
const { rankInstruments } = require('../services/recommendationEngine');

// POST /api/recommend
const getRecommendations = async (req, res, next) => {
    try {
        const { amount, category, merchantName } = req.body;
        if (!amount || !category) {
            return res.status(400).json({ error: 'amount and category are required.' });
        }
        const instruments = await PaymentInstrument.find({ userId: req.user._id, isActive: true });
        if (instruments.length === 0) {
            return res.status(200).json({
                rankings: [],
                topRecommendation: null,
                message: 'No payment instruments configured. Add your cards first!',
            });
        }
        const rankings = rankInstruments(instruments, Number(amount), category);
        const topRecommendation = rankings[0];

        // Log the recommendation (async, non-blocking)
        RecommendationLog.create({
            userId: req.user._id,
            transactionAmount: amount,
            category,
            merchantName,
            rankings: rankings.map(r => ({
                instrumentId: r.instrumentId,
                instrumentName: r.instrumentName,
                estimatedReward: r.estimatedReward,
                effectiveRate: r.effectiveRate,
                rank: r.rank,
                explanation: r.explanation,
                capReached: r.capReached,
            })),
            topRecommendation: {
                instrumentId: topRecommendation.instrumentId,
                instrumentName: topRecommendation.instrumentName,
                estimatedReward: topRecommendation.estimatedReward,
                effectiveRate: topRecommendation.effectiveRate,
                rank: 1,
                explanation: topRecommendation.explanation,
            },
        }).catch(err => console.error('Failed to log recommendation:', err));

        res.json({ rankings, topRecommendation, category, amount: Number(amount) });
    } catch (err) { next(err); }
};

module.exports = { getRecommendations };
