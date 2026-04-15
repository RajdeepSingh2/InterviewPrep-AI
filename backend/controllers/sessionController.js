const sessionService = require('../services/sessionService');
const logger = require('../utils/logger');

const getAllSessions = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'UserId is required'
      });
    }
    
    const sessions = await sessionService.getUserSessions(userId);
    
    logger.log(`Retrieved ${sessions.length} sessions for user: ${userId}`);
    
    res.status(200).json({
      success: true,
      sessions
    });
  } catch (error) {
    logger.error(`Get All Sessions Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve sessions',
      error: error.message
    });
  }
};

const getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'SessionId is required'
      });
    }
    
    const session = await sessionService.getSessionById(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    logger.log(`Retrieved session: ${sessionId}`);
    
    res.status(200).json({
      success: true,
      session
    });
  } catch (error) {
    logger.error(`Get Session Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve session',
      error: error.message
    });
  }
};

const deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'SessionId is required'
      });
    }
    
    await sessionService.deleteSession(sessionId);
    
    logger.log(`Deleted session: ${sessionId}`);
    
    res.status(200).json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    logger.error(`Delete Session Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to delete session',
      error: error.message
    });
  }
};

module.exports = {
  getAllSessions,
  getSession,
  deleteSession
};
