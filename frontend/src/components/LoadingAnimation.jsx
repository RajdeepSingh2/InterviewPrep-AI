import React from 'react';
import './LoadingAnimation.css';

const LoadingAnimation = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner-ball"></div>
        <div className="spinner-ball"></div>
        <div className="spinner-ball"></div>
      </div>
      <p className="loading-message">{message}</p>
      <div className="loading-bar">
        <div className="loading-bar-fill"></div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
