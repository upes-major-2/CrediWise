const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
const register = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, email, password, consentToDataShare } = req.body;
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ error: 'Email already registered.' });
        }
        const user = await User.create({
            name,
            email,
            passwordHash: password,
            consentToDataShare: consentToDataShare || false,
        });
        const token = signToken(user._id);
        res.status(201).json({ token, user: user.toSafeObject() });
    } catch (err) {
        next(err);
    }
};

// POST /api/auth/login
const login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+passwordHash');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        const token = signToken(user._id);
        res.json({ token, user: user.toSafeObject() });
    } catch (err) {
        next(err);
    }
};

// GET /api/auth/me
const getMe = async (req, res) => {
    res.json({ user: req.user });
};

// PUT /api/auth/me
const updateMe = async (req, res, next) => {
    try {
        const { name, email } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name, email },
            { new: true, runValidators: true }
        );
        res.json({ user: user.toSafeObject() });
    } catch (err) {
        next(err);
    }
};

// PUT /api/auth/me/password
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id).select('+passwordHash');
        if (!(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ error: 'Current password is incorrect.' });
        }
        user.passwordHash = newPassword;
        await user.save();
        res.json({ message: 'Password updated successfully.' });
    } catch (err) {
        next(err);
    }
};

module.exports = { register, login, getMe, updateMe, changePassword };
