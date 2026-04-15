import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../services/api';
import { generateUserId } from '../utils/helpers';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import LoadingAnimation from '../components/LoadingAnimation';
import './Pages.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement);

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const userId = generateUserId();
        const response = await analyticsAPI.getUserAnalytics(userId);
        
        console.log('Analytics response:', response.data);
        
        if (response.data.success) {
          console.log('Analytics data:', response.data.analytics);
          setAnalytics(response.data.analytics);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="page"><LoadingAnimation message="Loading your analytics..." /></div>;
  }

  if (error || !analytics) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>{error || 'No data available'}</h2>
          <p style={{ color: '#888' }}>Complete an interview to see your analytics</p>
        </div>
      </div>
    );
  }

  // DEBUG LOGS
  console.log("=== DASHBOARD ANALYTICS DEBUG ===");
  console.log("strongestTopic:", analytics.strongestTopic, "type:", typeof analytics.strongestTopic);
  console.log("weakestTopic:", analytics.weakestTopic, "type:", typeof analytics.weakestTopic);
  console.log("mostImprovedTopic:", analytics.mostImprovedTopic, "type:", typeof analytics.mostImprovedTopic);
  console.log("practiceRecommendations:", analytics.practiceRecommendations, "type:", typeof analytics.practiceRecommendations);
  console.log("topicWisePerformance:", analytics.topicWisePerformance, "type:", typeof analytics.topicWisePerformance);
  console.log("recentSessions[0]:", analytics.recentSessions[0]);
  if (analytics.practiceRecommendations && analytics.practiceRecommendations.length > 0) {
    console.log("practiceRecommendations[0]:", analytics.practiceRecommendations[0], "type:", typeof analytics.practiceRecommendations[0]);
  }
  console.log("=== END DEBUG ===");

  // Prepare chart data
  const topicLabels = Object.keys(analytics.topicWisePerformance || {}).map(label => 
    typeof label === 'string' ? label : String(label)
  );
  const topicValues = Object.values(analytics.topicWisePerformance || {}).map(score => {
    if (typeof score === 'object' && score !== null) {
      return Number(score.value ?? score.score ?? 0);
    }
    return Number(score || 0);
  });

  const barColors = topicValues.map(score => {
    const numScore = typeof score === 'number' ? score : (score?.value || score?.score || 0);
    if (numScore >= 8) return 'rgba(16, 185, 129, 0.7)';
    if (numScore >= 6) return 'rgba(234, 179, 8, 0.8)';
    return 'rgba(239, 68, 68, 0.7)';
  });

  const barData = {
    labels: topicLabels.map(label => 
      typeof label === 'string' ? label : (typeof label === 'object' ? (label?.name || label?.topic || 'Unknown') : String(label))
    ),
    datasets: [{
      label: 'Topic-wise Performance',
      data: topicValues,
      backgroundColor: barColors,
      borderColor: barColors.map(c => c.replace('0.7', '1')), // slightly stronger
      borderWidth: 1
    }]
  };



  const lineData = {
    labels: analytics.recentSessions.map((_, i) => `Session ${i + 1}`),
    datasets: [{
      label: 'Scores Over Time',
      data: analytics.recentSessions.map(s => s.totalScore),
      borderColor: '#00d4ff',
      backgroundColor: 'rgba(0, 212, 255, 0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#0066ff',
      pointBorderColor: '#00d4ff',
      pointBorderWidth: 2,
      pointRadius: 5
    }]
  };

  return (
    <div className="page" style={{ padding: '2rem' }}>
      <div className="container">
        <h1 style={{ textAlign: 'center', marginBottom: '3rem' }}>Your Interview Analytics 📊</h1>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.2rem',
          marginBottom: '2.5rem'
        }}>
          <StatCard 
            icon="🎯"
            color="#10b981"
            title="Total Interviews"
            value={analytics.totalInterviews || 0}
            subtitle="completed sessions"
          />
          <StatCard 
            icon="⭐"
            color="#facc15"
            title="Average Score"
            value={`${analytics.averageScore}/10`}
            subtitle="overall performance"
          />
          <StatCard 
            icon="📈"
            color="#10b981"
            title="Strongest Topic"
            value={
              typeof analytics.strongestTopic === 'string' 
                ? analytics.strongestTopic 
                : (analytics.strongestTopic?.name || analytics.strongestTopic?.topic || 'N/A')
            }
            subtitle={`${Number(analytics.strongestTopic?.score || analytics.strongestTopic?.value || 0)}/10`}
          />
          <StatCard 
            icon="📉"
            color="#ef4444"
            title="Weakest Topic"
            value={
              typeof analytics.weakestTopic === 'string' 
                ? analytics.weakestTopic 
                : (analytics.weakestTopic?.name || analytics.weakestTopic?.topic || 'N/A')
            }
            subtitle={`${Number(analytics.weakestTopic?.score || analytics.weakestTopic?.value || 0)}/10`}
          />
          <StatCard 
            icon="🚀"
            color="#8b5cf6"
            title="Most Improved Topic"
            value={
              typeof analytics.mostImprovedTopic === 'string' 
                ? analytics.mostImprovedTopic 
                : (analytics.mostImprovedTopic?.name || analytics.mostImprovedTopic?.topic || 'N/A')
            }
            subtitle={analytics.mostImprovedTopic?.improvement ? `+${Number(analytics.mostImprovedTopic.improvement)}` : 'No improvement'}
          />
        </div>

        {/* Charts */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          {/* Bar Chart */}
          <div style={{
            background: 'rgba(26, 31, 46, 0.8)',
            border: '2px solid rgba(0, 150, 255, 0.2)',
            borderRadius: '16px',
            padding: '2rem',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ color: '#00d4ff', marginTop: 0 }}>Topic-wise Performance</h3>
            <Bar data={barData} options={{
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 10,
                  ticks: { color: '#ccc' },
                  grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                  ticks: { color: '#ccc' },
                  grid: { color: 'rgba(255, 255, 255, 0.05)' }
                }
              },
              plugins: {
                legend: { display: false },
                tooltip: { enabled: true }
              }
            }} />
          </div>

          {/* Progress Over Time */}
          {analytics.recentSessions.length > 0 && (
            <div style={{
              background: 'rgba(26, 31, 46, 0.8)',
              border: '2px solid rgba(0, 150, 255, 0.2)',
              borderRadius: '16px',
              padding: '2rem',
              backdropFilter: 'blur(10px)'
            }}>
              <h3 style={{ color: '#00d4ff', marginTop: 0 }}>Progress Over Time</h3>
              <Line data={lineData} options={{
                responsive: true,
                plugins: {
                  legend: {
                    labels: {
                      color: '#ccc'
                    }
                  }
                },
                scales: {
                  y: {
                    ticks: { color: '#ccc' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                  },
                  x: {
                    ticks: { color: '#ccc' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                  }
                }
              }} />
            </div>
          )}

          {/* Practice Recommendations */}
          <div style={{
            background: 'rgba(26, 31, 46, 0.9)',
            border: '2px solid rgba(165, 180, 252, 0.4)',
            borderRadius: '16px',
            padding: '2rem',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ color: '#8b5cf6', marginTop: 0 }}>What Should I Practice Next?</h3>
            <ul style={{ color: '#ccc', paddingLeft: '1.2rem' }}>
              {(analytics.practiceRecommendations || []).length > 0 ? (
                analytics.practiceRecommendations.map((rec, idx) => {
                  let displayText = 'Unknown recommendation';
                  if (typeof rec === 'string') {
                    displayText = rec;
                  } else if (typeof rec === 'object' && rec !== null) {
                    if (rec.text && rec.topic) {
                      displayText = `${rec.topic}: ${rec.text}`;
                    } else if (rec.text) {
                      displayText = rec.text;
                    } else if (rec.topic) {
                      displayText = rec.topic;
                    } else if (rec.description) {
                      displayText = rec.description;
                    } else {
                      displayText = JSON.stringify(rec);
                    }
                  }
                  return (
                    <li key={idx} style={{ marginBottom: '0.5rem' }}>
                      {displayText}
                    </li>
                  );
                })
              ) : (
                <li>No recommendations yet. Finish more interviews to get personalized guidance.</li>
              )}
            </ul>
          </div>

          {/* Speaking Confidence Trend */}
          {analytics.recentSessions.some(s => s.speakingMetrics?.averageConfidenceScore > 0) && (
            <div style={{
              background: 'rgba(26, 31, 46, 0.8)',
              border: '2px solid rgba(108, 99, 255, 0.3)',
              borderRadius: '16px',
              padding: '2rem',
              backdropFilter: 'blur(10px)'
            }}>
              <h3 style={{ color: '#6c63ff', marginTop: 0 }}>🎤 Speaking Confidence Trend</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.8rem', marginBottom: '1rem' }}>
                <div style={{ background: '#071b2d', borderRadius: '10px', padding: '0.7rem' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>Avg Confidence</p>
                  <strong style={{ color: '#10b981', fontSize: '1.1rem' }}>{analytics.speakingTrend?.averageConfidenceScore || 0}%</strong>
                </div>
                <div style={{ background: '#071b2d', borderRadius: '10px', padding: '0.7rem' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>Avg Filler Words</p>
                  <strong style={{ color: '#f59e0b', fontSize: '1.1rem' }}>{analytics.speakingTrend?.averageFillerWords || 0}</strong>
                </div>
                <div style={{ background: '#071b2d', borderRadius: '10px', padding: '0.7rem' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>Avg Speed</p>
                  <strong style={{ color: '#8b5cf6', fontSize: '1.1rem' }}>{analytics.speakingTrend?.averageWPM || 0} WPM</strong>
                </div>
                <div style={{ background: '#071b2d', borderRadius: '10px', padding: '0.7rem' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>Session Improvement</p>
                  <strong style={{ color: '#22c55e', fontSize: '1.1rem' }}>{analytics.speakingTrend?.improvementPercent || 0}%</strong>
                </div>
              </div>
              <Line 
                data={{
                  labels: analytics.recentSessions.map((_, i) => `Session ${i + 1}`),
                  datasets: [{
                    label: 'Confidence Score',
                    data: analytics.recentSessions.map(s => s.speakingMetrics?.averageConfidenceScore || 0),
                    borderColor: '#6c63ff',
                    backgroundColor: 'rgba(108, 99, 255, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#6c63ff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                  }, {
                    label: 'Average WPM',
                    data: analytics.recentSessions.map(s => s.speakingMetrics?.averageWPM || 0),
                    borderColor: '#facc15',
                    backgroundColor: 'rgba(250, 204, 21, 0.1)',
                    tension: 0.4,
                    fill: false,
                    pointRadius: 4
                  }, {
                    label: 'Longest Pause (s)',
                    data: analytics.recentSessions.map(s => s.speakingMetrics?.longestPause || 0),
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: false,
                    pointRadius: 4
                  }]
                }} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      labels: { color: '#ccc' }
                    }
                  },
                  scales: {
                    y: {
                      min: 0,
                      max: 100,
                      ticks: { color: '#ccc' },
                      grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                      ticks: { color: '#ccc' },
                      grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                  }
                }} 
              />
            </div>
          )}
        </div>

        {/* Recent Sessions */}
        {analytics.recentSessions.length > 0 && (
          <div style={{
            background: 'rgba(26, 31, 46, 0.8)',
            border: '2px solid rgba(0, 150, 255, 0.2)',
            borderRadius: '16px',
            padding: '2rem',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ color: '#00d4ff', marginTop: 0, marginBottom: '1.5rem' }}>Recent Sessions</h3>
            <div style={{
              overflowX: 'auto'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                color: '#ccc'
              }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(0, 150, 255, 0.2)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#00d4ff' }}>Role</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#00d4ff' }}>Mode</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#00d4ff' }}>Difficulty</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#00d4ff' }}>Score</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#00d4ff' }}>Confidence</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#00d4ff' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentSessions.map((session, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(0, 150, 255, 0.1)' }}>
                      <td style={{ padding: '1rem' }}>{typeof session.role === 'string' ? session.role : 'Unknown'}</td>
                      <td style={{ padding: '1rem' }}>{(typeof session.interviewMode === 'string' ? session.interviewMode : 'text').toUpperCase() || 'TEXT'}</td>
                      <td style={{ padding: '1rem' }}>{typeof session.difficulty === 'string' ? session.difficulty : 'Medium'}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          background: getScoreBg(session.totalScore),
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontWeight: '600'
                        }}>
                          {session.totalScore}/10
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>{session.speakingMetrics?.averageConfidenceScore ? `${session.speakingMetrics.averageConfidenceScore}%` : 'N/A'}</td>
                      <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#888' }}>
                        {new Date(session.completedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, subtitle, color = '#00d4ff' }) => {
  const safeValue = typeof value === 'string' || typeof value === 'number' 
    ? value 
    : (value?.name || value?.topic || value?.text || 'N/A');
  
  const safeSubtitle = typeof subtitle === 'string' || typeof subtitle === 'number' 
    ? subtitle 
    : (subtitle?.name || subtitle?.text || JSON.stringify(subtitle) || 'N/A');
  
  return (
    <div style={{
      background: 'rgba(26, 31, 46, 0.8)',
      border: `2px solid ${color}`,
      borderRadius: '12px',
      padding: '1.5rem',
      textAlign: 'center',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = color;
      e.currentTarget.style.transform = 'translateY(-5px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = `rgba(0, 150, 255, 0.2)`;
      e.currentTarget.style.transform = 'translateY(0)';
    }}
    >
      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{icon}</div>
      <p style={{ color: '#888', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>{title}</p>
      <h3 style={{ color: '#00d4ff', margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{safeValue}</h3>
      <p style={{ color: '#666', margin: '0.5rem 0 0 0', fontSize: '0.85rem' }}>{safeSubtitle}</p>
    </div>
  );
};

const getScoreBg = (score) => {
  if (score >= 8) return 'rgba(0, 204, 102, 0.2)';
  if (score >= 6) return 'rgba(255, 170, 0, 0.2)';
  if (score >= 4) return 'rgba(255, 107, 0, 0.2)';
  return 'rgba(255, 51, 51, 0.2)';
};

export default Dashboard;
