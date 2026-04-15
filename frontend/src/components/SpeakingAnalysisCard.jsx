import React from 'react';
import { FaMicrophone, FaPause, FaChartLine, FaCheckCircle } from 'react-icons/fa';
import './SpeakingAnalysisCard.css';

const SpeakingAnalysisCard = ({ analysis }) => {
  if (!analysis) return null;

  const getColorClass = (value, thresholds) => {
    if (value >= thresholds.green) return 'green';
    if (value >= thresholds.orange) return 'orange';
    return 'red';
  };

  const wpmColor = getColorClass(analysis.wordsPerMinute, {
    green: 130,
    orange: 100
  });

  const fillerColor = getColorClass(
    100 - (analysis.fillerWords * 5), // Inverted: fewer is better
    { green: 85, orange: 70 }
  );

  const pauseColor = getColorClass(
    100 - (analysis.longestPause * 2), // Inverted: shorter is better
    { green: 80, orange: 60 }
  );

  const confidenceColor = getColorClass(analysis.confidenceScore, {
    green: 75,
    orange: 60
  });

  return (
    <div className="speaking-analysis-card">
      <h3 className="analysis-title">
        <FaMicrophone className="title-icon" /> Speaking Analysis
      </h3>

      {/* Confidence Score - Prominent Display */}
      <div className="confidence-section">
        <div className={`confidence-score ${confidenceColor}`}>
          <span className="score-value">{analysis.confidenceScore}</span>
          <span className="score-label">Confidence</span>
        </div>
        <div className="confidence-description">
          {analysis.confidenceScore >= 75 && '🟢 Excellent confidence'}
          {analysis.confidenceScore >= 60 && analysis.confidenceScore < 75 && '🟡 Good confidence'}
          {analysis.confidenceScore < 60 && '🔴 Needs improvement'}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        {/* Words Per Minute */}
        <div className="metric-card">
          <div className="metric-header">
            <FaChartLine className="metric-icon" />
            <span className="metric-label">Speaking Speed</span>
          </div>
          <div className={`metric-value ${wpmColor}`}>
            {analysis.wordsPerMinute} <span className="metric-unit">WPM</span>
          </div>
          <div className="metric-status">
            {analysis.wordsPerMinute >= 130 && analysis.wordsPerMinute <= 160
              ? '✅ Ideal pace'
              : analysis.wordsPerMinute < 130
              ? '🟡 Too slow'
              : '🟡 Too fast'}
          </div>
        </div>

        {/* Filler Words */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">💬</span>
            <span className="metric-label">Filler Words</span>
          </div>
          <div className={`metric-value ${fillerColor}`}>
            {analysis.fillerWords} <span className="metric-unit">times</span>
          </div>
          <div className="metric-status">
            {analysis.fillerWords === 0
              ? '✅ Excellent'
              : analysis.fillerWords <= 3
              ? '🟡 Acceptable'
              : '🔴 Too many'}
          </div>
        </div>

        {/* Longest Pause */}
        <div className="metric-card">
          <div className="metric-header">
            <FaPause className="metric-icon" />
            <span className="metric-label">Longest Pause</span>
          </div>
          <div className={`metric-value ${pauseColor}`}>
            {analysis.longestPause} <span className="metric-unit">sec</span>
          </div>
          <div className="metric-status">
            {analysis.longestPause <= 3
              ? '✅ Natural pauses'
              : analysis.longestPause <= 5
              ? '🟡 Long pause'
              : '🔴 Very long'}
          </div>
        </div>

        {/* Total Words */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">📝</span>
            <span className="metric-label">Total Words</span>
          </div>
          <div className="metric-value">
            {analysis.totalWords} <span className="metric-unit">words</span>
          </div>
          <div className="metric-status">
            {analysis.totalWords >= 80 ? '✅ Good length' : '🟡 Brief'}
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div className="suggestions-section">
        <h4 className="suggestions-title">
          <FaCheckCircle className="suggestions-icon" /> Suggestions for Improvement
        </h4>
        <ul className="suggestions-list">
          {analysis.suggestions.map((suggestion, idx) => (
            <li key={idx} className="suggestion-item">
              {suggestion}
            </li>
          ))}
        </ul>
      </div>

      {/* Filler Words Breakdown (if any) */}
      {analysis.fillerWordsList && analysis.fillerWordsList.length > 0 && (
        <div className="filler-breakdown">
          <h4 className="breakdown-title">Filler Words Detected</h4>
          <div className="filler-list">
            {Array.from(
              new Map(
                analysis.fillerWordsList.map(item => [item.word, item])
              ).values()
            ).map((item, idx) => {
              const count = analysis.fillerWordsList.filter(
                f => f.word === item.word
              ).length;
              return (
                <div key={idx} className="filler-item">
                  <span className="filler-word">"{item.word}"</span>
                  <span className="filler-count">×{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeakingAnalysisCard;
