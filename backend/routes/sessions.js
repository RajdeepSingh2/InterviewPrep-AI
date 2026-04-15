const express = require('express');
const sessionController = require('../controllers/sessionController');

const router = express.Router();

// Get all sessions for a user
router.get('/user/:userId', sessionController.getAllSessions);

// Get single session
router.get('/:sessionId', sessionController.getSession);

// Delete session
router.delete('/:sessionId', sessionController.deleteSession);

module.exports = router;
