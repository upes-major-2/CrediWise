const express = require('express');
const router = express.Router();
const { protect, requireAdmin } = require('../middleware/auth');
const {
    getInstruments, createInstrument, getInstrument,
    updateInstrument, deleteInstrument, getAllInstruments,
} = require('../controllers/instrumentController');

// Admin route must come before /:id to avoid conflict
router.get('/admin/all', protect, requireAdmin, getAllInstruments);

router.route('/')
    .get(protect, getInstruments)
    .post(protect, createInstrument);

router.route('/:id')
    .get(protect, getInstrument)
    .put(protect, updateInstrument)
    .delete(protect, deleteInstrument);

module.exports = router;
