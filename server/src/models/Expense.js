const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0.01, 'Amount must be greater than 0'],
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: ['dining', 'travel', 'groceries', 'fuel', 'shopping', 'utilities', 'entertainment', 'healthcare', 'education', 'general'],
            index: true,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 300,
        },
        merchantName: {
            type: String,
            trim: true,
        },
        date: {
            type: Date,
            default: Date.now,
            index: true,
        },
        paymentInstrumentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PaymentInstrument',
            default: null,
        },
        recommendedInstrumentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PaymentInstrument',
            default: null,
        },
        rewardEarned: {
            type: Number,
            default: 0,
            min: 0,
        },
        tags: [{ type: String, trim: true }],
    },
    { timestamps: true }
);

// Compound index for common queries
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
