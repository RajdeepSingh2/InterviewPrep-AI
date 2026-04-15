import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Pages.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="page home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Master Your <span className="gradient-text">Interview Skills</span> with AI
            </h1>
            <p className="hero-subtitle">
              Get personalized interview questions based on your resume, receive AI-powered feedback, and track your progress with detailed analytics.
            </p>
            <div className="hero-buttons">
              <button 
                className="btn btn-primary btn-large"
                onClick={() => navigate('/generate')}
              >
                Start Preparing Now 🚀
              </button>
              <button 
                className="btn btn-secondary btn-large"
                onClick={() => navigate('/dashboard')}
              >
                View Your Progress
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card">
              <div className="card-shine"></div>
              <p>✨ AI-Powered Feedback</p>
            </div>
            <div className="floating-card delay-1">
              <div className="card-shine"></div>
              <p>📊 Detailed Analytics</p>
            </div>
            <div className="floating-card delay-2">
              <div className="card-shine"></div>
              <p>🎯 Personalized Questions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Why InterviewPrep AI?</h2>
        <div className="features-grid">
          {[
            {
              icon: '🧠',
              title: 'Personalized Questions',
              description: 'AI generates questions specific to your role, skills, and projects from your resume.'
            },
            {
              icon: '⚡',
              title: 'Instant Feedback',
              description: 'Get scores, strengths, weaknesses, and suggested answers for every response.'
            },
            {
              icon: '📈',
              title: 'Progress Tracking',
              description: 'Monitor your improvement over time with comprehensive analytics and reports.'
            },
            {
              icon: '🎙️',
              title: 'Voice Interview',
              description: 'Practice speaking naturally with voice-based interview mode.'
            },
            {
              icon: '🔄',
              title: 'Adaptive Difficulty',
              description: 'Questions adjust based on your performance for optimal learning.'
            },
            {
              icon: '💾',
              title: 'Save Sessions',
              description: 'Review past interviews, track statistics, and download reports.'
            }
          ].map((feature, idx) => (
            <div key={idx} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          {[
            {
              number: '1',
              title: 'Upload Your Resume',
              description: 'Paste your resume text to get started'
            },
            {
              number: '2',
              title: 'Select Your Role',
              description: 'Choose the position you\'re interviewing for'
            },
            {
              number: '3',
              title: 'Practice Questions',
              description: 'Answer AI-generated personalized questions'
            },
            {
              number: '4',
              title: 'Get Feedback',
              description: 'Receive detailed analysis and improvement suggestions'
            },
            {
              number: '5',
              title: 'Track Progress',
              description: 'Monitor your improvement with analytics'
            }
          ].map((step, idx) => (
            <div key={idx} className="step">
              <div className="step-number">{step.number}</div>
              <h4>{step.title}</h4>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-card">
          <h2>Ready to Ace Your Interview?</h2>
          <p>Join thousands of job seekers who have improved their interview skills with InterviewPrep AI</p>
          <button 
            className="btn btn-primary btn-large"
            onClick={() => navigate('/generate')}
          >
            Start Your Journey 🎯
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
