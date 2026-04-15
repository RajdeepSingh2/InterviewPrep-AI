const express = require('express');
const analyticsController = require('../controllers/analyticsController');

const router = express.Router();

// Get user analytics
router.get('/user/:userId', analyticsController.getUserAnalytics);

// Get session performance
router.get('/session/:sessionId', analyticsController.getSessionPerformance);

module.exports = router;
