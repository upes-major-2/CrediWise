const express = require('express');
const router = express.Router();
const { protect, requireAdmin } = require('../middleware/auth');
const { getUsers, getUser, deleteUser, getStats } = require('../controllers/adminController');

router.use(protect, requireAdmin);

router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.delete('/users/:id', deleteUser);
router.get('/stats', getStats);

module.exports = router;
