const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getExpenses, createExpense, getExpense, updateExpense, deleteExpense,
    getMonthlySummary, getCategorySummary, getTopMerchants,
} = require('../controllers/expenseController');

// Aggregate routes BEFORE /:id
router.get('/summary/monthly', protect, getMonthlySummary);
router.get('/summary/category', protect, getCategorySummary);
router.get('/summary/top-merchants', protect, getTopMerchants);

router.route('/')
    .get(protect, getExpenses)
    .post(protect, createExpense);

router.route('/:id')
    .get(protect, getExpense)
    .put(protect, updateExpense)
    .delete(protect, deleteExpense);

module.exports = router;
