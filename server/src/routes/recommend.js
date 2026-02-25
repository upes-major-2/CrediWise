const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getRecommendations } = require('../controllers/recommendController');

router.post('/', protect, getRecommendations);

module.exports = router;
