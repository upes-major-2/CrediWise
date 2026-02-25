const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getOverview, getMonthlyTrend, getCategoryBreakdown, getInstrumentPerformance, getHighSpendAlerts } = require('../controllers/analyticsController');

router.get('/overview', protect, getOverview);
router.get('/monthly-trend', protect, getMonthlyTrend);
router.get('/category-breakdown', protect, getCategoryBreakdown);
router.get('/instrument-performance', protect, getInstrumentPerformance);
router.get('/high-spend-alerts', protect, getHighSpendAlerts);

module.exports = router;
