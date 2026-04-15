const analyticsService = require('../services/analyticsService');
const logger = require('../utils/logger');

const getUserAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'UserId is required'
      });
    }
    
    const analytics = await analyticsService.getAnalytics(userId);
    
    logger.log(`Retrieved analytics for user: ${userId}`);
    
    res.status(200).json({
      success: true,
      analytics
    });
  } catch (error) {
    logger.error(`Get Analytics Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics',
      error: error.message
    });
  }
};

const getSessionPerformance = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'SessionId is required'
      });
    }
    
    const session = await analyticsService.getSessionDetails(sessionId);
    
    // Process session data for performance metrics
    const performance = {
      totalScore: session.totalScore,
      totalQuestions: session.answers.length,
      averageScorePerQuestion: Math.round(session.totalScore / session.answers.length),
      questionDetails: session.answers.map(answer => ({
        question: answer.question,
        score: answer.aiScore,
        type: answer.questionType
      })),
      role: session.role,
      date: session.completedAt
    };
    
    logger.log(`Retrieved performance for session: ${sessionId}`);
    
    res.status(200).json({
      success: true,
      performance
    });
  } catch (error) {
    logger.error(`Get Session Performance Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve performance',
      error: error.message
    });
  }
};

module.exports = {
  getUserAnalytics,
  getSessionPerformance
};
