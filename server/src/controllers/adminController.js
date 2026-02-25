const User = require('../models/User');
const Expense = require('../models/Expense');
const PaymentInstrument = require('../models/PaymentInstrument');

// GET /api/admin/users
const getUsers = async (req, res, next) => {
    try {
        const { search = '', page = 1, limit = 20 } = req.query;
        const filter = search ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] } : {};
        const total = await User.countDocuments(filter);
        const users = await User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
        res.json({ users, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (err) { next(err); }
};

// GET /api/admin/users/:id
const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found.' });
        const [expenseStats] = await Expense.aggregate([
            { $match: { userId: user._id } },
            { $group: { _id: null, totalSpend: { $sum: '$amount' }, totalRewards: { $sum: '$rewardEarned' }, count: { $sum: 1 } } },
        ]);
        const instrumentCount = await PaymentInstrument.countDocuments({ userId: user._id, isActive: true });
        res.json({ user, stats: { ...expenseStats, instrumentCount } });
    } catch (err) { next(err); }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res, next) => {
    try {
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ error: 'Cannot delete your own account.' });
        }
        await User.findByIdAndDelete(req.params.id);
        await Expense.deleteMany({ userId: req.params.id });
        await PaymentInstrument.deleteMany({ userId: req.params.id });
        res.json({ message: 'User and all associated data deleted.' });
    } catch (err) { next(err); }
};

// GET /api/admin/stats
const getStats = async (req, res, next) => {
    try {
        const [userCount, expenseCount, instrumentCount, [totals]] = await Promise.all([
            User.countDocuments(),
            Expense.countDocuments(),
            PaymentInstrument.countDocuments({ isActive: true }),
            Expense.aggregate([{ $group: { _id: null, totalSpend: { $sum: '$amount' }, totalRewards: { $sum: '$rewardEarned' } } }]),
        ]);
        res.json({
            userCount,
            expenseCount,
            instrumentCount,
            totalSpend: totals?.totalSpend || 0,
            totalRewards: totals?.totalRewards || 0,
        });
    } catch (err) { next(err); }
};

module.exports = { getUsers, getUser, deleteUser, getStats };
