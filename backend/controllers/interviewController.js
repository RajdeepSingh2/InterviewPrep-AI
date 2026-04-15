const aiService = require('../services/aiService');
const sessionService = require('../services/sessionService');
const logger = require('../utils/logger');

const generateQuestions = async (req, res) => {
  try {
    const { role, resume, userId } = req.body;
    
    if (!role || !resume|| !userId) {
      return res.status(400).json({
        success: false,
        message: 'Role, resume, and userId are required'
      });
    }
    
    // Create a session first
    const session = await sessionService.createSession(userId, role, resume);
    
    // Generate questions using AI
    const questions = await aiService.generateQuestions(role, resume);
    
    // Update session with generated questions
    session.questionsGenerated = [
      ...questions.technical,
      ...questions.hr,
      ...questions.project,
      ...questions.followup
    ];
    await session.save();
    
    logger.log(`Questions generated for session: ${session._id}`);
    
    res.status(200).json({
      success: true,
      sessionId: session._id,
      questions: questions,
      totalQuestions: session.questionsGenerated.length
    });
  } catch (error) {
    logger.error(`Generate Questions Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to generate questions',
      error: error.message
    });
  }
};

const evaluateAnswer = async (req, res) => {
  try {
    const { sessionId, question, userAnswer, answerNumber, answerType, questionType, speakingAnalysis } = req.body;
    
    // Extract question text if it's an object
    const questionText = typeof question === 'string' ? question : (question?.text || JSON.stringify(question));
    const topicFromQuestion = typeof question === 'object' ? question?.topic : null;
    
    console.log("📥 Received req.body.speakingAnalysis:", speakingAnalysis);
    console.log("📥 Received answerType:", answerType);
    console.log("📥 Question received:", question);
    console.log("📥 Extracted question text:", questionText);
    console.log("📥 Full req.body:", JSON.stringify(req.body, null, 2));
    
    if (!sessionId || !questionText || !userAnswer) {
      return res.status(400).json({
        success: false,
        message: 'SessionId, question, and userAnswer are required'
      });
    }
    
    // Get session to access role and other context
    const session = await sessionService.getSessionById(sessionId);
    const role = session.role;
    
    // Evaluate answer using AI
    const evaluation = await aiService.evaluateAnswer(questionText, userAnswer, role);
    
    // Create answer object
    const answerObject = {
      questionId: `q_${answerNumber}`,
      question: questionText,
      userAnswer,
      questionType: questionType || topicFromQuestion || 'adaptive',
      answerType: answerType || 'text',
      mode: answerType || 'text',
      topic: topicFromQuestion || questionType || 'General',
      aiScore: evaluation.score,
      confidenceScore: speakingAnalysis?.confidenceScore || 0,
      wpm: speakingAnalysis?.wordsPerMinute || 0,
      fillerWords: speakingAnalysis?.fillerWords || 0,
      pauseCount: speakingAnalysis?.pauseCount || 0,
      hesitationCount: speakingAnalysis ? (speakingAnalysis.pauseCount || 0) + (speakingAnalysis.fillerWords || 0) : 0,
      speakingAnalysis,
      aiFeedback: evaluation.feedback,
      strengths: evaluation.strengths,
      weaknesses: evaluation.weaknesses,
      suggestedAnswer: evaluation.suggestedAnswer,
      missingConcepts: evaluation.missingConcepts
    };

    // Include speaking analysis if provided (voice mode)
    if (speakingAnalysis && answerType === 'voice') {
      answerObject.speakingAnalysis = speakingAnalysis;
      console.log('Speaking analysis saved for answer:', speakingAnalysis);
    }
    
    // Save answer to session
    await sessionService.updateSessionAnswers(sessionId, answerObject);
    
    console.log('=== EVALUATE RESPONSE ===');
    console.log('Returning speakingAnalysis:', speakingAnalysis);
    console.log('Answer type being returned:', answerType);
    
    res.status(200).json({
      success: true,
      evaluation: {
        score: evaluation.score,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        suggestedAnswer: evaluation.suggestedAnswer,
        missingConcepts: evaluation.missingConcepts
      },
      speakingAnalysis: speakingAnalysis || null,
      answerType: answerType
    });
  } catch (error) {
    logger.error(`Evaluate Answer Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to evaluate answer',
      error: error.message
    });
  }
};

