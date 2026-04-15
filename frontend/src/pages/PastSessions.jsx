import React, { useEffect, useState } from 'react';
import { sessionAPI } from '../services/api';
import { generateUserId, formatDate, getScoreColor } from '../utils/helpers';
import LoadingAnimation from '../components/LoadingAnimation';
import { FaTrash, FaEye, FaMicrophone } from 'react-icons/fa';
import './Pages.css';

const PastSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const userId = generateUserId();
        const response = await sessionAPI.getAllSessions(userId);
        
        if (response.data.success) {
          setSessions(response.data.sessions);
        }
      } catch (err) {
        console.error('Failed to fetch sessions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleDelete = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await sessionAPI.deleteSession(sessionId);
        setSessions(sessions.filter(s => s._id !== sessionId));
        setSelectedSession(null);
      } catch (err) {
        console.error('Failed to delete session:', err);
      }
    }
  };

  const [expandedQuestions, setExpandedQuestions] = useState([]);

  const filteredSessions = sessions.filter(s => {
    if (filter === 'all') return true;
    return s.role === filter;
  });

  const toggleQuestionExpand = (index) => {
    setExpandedQuestions(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };

  const getSessionMetrics = (session) => {
    const topicScores = session.topicWiseScores || {};
    const weakestTopicEntry = Object.entries(topicScores).sort((a, b) => a[1] - b[1])[0] || ['N/A', 0];

    const voiceAnswers = (session.answers || []).filter(a => a.answerType === 'voice' && a.speakingAnalysis);
    const avgConfidence = voiceAnswers.length ? Math.round(voiceAnswers.reduce((sum, a) => sum + (a.speakingAnalysis.confidenceScore || 0), 0) / voiceAnswers.length) : 0;

    const fillerWordCount = {};
    voiceAnswers.forEach(a => (a.speakingAnalysis?.fillerWordsList || []).forEach(item => {
      const word = (item.word || '').toLowerCase();
      if (word) fillerWordCount[word] = (fillerWordCount[word] || 0) + 1;
    }));
    const mostCommonFiller = Object.entries(fillerWordCount).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      interviewMode: session.interviewMode || 'text',
      difficulty: session.difficulty || 'Medium',
      confidence: avgConfidence,
      weakestTopic: weakestTopicEntry[0],
      mostCommonFiller
    };
  };

  if (loading) {
    return <div className="page"><LoadingAnimation message="Loading past sessions..." /></div>;
  }

  if (sessions.length === 0) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>No past sessions yet</h2>
          <p style={{ color: '#888' }}>Complete your first interview to see sessions here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ padding: '2rem' }}>
      <div className="container">
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Past Interview Sessions 📚</h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '300px 1fr',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Sessions List */}
          <div style={{
            background: 'rgba(26, 31, 46, 0.8)',
            border: '2px solid rgba(0, 150, 255, 0.2)',
            borderRadius: '12px',
            padding: '1.5rem',
            backdropFilter: 'blur(10px)',
            maxHeight: '600px',
            overflowY: 'auto'
          }}>
            <div style={{
              marginBottom: '1rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid rgba(0, 150, 255, 0.2)'
            }}>
              <label style={{ color: '#00d4ff', display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Filter by Role
              </label>
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '2px solid rgba(0, 150, 255, 0.2)',
                  borderRadius: '6px',
                  color: '#e0e0e0'
                }}
              >
                <option value="all">All Roles</option>
                {[...new Set(sessions.map(s => s.role))].map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            {filteredSessions.map(session => {
              const metrics = getSessionMetrics(session);
              return (
                <div
                  key={session._id}
                  onClick={() => setSelectedSession(session)}
                  style={{
                    padding: '1rem',
                    marginBottom: '0.75rem',
                    background: selectedSession?._id === session._id ? 'rgba(0, 150, 255, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                    border: selectedSession?._id === session._id ? '2px solid #00d4ff' : '2px solid transparent',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ color: '#00d4ff', fontWeight: '600', marginBottom: '0.25rem' }}>
                    {session.role}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.25rem' }}>
                    {formatDate(session.completedAt || session.updatedAt)}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    <span style={{ background: '#10b981', color: 'white', padding: '0.15rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem' }}>{metrics.interviewMode.toUpperCase()}</span>
                    <span style={{ background: '#a855f7', color: 'white', padding: '0.15rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem' }}>{metrics.difficulty}</span>
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: getScoreColor(session.totalScore || 0),
                    fontWeight: '600'
                  }}>
                    Score: {session.totalScore || 0}/10
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#ccc', marginTop: '0.25rem' }}>
                    Weakest Topic: {metrics.weakestTopic}, Filler: {metrics.mostCommonFiller}
                    {metrics.interviewMode === 'voice' && `, Conf: ${metrics.confidence}%`}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Session Details */}
          <div>
            {selectedSession ? (
              <div style={{
                background: 'rgba(26, 31, 46, 0.8)',
                border: '2px solid rgba(0, 150, 255, 0.2)',
                borderRadius: '12px',
                padding: '2rem',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem',
                  paddingBottom: '1.5rem',
                  borderBottom: '2px solid rgba(0, 150, 255, 0.2)'
                }}>
                  <h2 style={{ margin: 0, color: '#00d4ff' }}>{selectedSession.role}</h2>
                  <button 
                    onClick={() => handleDelete(selectedSession._id)}
                    style={{
                      background: 'rgba(255, 51, 51, 0.2)',
                      border: '2px solid #ff3333',
                      color: '#ff6666',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: '600'
                    }}
                  >
                    <FaTrash size={14} />
                    Delete
                  </button>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ color: '#00d4ff', marginTop: 0 }}>Session Details</h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem'
                  }}>
                    <div>
                      <p style={{ color: '#888', margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>Total Score</p>
                      <p style={{ color: getScoreColor(selectedSession.totalScore || 0), margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {selectedSession.totalScore || 0}/10
                      </p>
                    </div>
                    <div>
                      <p style={{ color: '#888', margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>Questions Answered</p>
                      <p style={{ color: '#00d4ff', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {selectedSession.answers?.length || 0}
                      </p>
                    </div>
                    <div>
                      <p style={{ color: '#888', margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>Date</p>
                      <p style={{ color: '#ccc', margin: 0 }}>
                        {formatDate(selectedSession.completedAt || selectedSession.updatedAt)}
                      </p>
                    </div>
                    <div>
                      <p style={{ color: '#888', margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>Status</p>
                      <p style={{ color: '#00cc66', margin: 0, fontWeight: '600' }}>
                        {selectedSession.status === 'completed' ? 'Completed' : 'In Progress'}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedSession.answers && selectedSession.answers.length > 0 && (
                  <div>
                    <h3 style={{ color: '#00d4ff', marginTop: 0 }}>Answers Breakdown</h3>
                    <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                      {selectedSession.answers.map((answer, idx) => {
                        const isExpanded = expandedQuestions.includes(idx);
                        return (
                          <div key={idx} style={{
                            background: 'rgba(0, 0, 0, 0.28)',
                            padding: '1rem',
                            marginBottom: '0.75rem',
                            borderRadius: '8px',
                            borderLeft: `3px solid ${getScoreColor(answer.aiScore)}`
                          }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '0.65rem',
                              cursor: 'pointer'
                            }}
                            onClick={() => toggleQuestionExpand(idx)}
                            >
                              <p style={{ margin: 0, color: '#ccc', fontWeight: '600' }}>
                                Q{idx + 1}: {answer.question.substring(0, 60)}...
                                {answer.answerType === 'voice' && (
                                  <FaMicrophone 
                                    size={12} 
                                    style={{ 
                                      marginLeft: '0.5rem', 
                                      color: '#00cc66',
                                      verticalAlign: 'middle'
                                    }} 
                                    title="Voice Answer"
                                  />
                                )}
                              </p>
                              <span style={{
                                background: getScoreColor(answer.aiScore),
                                color: 'white',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '4px',
                                fontSize: '0.85rem',
                                fontWeight: '600'
                              }}>
                                {answer.aiScore || 0}/10
                              </span>
                            </div>

                            {isExpanded && (
                              <div style={{ color: '#ccc', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <p><strong>Question:</strong> {answer.question}</p>
                                <p><strong>Your Answer:</strong> {answer.userAnswer}</p>
                                <p><strong>AI Feedback:</strong> {answer.aiFeedback || 'N/A'}</p>
                                <p><strong>Suggested Answer:</strong> {answer.suggestedAnswer || 'N/A'}</p>
                                {answer.speakingAnalysis ? (
                                  <div style={{ marginTop: '0.5rem' }}>
                                    <p><strong>Speaking Analysis</strong></p>
                                    <ul style={{ color: '#ccc', paddingLeft: '1.2rem' }}>
                                      <li>Confidence: {answer.speakingAnalysis.confidenceScore || 0}%</li>
                                      <li>Filler Words: {answer.speakingAnalysis.fillerWords || 0}</li>
                                      <li>Pace: {answer.speakingAnalysis.wordsPerMinute || 0} WPM</li>
                                      <li>Longest Pause: {answer.speakingAnalysis.longestPause || 0}s</li>
                                    </ul>
                                  </div>
                                ) : (
                                  <p style={{ color: '#888' }}>No speaking analysis available.</p>
                                )}
                                <button
                                  onClick={() => window.alert('Retry feature coming soon!')}
                                  style={{
                                    marginTop: '0.75rem',
                                    background: '#00d4ff',
                                    border: 'none',
                                    color: 'white',
                                    padding: '0.5rem 0.8rem',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Retry This Question
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                background: 'rgba(26, 31, 46, 0.8)',
                border: '2px solid rgba(0, 150, 255, 0.2)',
                borderRadius: '12px',
                padding: '2rem',
                textAlign: 'center',
                backdropFilter: 'blur(10px)',
                minHeight: '300px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div>
                  <FaEye size={50} style={{ color: '#00d4ff', marginBottom: '1rem', opacity: 0.65 }} />
                  <h3 style={{ color: '#fff', margin: '0 0 0.5rem 0' }}>Choose a past interview</h3>
                  <p style={{ color: '#888', margin: 0, maxWidth: '400px' }}>
                    Choose a past interview to review your strengths, weak areas, and speaking performance.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PastSessions;
