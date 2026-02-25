const Expense = require('../models/Expense');
const PaymentInstrument = require('../models/PaymentInstrument');

const getPeriodFilter = (period) => {
    const now = new Date();
    const start = new Date();
    if (period === '30') start.setDate(now.getDate() - 30);
    else if (period === '90') start.setDate(now.getDate() - 90);
    else if (period === '365') start.setFullYear(now.getFullYear() - 1);
    else start.setDate(now.getDate() - 30); // default 30 days
    return start;
};

// GET /api/analytics/overview
const getOverview = async (req, res, next) => {
    try {
        const { period = '30' } = req.query;
        const startDate = getPeriodFilter(period);
        const [result] = await Expense.aggregate([
            { $match: { userId: req.user._id, date: { $gte: startDate } } },
            {
                $group: {
                    _id: null,
                    totalSpend: { $sum: '$amount' },
                    totalRewards: { $sum: '$rewardEarned' },
                    transactionCount: { $sum: 1 },
                    avgTransaction: { $avg: '$amount' },
                }
            },
        ]);
        res.json({
            totalSpend: result?.totalSpend || 0,
            totalRewards: result?.totalRewards || 0,
            transactionCount: result?.transactionCount || 0,
            avgTransaction: result?.avgTransaction || 0,
            savingsRate: result?.totalSpend > 0 ? ((result.totalRewards / result.totalSpend) * 100).toFixed(2) : 0,
            period,
        });
    } catch (err) { next(err); }
};

// GET /api/analytics/monthly-trend
const getMonthlyTrend = async (req, res, next) => {
    try {
        const { months = 6 } = req.query;
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - Number(months));
        const trend = await Expense.aggregate([
            { $match: { userId: req.user._id, date: { $gte: startDate } } },
            {
                $group: {
                    _id: { year: { $year: '$date' }, month: { $month: '$date' } },
                    totalAmount: { $sum: '$amount' },
                    totalRewards: { $sum: '$rewardEarned' },
                    count: { $sum: 1 },
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            {
                $project: {
                    _id: 0,
                    year: '$_id.year',
                    month: '$_id.month',
                    totalAmount: 1,
                    totalRewards: 1,
                    count: 1,
                }
            },
        ]);
        res.json({ trend });
    } catch (err) { next(err); }
};

// GET /api/analytics/category-breakdown
const getCategoryBreakdown = async (req, res, next) => {
    try {
        const { period = '30' } = req.query;
        const startDate = getPeriodFilter(period);
        const breakdown = await Expense.aggregate([
            { $match: { userId: req.user._id, date: { $gte: startDate } } },
            {
                $group: {
                    _id: '$category',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 },
                    totalRewards: { $sum: '$rewardEarned' },
                }
            },
            { $sort: { totalAmount: -1 } },
        ]);
        res.json({ breakdown, period });
    } catch (err) { next(err); }
};

// GET /api/analytics/instrument-performance
const getInstrumentPerformance = async (req, res, next) => {
    try {
        const { period = '30' } = req.query;
        const startDate = getPeriodFilter(period);
        const performance = await Expense.aggregate([
            { $match: { userId: req.user._id, date: { $gte: startDate }, paymentInstrumentId: { $ne: null } } },
            {
                $group: {
                    _id: '$paymentInstrumentId',
                    totalSpend: { $sum: '$amount' },
                    totalRewards: { $sum: '$rewardEarned' },
                    count: { $sum: 1 },
                }
            },
            { $lookup: { from: 'paymentinstruments', localField: '_id', foreignField: '_id', as: 'instrument' } },
            { $unwind: '$instrument' },
            {
                $project: {
                    _id: 0,
                    instrumentId: '$_id',
                    name: '$instrument.name',
                    type: '$instrument.type',
                    color: '$instrument.color',
                    totalSpend: 1,
                    totalRewards: 1,
                    count: 1,
                    effectiveRate: { $cond: [{ $gt: ['$totalSpend', 0] }, { $multiply: [{ $divide: ['$totalRewards', '$totalSpend'] }, 100] }, 0] },
                }
            },
            { $sort: { totalRewards: -1 } },
        ]);
        res.json({ performance, period });
    } catch (err) { next(err); }
};

// GET /api/analytics/high-spend-alerts
const getHighSpendAlerts = async (req, res, next) => {
    try {
        // Get last 3 months trend and flag categories > 20% above their 3-month average
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const [historical, recent] = await Promise.all([
            Expense.aggregate([
                { $match: { userId: req.user._id, date: { $gte: threeMonthsAgo, $lt: oneMonthAgo } } },
                { $group: { _id: '$category', avgMonthly: { $avg: '$amount' }, total: { $sum: '$amount' } } },
            ]),
            Expense.aggregate([
                { $match: { userId: req.user._id, date: { $gte: oneMonthAgo } } },
                { $group: { _id: '$category', recentTotal: { $sum: '$amount' } } },
            ]),
        ]);

        const historicalMap = Object.fromEntries(historical.map(h => [h._id, h.total / 2])); // avg of 2 prior months
        const alerts = recent
            .map(r => {
                const avg = historicalMap[r._id] || 0;
                const pctChange = avg > 0 ? ((r.recentTotal - avg) / avg) * 100 : null;
                return { category: r._id, recentTotal: r.recentTotal, avgMonthly: avg, pctChange };
            })
            .filter(a => a.pctChange !== null && a.pctChange > 20)
            .sort((a, b) => b.pctChange - a.pctChange);

        res.json({ alerts });
    } catch (err) { next(err); }
};

module.exports = { getOverview, getMonthlyTrend, getCategoryBreakdown, getInstrumentPerformance, getHighSpendAlerts };