const getNextQuestion = async (req, res) => {
  try {
    const { sessionId, currentScore } = req.body;
    
    if (!sessionId || currentScore === undefined) {
      return res.status(400).json({
        success: false,
        message: 'SessionId and currentScore are required'
      });
    }
    
    // Get session details
    const session = await sessionService.getSessionById(sessionId);
    
    // Get previously asked questions
    const previousQuestions = session.answers.map(a => a.question);
    
    // Generate next question based on difficulty
    const nextQuestion = await aiService.generateNextQuestion(
      currentScore,
      previousQuestions,
      session.role,
      session.resume
    );
    
    logger.log(`Next question generated for session: ${sessionId}`);
    
    res.status(200).json({
      success: true,
      question: nextQuestion.question,
      type: nextQuestion.type
    });
  } catch (error) {
    logger.error(`Get Next Question Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to generate next question',
      error: error.message
    });
  }
};

const completeInterview = async (req, res) => {
  try {
    const { sessionId, totalScore } = req.body;
    
    console.log('=== COMPLETE INTERVIEW REQUEST ===');
    console.log('Received payload:', JSON.stringify({ sessionId, totalScore }, null, 2));
    logger.log(`Completing interview - SessionId: ${sessionId}, TotalScore: ${totalScore}`);
    
    if (!sessionId || totalScore === undefined) {
      console.error('VALIDATION ERROR: Missing required fields');
      logger.error(`Missing required fields - SessionId: ${sessionId}, TotalScore: ${totalScore}`);
      return res.status(400).json({
        success: false,
        message: 'SessionId and totalScore are required'
      });
    }
    
    // Validate session exists and has answers
    console.log(`Looking for session: ${sessionId}`);
    const session = await sessionService.getSessionById(sessionId);
    if (!session) {
      console.error(`SESSION NOT FOUND: ${sessionId}`);
      logger.error(`Session not found: ${sessionId}`);
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    console.log(`Session found: ${session._id}, Status: ${session.status}, Answers: ${session.answers.length}`);
    
    if (session.status === 'completed') {
      console.log(`Session already completed: ${sessionId}`);
      logger.log(`Session already completed: ${sessionId}`);
      return res.status(200).json({
        success: true,
        message: 'Interview already completed',
        session: {
          sessionId: session._id,
          totalScore: session.totalScore,
          questionsCount: session.answers.length
        }
      });
    }
    
    if (!session.answers || session.answers.length === 0) {
      console.error(`SESSION HAS NO ANSWERS: ${sessionId}`);
      logger.error(`Session has no answers: ${sessionId}`);
      return res.status(400).json({
        success: false,
        message: 'Cannot complete interview with no answers'
      });
    }
    
    console.log(`Session validation passed. Completing session...`);
    logger.log(`Session validation passed with ${session.answers.length} answers`);
    
    // Complete the session
    const completedSession = await sessionService.completeSession(sessionId, totalScore);
    
    console.log(`=== COMPLETION SUCCESSFUL ===`);
    console.log('Completed session:', JSON.stringify({
      sessionId: completedSession._id,
      status: completedSession.status,
      totalScore: completedSession.totalScore,
      answersCount: completedSession.answers.length
    }, null, 2));
    
    logger.log(`Interview completed successfully for session: ${sessionId}`);
    
    res.status(200).json({
      success: true,
      message: 'Interview completed successfully',
      session: {
        sessionId: completedSession._id,
        totalScore: completedSession.totalScore,
        questionsCount: completedSession.answers.length
      }
    });
  } catch (error) {
    console.error('=== EXCEPTION IN COMPLETE INTERVIEW ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    logger.error(`Complete Interview Error: ${error.message}`);
    logger.error(`Error stack: ${error.stack}`);
    res.status(500).json({
      success: false,
      message: 'Failed to complete interview',
      error: error.message
    });
  }
};

module.exports = {
  generateQuestions,
  evaluateAnswer,
  getNextQuestion,
  completeInterview
};
