const mongoose = require('mongoose');

const rewardRuleSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['dining', 'travel', 'groceries', 'fuel', 'shopping', 'utilities', 'entertainment', 'healthcare', 'education', 'general'],
    },
    rewardType: {
        type: String,
        enum: ['cashback', 'points', 'miles'],
        default: 'cashback',
    },
    ratePercent: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    pointValueINR: {
        type: Number,
        default: 1, // 1 point = ₹1 by default (cashback)
        min: 0,
    },
    cap: {
        type: Number,
        default: 0, // 0 = unlimited
        min: 0,
    },
    minTransactionAmount: {
        type: Number,
        default: 0,
        min: 0,
    },
}, { _id: false });

const milestoneSchema = new mongoose.Schema({
    spendThreshold: { type: Number, required: true },
    bonusValue: { type: Number, required: true },
    bonusType: { type: String, default: 'cashback' },
    description: { type: String },
}, { _id: false });

const paymentInstrumentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Instrument name is required'],
            trim: true,
        },
        type: {
            type: String,
            enum: ['credit_card', 'debit_card', 'wallet', 'upi'],
            required: true,
        },
        network: {
            type: String,
            enum: ['Visa', 'Mastercard', 'RuPay', 'Amex', 'UPI', 'Other'],
            default: 'Other',
        },
        bankOrProvider: {
            type: String,  // e.g. "HDFC", "SBI", "Paytm"
            trim: true,
        },
        rewardRules: [rewardRuleSchema],
        milestoneIncentives: [milestoneSchema],
        annualFee: {
            type: Number,
            default: 0,
            min: 0,
        },
        creditLimit: {
            type: Number,
            min: 0,
        },
        billingCycleDay: {
            type: Number,
            min: 1,
            max: 28,
            default: 1,
        },
        currentMonthSpend: {
            type: Number,
            default: 0,
            min: 0,
        },
        color: {
            type: String,
            default: '#3B82F6', // accent blue for card display
        },
        notes: {
            type: String,
            maxlength: 500,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// Index for performance
paymentInstrumentSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('PaymentInstrument', paymentInstrumentSchema);
