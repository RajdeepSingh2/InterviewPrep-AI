import React from 'react';
import { FaCopy, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { copyToClipboard, getScoreColor, getScoreFeedback } from '../utils/helpers';
import './ChatCard.css';

const ChatCard = ({ 
  type = 'question', 
  content, 
  score, 
  feedback, 
  strengths, 
  weaknesses,
  suggestedAnswer,
  isLoading = false 
}) => {
  const handleCopy = () => {
    copyToClipboard(content);
  };

  return (
    <div className={`chat-card chat-card-${type} ${isLoading ? 'loading' : ''}`}>
      <div className="card-header">
        <span className="card-type">{type.toUpperCase()}</span>
        {score !== undefined && (
          <div className="score-badge" style={{ backgroundColor: getScoreColor(score), color: 'white', fontWeight: '600' }}>
            {score}/10 - {getScoreFeedback(score)}
          </div>
        )}
      </div>

      <div className="card-content">
        {isLoading ? (
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        ) : (
          <>
            <p className="content-text">{content}</p>
            
            {feedback && (
              <div className="feedback-section">
                <h4>Feedback</h4>
                <p>{feedback}</p>
              </div>
            )}

            {strengths && strengths.length > 0 && (
              <div className="strengths-section">
                <h4><FaCheckCircle size={14} /> Strengths</h4>
                <ul>
                  {strengths.map((strength, idx) => (
                    <li key={idx}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {weaknesses && weaknesses.length > 0 && (
              <div className="weaknesses-section">
                <h4><FaTimesCircle size={14} /> Areas to Improve</h4>
                <ul>
                  {weaknesses.map((weakness, idx) => (
                    <li key={idx}>{weakness}</li>
                  ))}
                </ul>
              </div>
            )}

            {suggestedAnswer && (
              <div className="suggested-answer">
                <h4>Suggested Answer</h4>
                <p>{suggestedAnswer}</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="card-footer">
        <button 
          className="copy-btn"
          onClick={handleCopy}
          title="Copy to clipboard"
        >
          <FaCopy size={14} />
          <span>Copy</span>
        </button>
      </div>
    </div>
  );
};

export default ChatCard;
