const Expense = require('../models/Expense');
const PaymentInstrument = require('../models/PaymentInstrument');

// Keyword-based auto-categorization
const CATEGORY_KEYWORDS = {
    dining: ['zomato', 'swiggy', 'restaurant', 'cafe', 'food', 'pizza', 'burger', 'biryani', 'hotel', 'eat'],
    travel: ['uber', 'ola', 'rapido', 'irctc', 'indigo', 'air india', 'train', 'flight', 'bus', 'metro', 'redbus'],
    groceries: ['bigbasket', 'blinkit', 'zepto', 'dmart', 'reliance', 'grocery', 'supermarket', 'vegetables'],
    fuel: ['petrol', 'diesel', 'bpcl', 'hpcl', 'iocl', 'fuel', 'cng'],
    shopping: ['amazon', 'flipkart', 'myntra', 'meesho', 'nykaa', 'ajio', 'shopping', 'mall', 'retail'],
    utilities: ['airtel', 'jio', 'bsnl', 'electricity', 'water', 'gas', 'bill', 'recharge'],
    entertainment: ['netflix', 'prime', 'hotstar', 'spotify', 'bookmyshow', 'pvr', 'inox', 'movie', 'concert'],
    healthcare: ['apollo', 'medplus', 'pharmeasy', 'hospital', 'clinic', 'pharmacy', 'medicine', 'doctor'],
    education: ['coursera', 'udemy', 'byju', 'unacademy', 'school', 'college', 'tuition', 'fee', 'book'],
};

const autoDetectCategory = (merchantName, description) => {
    const text = `${merchantName || ''} ${description || ''}`.toLowerCase();
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(k => text.includes(k))) return category;
    }
    return 'general';
};

// GET /api/expenses
const getExpenses = async (req, res, next) => {
    try {
        const { category, instrumentId, startDate, endDate, page = 1, limit = 20 } = req.query;
        const filter = { userId: req.user._id };
        if (category) filter.category = category;
        if (instrumentId) filter.paymentInstrumentId = instrumentId;
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }
        const total = await Expense.countDocuments(filter);
        const expenses = await Expense.find(filter)
            .populate('paymentInstrumentId', 'name type color')
            .populate('recommendedInstrumentId', 'name')
            .sort({ date: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));
        res.json({ expenses, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (err) { next(err); }
};

// POST /api/expenses
const createExpense = async (req, res, next) => {
    try {
        let { amount, category, description, merchantName, date, paymentInstrumentId, recommendedInstrumentId, rewardEarned, tags } = req.body;
        if (!category || category === 'auto') {
            category = autoDetectCategory(merchantName, description);
        }
        const expense = await Expense.create({
            userId: req.user._id, amount, category, description, merchantName, date, paymentInstrumentId, recommendedInstrumentId, rewardEarned: rewardEarned || 0, tags,
        });
        // Update instrument currentMonthSpend
        if (paymentInstrumentId) {
            await PaymentInstrument.findByIdAndUpdate(paymentInstrumentId, { $inc: { currentMonthSpend: amount } });
        }
        const populated = await expense.populate('paymentInstrumentId', 'name type color');
        res.status(201).json({ expense: populated });
    } catch (err) { next(err); }
};

// GET /api/expenses/:id
const getExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id })
            .populate('paymentInstrumentId', 'name type color')
            .populate('recommendedInstrumentId', 'name');
        if (!expense) return res.status(404).json({ error: 'Expense not found.' });
        res.json({ expense });
    } catch (err) { next(err); }
};

// PUT /api/expenses/:id
const updateExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!expense) return res.status(404).json({ error: 'Expense not found.' });
        res.json({ expense });
    } catch (err) { next(err); }
};

// DELETE /api/expenses/:id
const deleteExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!expense) return res.status(404).json({ error: 'Expense not found.' });
        res.json({ message: 'Expense deleted.' });
    } catch (err) { next(err); }
};

// GET /api/expenses/summary/monthly
const getMonthlySummary = async (req, res, next) => {
    try {
        const { months = 6 } = req.query;
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - Number(months));
        const summary = await Expense.aggregate([
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
        ]);
        res.json({ summary });
    } catch (err) { next(err); }
};

// GET /api/expenses/summary/category
const getCategorySummary = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const match = { userId: req.user._id };
        if (startDate || endDate) {
            match.date = {};
            if (startDate) match.date.$gte = new Date(startDate);
            if (endDate) match.date.$lte = new Date(endDate);
        }
        const summary = await Expense.aggregate([
            { $match: match },
            {
                $group: {
                    _id: '$category',
                    totalAmount: { $sum: '$amount' },
                    totalRewards: { $sum: '$rewardEarned' },
                    count: { $sum: 1 },
                }
            },
            { $sort: { totalAmount: -1 } },
        ]);
        res.json({ summary });
    } catch (err) { next(err); }
};

// GET /api/expenses/summary/top-merchants
const getTopMerchants = async (req, res, next) => {
    try {
        const merchants = await Expense.aggregate([
            { $match: { userId: req.user._id, merchantName: { $exists: true, $ne: '' } } },
            { $group: { _id: '$merchantName', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
            { $sort: { totalAmount: -1 } },
            { $limit: 10 },
        ]);
        res.json({ merchants });
    } catch (err) { next(err); }
};

module.exports = { getExpenses, createExpense, getExpense, updateExpense, deleteExpense, getMonthlySummary, getCategorySummary, getTopMerchants };
