const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  resume: {
    type: String,
    required: true
  },
  questionsGenerated: {
    type: Array,
    default: []
  },
  answers: [
    {
      questionId: String,
      question: String,
      questionType: {
        type: String,
        enum: ['technical', 'hr', 'project', 'followup']
      },
      userAnswer: String,
      answerType: {
        type: String,
        enum: ['text', 'voice'],
        default: 'text'
      },
      aiScore: Number,
      aiFeedback: String,
      strengths: [String],
      weaknesses: [String],
      suggestedAnswer: String,
      missingConcepts: [String],
      speakingAnalysis: {
        wordsPerMinute: Number,
        fillerWords: Number,
        fillerWordsList: [
          {
            word: String,
            time: Number
          }
        ],
        longestPause: Number,
        confidenceScore: Number,
        suggestions: [String],
        totalWords: Number,
        duration: Number
      }
    }
  ],
  totalScore: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed'],
    default: 'in-progress'
  },
  interviewMode: {
    type: String,
    enum: ['text', 'voice', 'mixed'],
    default: 'text'
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  duration: {
    type: Number,
    default: 0
  },
  topicWiseScores: {
    technical: { type: Number, default: 0 },
    hr: { type: Number, default: 0 },
    project: { type: Number, default: 0 },
    followup: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);