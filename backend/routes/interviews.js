const express = require('express');
const interviewController = require('../controllers/interviewController');

const router = express.Router();

// Generate questions for interview
router.post('/generate-questions', interviewController.generateQuestions);

// Evaluate answer
router.post('/evaluate-answer', interviewController.evaluateAnswer);

// Get next question
router.post('/next-question', interviewController.getNextQuestion);

// Complete interview
router.post('/complete', interviewController.completeInterview);

module.exports = router;
