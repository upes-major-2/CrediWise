const PaymentInstrument = require('../models/PaymentInstrument');

// GET /api/instruments
const getInstruments = async (req, res, next) => {
    try {
        const instruments = await PaymentInstrument.find({ userId: req.user._id, isActive: true })
            .sort({ createdAt: -1 });
        res.json({ instruments, count: instruments.length });
    } catch (err) { next(err); }
};

// POST /api/instruments
const createInstrument = async (req, res, next) => {
    try {
        const instrument = await PaymentInstrument.create({ ...req.body, userId: req.user._id });
        res.status(201).json({ instrument });
    } catch (err) { next(err); }
};

// GET /api/instruments/:id
const getInstrument = async (req, res, next) => {
    try {
        const instrument = await PaymentInstrument.findOne({ _id: req.params.id, userId: req.user._id });
        if (!instrument) return res.status(404).json({ error: 'Instrument not found.' });
        res.json({ instrument });
    } catch (err) { next(err); }
};

// PUT /api/instruments/:id
const updateInstrument = async (req, res, next) => {
    try {
        const instrument = await PaymentInstrument.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!instrument) return res.status(404).json({ error: 'Instrument not found.' });
        res.json({ instrument });
    } catch (err) { next(err); }
};

// DELETE /api/instruments/:id
const deleteInstrument = async (req, res, next) => {
    try {
        const instrument = await PaymentInstrument.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { isActive: false },
            { new: true }
        );
        if (!instrument) return res.status(404).json({ error: 'Instrument not found.' });
        res.json({ message: 'Instrument removed.' });
    } catch (err) { next(err); }
};

// GET /api/instruments/admin/all  (admin only — handled by router)
const getAllInstruments = async (req, res, next) => {
    try {
        const instruments = await PaymentInstrument.find({}).populate('userId', 'name email').sort({ createdAt: -1 });
        res.json({ instruments, count: instruments.length });
    } catch (err) { next(err); }
};

module.exports = { getInstruments, createInstrument, getInstrument, updateInstrument, deleteInstrument, getAllInstruments };
