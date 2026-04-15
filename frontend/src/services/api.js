import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interview endpoints
export const interviewAPI = {
  generateQuestions: (data) => apiClient.post('/interviews/generate-questions', data),
  evaluateAnswer: (data) => apiClient.post('/interviews/evaluate-answer', data),
  getNextQuestion: (data) => apiClient.post('/interviews/next-question', data),
  completeInterview: (data) => apiClient.post('/interviews/complete', data)
};

// Session endpoints
export const sessionAPI = {
  getAllSessions: (userId) => apiClient.get(`/sessions/user/${userId}`),
  getSession: (sessionId) => apiClient.get(`/sessions/${sessionId}`),
  deleteSession: (sessionId) => apiClient.delete(`/sessions/${sessionId}`)
};

// Analytics endpoints
export const analyticsAPI = {
  getUserAnalytics: (userId) => apiClient.get(`/analytics/user/${userId}`),
  getSessionPerformance: (sessionId) => apiClient.get(`/analytics/session/${sessionId}`)
};

// Health check
export const healthCheck = () => apiClient.get('https://localhost:5000/api/health');

export default apiClient;
