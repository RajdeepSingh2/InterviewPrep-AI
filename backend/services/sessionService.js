const Session = require('../models/Session');
const logger = require('../utils/logger');

const createSession = async (userId, role, resume) => {
  try {
    const session = new Session({
      userId,
      role,
      resume,
      questionsGenerated: []
    });
    
    await session.save();
    logger.log(`Session created: ${session._id}`);
    return session;
  } catch (error) {
    logger.error(`Create Session Error: ${error.message}`);
    throw error;
  }
};

const getSessionById = async (sessionId) => {
  try {
    const session = await Session.findById(sessionId).populate('userId', 'name email');
    return session;
  } catch (error) {
    logger.error(`Get Session Error: ${error.message}`);
    throw error;
  }
};

const getUserSessions = async (userId) => {
  try {
    const sessions = await Session.find({ userId })
      .sort({ createdAt: -1 });
    return sessions;
  } catch (error) {
    logger.error(`Get User Sessions Error: ${error.message}`);
    throw error;
  }
};

const updateSessionAnswers = async (sessionId, answer) => {
  try {
    const session = await Session.findByIdAndUpdate(
      sessionId,
      { $push: { answers: answer } },
      { new: true }
    );
    return session;
  } catch (error) {
    logger.error(`Update Session Answers Error: ${error.message}`);
    throw error;
  }
};

const completeSession = async (sessionId, totalScore) => {
  try {
    console.log(`[CompleteSession] Starting - SessionId: ${sessionId}, TotalScore: ${totalScore}`);
    logger.log(`Completing session ${sessionId} with score ${totalScore}`);
    
    // First get the session to calculate topic-wise scores
    console.log(`[CompleteSession] Finding session by ID...`);
    const session = await Session.findById(sessionId);
    if (!session) {
      console.error(`[CompleteSession] Session not found!`);
      throw new Error(`Session not found: ${sessionId}`);
    }
    
    console.log(`[CompleteSession] Session found with ${session.answers.length} answers, userId: ${session.userId}`);
    
    // Calculate topic-wise scores from answers - dynamically handle any topic
    const topicScores = {};
    
    session.answers.forEach(answer => {
      if (answer.questionType && answer.aiScore !== undefined) {
        const topic = answer.questionType;
        
        // Dynamically initialize topic array if it doesn't exist
        if (!topicScores[topic]) {
          topicScores[topic] = [];
        }
        
        topicScores[topic].push(answer.aiScore);
      }
    });
    
    console.log(`[CompleteSession] Topics found in answers:`, Object.keys(topicScores));
    
    // Calculate averages for each topic
    const topicWiseScores = {};
    Object.keys(topicScores).forEach(topic => {
      const scores = topicScores[topic];
      if (scores.length > 0) {
        topicWiseScores[topic] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      } else {
        topicWiseScores[topic] = 0;
      }
    });
    
    console.log(`[CompleteSession] Topic-wise scores calculated:`, topicWiseScores);
    
    console.log(`[CompleteSession] Topic-wise scores calculated:`, topicWiseScores);
    logger.log(`Calculated topic-wise scores for session ${sessionId}:`, topicWiseScores);
    
    // Update session with completion data and topic scores
    console.log(`[CompleteSession] Updating session...`);
    const updatedSession = await Session.findByIdAndUpdate(
      sessionId,
      {
        status: 'completed',
        totalScore,
        completedAt: new Date(),
        topicWiseScores
      },
      { new: true }
    );
    
    if (!updatedSession) {
      console.error(`[CompleteSession] Update returned null`);
      throw new Error(`Failed to update session`);
    }
    
    console.log(`[CompleteSession] Session updated. Now checking userId: ${session.userId}`);
    logger.log(`Session updated: ${updatedSession._id}`);
    
    // Note: User collection update skipped - userId is a custom string, not MongoDB ObjectId
    // Analytics are calculated from Session records via userId, so User model not needed
    // If you want to track user stats, add userId field to User schema and update query accordingly
    console.log(`[CompleteSession] User stats tracked via Session records (userId: ${session.userId})`);
    logger.log(`Session completion tracked for userId: ${session.userId}`);
    
    console.log(`[CompleteSession] SUCCESS - Returning updated session`);
    logger.log(`Session completed: ${sessionId}`);
    return updatedSession;
  } catch (error) {
    console.error(`[CompleteSession] ERROR - ${error.message}`);
    console.error(`[CompleteSession] Error stack:`, error.stack);
    logger.error(`Complete Session Error: ${error.message}`);
    logger.error(`Error stack: ${error.stack}`);
    throw error;
  }
};

const deleteSession = async (sessionId) => {
  try {
    await Session.findByIdAndDelete(sessionId);
    logger.log(`Session deleted: ${sessionId}`);
  } catch (error) {
    logger.error(`Delete Session Error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  createSession,
  getSessionById,
  getUserSessions,
  updateSessionAnswers,
  completeSession,
  deleteSession
};
