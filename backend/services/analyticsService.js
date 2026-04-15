const Session = require('../models/Session');
const logger = require('../utils/logger');

const getAnalytics = async (userId) => {
  try {
    const sessions = await Session.find({ userId, status: 'completed' }).sort({ completedAt: 1 });
    logger.log(`Found ${sessions.length} completed sessions for user ${userId}`);

    if (sessions.length === 0) {
      return {
        totalInterviews: 0,
        averageScore: 0,
        avgInterviewScore: 0,
        avgConfidence: 0,
        strongestTopic: { name: 'No data', score: 0 },
        weakestTopic: { name: 'No data', score: 0 },
        mostImprovedTopic: { name: 'No significant improvement', improvement: 0 },
        practiceRecommendations: [],
        recentSessions: [],
        topicWisePerformance: {},
        speakingTrend: {}
      };
    }

    const totalInterviews = sessions.length;
    const averageScore = Math.round(sessions.reduce((sum, s) => sum + s.totalScore, 0) / totalInterviews);

    // per-topic aggregated stats from answers
    const topicStats = {};
    const sessionConfidences = [];

    sessions.forEach(s => {
      const answers = s.answers || [];
      const topicSums = {};
      const topicCounts = {};
      let sessionConfidence = 0;
      let voiceAnswersCount = 0;

      answers.forEach(answer => {
        const topic = answer.topic || 'General';
        if (!topicStats[topic]) topicStats[topic] = { sum: 0, count: 0 };
        if (answer.aiScore !== undefined && answer.aiScore !== null) {
          topicStats[topic].sum += answer.aiScore;
          topicStats[topic].count += 1;
        }

        if (answer.answerType === 'voice' || answer.mode === 'voice') {
          if (answer.confidenceScore !== undefined && answer.confidenceScore !== null) {
            sessionConfidence += answer.confidenceScore;
            voiceAnswersCount += 1;
          }
        }
      });

      const avgSessionConfidence = voiceAnswersCount ? sessionConfidence / voiceAnswersCount : null;
      if (avgSessionConfidence !== null) sessionConfidences.push(avgSessionConfidence);
    });

    const topicAverages = {};
    Object.entries(topicStats).forEach(([topic, stats]) => {
      if (stats.count > 0) topicAverages[topic] = Math.round(stats.sum / stats.count);
    });

    // strongest and weakest topics
    const sortedTopicAverages = Object.entries(topicAverages).sort((a, b) => b[1] - a[1]);
    let strongestTopic;
    let weakestTopic;
    if (sortedTopicAverages.length === 1) {
      strongestTopic = { name: 'Only topic available', score: sortedTopicAverages[0][1] };
      weakestTopic = { name: 'Only topic available', score: sortedTopicAverages[0][1] };
    } else if (sortedTopicAverages.length > 1) {
      strongestTopic = { name: sortedTopicAverages[0][0], score: sortedTopicAverages[0][1] };
      weakestTopic = { name: sortedTopicAverages[sortedTopicAverages.length - 1][0], score: sortedTopicAverages[sortedTopicAverages.length - 1][1] };
    } else {
      strongestTopic = { name: 'No topic data', score: 0 };
      weakestTopic = { name: 'No topic data', score: 0 };
    }

    // Most improved topic by comparing first vs latest session topic averages
    const firstSession = sessions[0];
    const lastSession = sessions[sessions.length - 1];

    const topicAveragesFirst = {};
    const topicAveragesLast = {};

    const fillTopicMap = (session, map) => {
      (session.answers || []).forEach(answer => {
        const t = answer.topic || 'General';
        if (!map[t]) map[t] = { sum: 0, count: 0 };
        if (answer.aiScore !== undefined && answer.aiScore !== null) {
          map[t].sum += answer.aiScore;
          map[t].count += 1;
        }
      });
    };
    fillTopicMap(firstSession, topicAveragesFirst);
    fillTopicMap(lastSession, topicAveragesLast);

    const improvements = [];
    Object.keys({ ...topicAveragesFirst, ...topicAveragesLast }).forEach(topic => {
      const first = topicAveragesFirst[topic]?.count ? topicAveragesFirst[topic].sum / topicAveragesFirst[topic].count : 0;
      const last = topicAveragesLast[topic]?.count ? topicAveragesLast[topic].sum / topicAveragesLast[topic].count : 0;
      improvements.push({ topic, delta: Math.round(last - first) });
    });

    const bestImprovement = improvements.filter(i => i.delta >= 1).sort((a, b) => b.delta - a.delta)[0];
    const mostImprovedTopic = bestImprovement ? { name: bestImprovement.topic, improvement: bestImprovement.delta } : { name: 'No significant improvement', improvement: 0 };

    // Prepare recent sessions with final averaged confidence
    const recentSessions = sessions.slice(-5).map(s => {
      const voiceAnswers = (s.answers || []).filter(a => a.mode === 'voice' || a.answerType === 'voice');
      const avgConfidence = voiceAnswers.length ? Math.round(voiceAnswers.reduce((sum, a) => sum + (a.confidenceScore || 0), 0) / voiceAnswers.length) : null;
      const avgWPM = voiceAnswers.length ? Math.round(voiceAnswers.reduce((sum, a) => sum + (a.wpm || 0), 0) / voiceAnswers.length) : null;
      const totalFillerWords = voiceAnswers.reduce((sum, a) => sum + (a.fillerWords || 0), 0);

      // Most common weakness per session (ai response weaknesses aggregated)
      const weaknessCount = {};
      (s.answers || []).flatMap(a => a.weaknesses || []).forEach(w => {
        weaknessCount[w] = (weaknessCount[w] || 0) + 1;
      });
      const mostCommonWeakness = Object.entries(weaknessCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

      return {
        _id: s._id,
        role: s.role,
        totalScore: s.totalScore,
        completedAt: s.completedAt,
        questionsCount: s.answers?.length || 0,
        interviewMode: s.interviewMode || 'text',
        difficulty: s.difficulty || 'Medium',
        averageConfidence: avgConfidence,
        averageWpm: avgWPM,
        totalFillerWords,
        weakestTopic: Object.entries(s.topicWiseScores || {}).sort((a, b) => a[1] - b[1])[0]?.[0] || 'N/A',
        mostCommonFiller: (() => {
          const fillerWords = {};
          voiceAnswers.forEach(a => (a.fillerWordsList || []).forEach(item => {
            const w = (item.word || '').toLowerCase(); if (w) fillerWords[w] = (fillerWords[w] || 0) + 1;
          }));
          return Object.entries(fillerWords).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
        })(),
        mostCommonWeakness
      };
    });

    const avgConfidence = sessionConfidences.length ? Number((sessionConfidences.reduce((a, b) => a + b, 0) / sessionConfidences.length).toFixed(1)) : 0;

    const confidenceScores = sessions
      .flatMap(session => session.answers || [])
      .map(answer => answer.speakingAnalysis?.confidenceScore)
      .filter(score => typeof score === 'number');

    const wpmScores = sessions
      .flatMap(session => session.answers || [])
      .map(answer => answer.speakingAnalysis?.wordsPerMinute)
      .filter(score => typeof score === 'number');

    const fillerCounts = sessions
      .flatMap(session => session.answers || [])
      .map(answer => answer.speakingAnalysis?.fillerWords)
      .filter(score => typeof score === 'number');

    const pauseDurations = sessions
      .flatMap(session => session.answers || [])
      .map(answer => answer.speakingAnalysis?.longestPause)
      .filter(score => typeof score === 'number');

    const averageConfidence = confidenceScores.length > 0
      ? Math.round(confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length)
      : 0;

    const averageWPM = wpmScores.length > 0
      ? Math.round(wpmScores.reduce((sum, wpm) => sum + wpm, 0) / wpmScores.length)
      : 0;

    const averageFillerWords = fillerCounts.length > 0
      ? Math.round(fillerCounts.reduce((sum, f) => sum + f, 0) / fillerCounts.length)
      : 0;

    const longestPauseAverage = pauseDurations.length > 0
      ? Number((pauseDurations.reduce((sum, p) => sum + p, 0) / pauseDurations.length).toFixed(1))
      : 0;

    const improvementPercentage = recentSessions.length > 0
      ? Math.round(
          ((averageConfidence - (recentSessions[0].averageConfidence || 0)) /
          Math.max(1, (recentSessions[0].averageConfidence || 1))) * 100
        )
      : 0;

    const tells = {
      totalFillerWords: Object.values(topicStats).reduce((sum, stat) => sum + (stat.fillerWords || 0), 0)
    };

    console.log("speakingTrend values:", {
      averageConfidence,
      averageWPM,
      averageFillerWords,
      longestPauseAverage,
      improvementPercentage
    });

    const finalResult = {
      totalInterviews,
      averageScore,
      avgInterviewScore: averageScore,
      avgConfidence,
      strongestTopic,
      weakestTopic,
      mostImprovedTopic,
      practiceRecommendations: [],
      recentSessions,
      topicWisePerformance: topicAverages,
      speakingTrend: {
        points: recentSessions.map(r => ({
          date: r.completedAt,
          avgConfidence: r.averageConfidence,
          avgWPM: r.averageWpm,
          totalFillerWords: r.totalFillerWords,
          mostCommonWeakness: r.mostCommonWeakness
        })),
        averageConfidence,
        averageWPM: recentSessions.reduce((sum, r) => sum + (r.averageWpm || 0), 0) / Math.max(1, recentSessions.length),
        averageFillerWords: recentSessions.reduce((sum, r) => sum + (r.totalFillerWords || 0), 0) / Math.max(1, recentSessions.length),
        improvementPercent: Math.round((avgConfidence / (sessions[0]?.answers?.filter(a => a.mode === 'voice' || a.answerType === 'voice').length ? (sessions[0].answers.filter(a => a.mode === 'voice' || a.answerType === 'voice').reduce((sum, a) => sum + (a.confidenceScore || 0), 0) / Math.max(1, sessions[0].answers.filter(a => a.mode === 'voice' || a.answerType === 'voice').length)) : 1) - 1) * 100 )
      },
      practiceRecommendations: []
    };

    // practice recommendations based on weakest and speaking
    if (weakestTopic.name && weakestTopic.name !== 'No topic data' && weakestTopic.name !== 'Only topic available') {
      finalResult.practiceRecommendations.push(`Practice 3 ${weakestTopic.name} questions`);
    }
    if (avgConfidence && avgConfidence < 80) finalResult.practiceRecommendations.push(`Raise average confidence from ${avgConfidence}% to 85%+`);
    if (avgConfidence && avgConfidence >= 80) finalResult.practiceRecommendations.push('Keep the speaking consistency strong, focus on tricky topics.');

    logger.log('Final analytics computed', finalResult);
    return finalResult;
  } catch (error) {
    logger.error(`Get Analytics Error: ${error.message}`);
    throw error;
  }
};

const getSessionDetails = async (sessionId) => {
  try {
    const session = await Session.findById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    return session;
  } catch (error) {
    logger.error(`Get Session Details Error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  getAnalytics,
  getSessionDetails
};
