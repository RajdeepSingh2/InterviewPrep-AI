import React, { useState, useEffect } from 'react';
import { ROLES } from '../utils/constants';
import './Pages.css';

const Settings = () => {
  const [preferredRole, setPreferredRole] = useState('Software Developer');
  const [resume, setResume] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load saved settings
    const savedRole = localStorage.getItem('preferredRole');
    const savedResume = localStorage.getItem('savedResume');
    const savedDarkMode = localStorage.getItem('darkMode');
    const savedNotifications = localStorage.getItem('notifications');

    if (savedRole) setPreferredRole(savedRole);
    if (savedResume) setResume(savedResume);
    if (savedDarkMode !== null) setDarkMode(JSON.parse(savedDarkMode));
    if (savedNotifications !== null) setNotifications(JSON.parse(savedNotifications));
  }, []);

  const handleSave = () => {
    localStorage.setItem('preferredRole', preferredRole);
    localStorage.setItem('savedResume', resume);
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="page" style={{ padding: '2rem' }}>
      <div className="container">
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Settings ⚙️</h1>

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {saved && (
            <div style={{
              background: 'rgba(0, 204, 102, 0.1)',
              border: '2px solid #00cc66',
              color: '#00cc66',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              textAlign: 'center',
              fontWeight: '600'
            }}>
              ✓ Settings saved successfully!
            </div>
          )}

          {/* Preferences Section */}
          <div style={{
            background: 'rgba(26, 31, 46, 0.8)',
            border: '2px solid rgba(0, 150, 255, 0.2)',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem',
            backdropFilter: 'blur(10px)'
          }}>
            <h2 style={{ color: '#00d4ff', marginTop: 0 }}>Preferences</h2>
            
            <div className="form-group">
              <label htmlFor="role">Preferred Job Role</label>
              <select
                id="role"
                value={preferredRole}
                onChange={(e) => setPreferredRole(e.target.value)}
              >
                {ROLES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="resume">Save Resume</label>
              <textarea
                id="resume"
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                placeholder="Save your resume here for quick access"
                style={{ minHeight: '200px' }}
              />
              <p style={{ color: '#888', fontSize: '0.85rem', margin: '0.5rem 0 0 0' }}>
                Your resume will be saved locally for faster question generation
              </p>
            </div>
          </div>

          {/* Display Settings */}
          <div style={{
            background: 'rgba(26, 31, 46, 0.8)',
            border: '2px solid rgba(0, 150, 255, 0.2)',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem',
            backdropFilter: 'blur(10px)'
          }}>
            <h2 style={{ color: '#00d4ff', marginTop: 0 }}>Display</h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px'
              }}>
                <div>
                  <p style={{ margin: 0, color: '#ccc', fontWeight: '600' }}>Dark Mode</p>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#888', fontSize: '0.9rem' }}>
                    Use dark theme for eye comfort
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  style={{ width: '40px', height: '24px', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div style={{
            background: 'rgba(26, 31, 46, 0.8)',
            border: '2px solid rgba(0, 150, 255, 0.2)',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem',
            backdropFilter: 'blur(10px)'
          }}>
            <h2 style={{ color: '#00d4ff', marginTop: 0 }}>Notifications</h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px'
              }}>
                <div>
                  <p style={{ margin: 0, color: '#ccc', fontWeight: '600' }}>Enable Notifications</p>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#888', fontSize: '0.9rem' }}>
                    Get notified about your progress and achievements
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  style={{ width: '40px', height: '24px', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>

          {/* About Section */}
          <div style={{
            background: 'rgba(26, 31, 46, 0.8)',
            border: '2px solid rgba(0, 150, 255, 0.2)',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem',
            backdropFilter: 'blur(10px)'
          }}>
            <h2 style={{ color: '#00d4ff', marginTop: 0 }}>About</h2>
            
            <div style={{ color: '#888', lineHeight: '1.8' }}>
              <p>
                <strong style={{ color: '#d4d4d4' }}>InterviewPrep AI</strong> is an AI-powered interview preparation platform built to help you ace your interviews.
              </p>
              <p>
                <strong style={{ color: '#d4d4d4' }}>Version:</strong> 1.0.0
              </p>
              <p>
                <strong style={{ color: '#d4d4d4' }}>Features:</strong> AI Question Generation, Real-time Evaluation, Progress Analytics, Voice Interview Mode
              </p>
              <p>
                <strong style={{ color: '#d4d4d4' }}>Tech Stack:</strong> React, Node.js, MongoDB, OpenRouter API
              </p>
              <p style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(0, 150, 255, 0.2)' }}>
                © 2024 InterviewPrep AI. Built with ❤️ for interview enthusiasts.
              </p>
            </div>
          </div>

          {/* FAQ Section */}
          <div style={{
            background: 'rgba(26, 31, 46, 0.8)',
            border: '2px solid rgba(0, 150, 255, 0.2)',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem',
            backdropFilter: 'blur(10px)'
          }}>
            <h2 style={{ color: '#00d4ff', marginTop: 0 }}>FAQ</h2>
            
            <div>
              <Question 
                title="How does AI generate personalized questions?"
                answer="Our AI analyzes your resume to identify your skills, projects, and experience, then generates questions tailored to your job role and background."
              />
              <Question 
                title="How are my answers evaluated?"
                answer="Our AI evaluates answers based on technical correctness, completeness, clarity, and relevance to the question. You receive scores from 0-10 with detailed feedback."
              />
              <Question 
                title="Can I download my interview reports?"
                answer="Yes! You can view detailed analytics in the Dashboard and download session reports from Past Sessions."
              />
              <Question 
                title="Is my data secure?"
                answer="Your sessions are stored locally and on our secure MongoDB servers. We don't share your personal information with third parties."
              />
            </div>
          </div>

          {/* Save Button */}
          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={handleSave}
              className="btn btn-primary btn-large"
              style={{ minWidth: '200px' }}
            >
              Save Settings 💾
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Question = ({ title, answer }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div 
      style={{
        borderBottom: '1px solid rgba(0, 150, 255, 0.1)',
        paddingBottom: '1rem',
        marginBottom: '1rem'
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div 
        style={{
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#00d4ff',
          fontWeight: '600'
        }}
      >
        <span>{title}</span>
        <span>{expanded ? '▼' : '▶'}</span>
      </div>
      {expanded && (
        <p style={{
          margin: '1rem 0 0 0',
          color: '#aaa',
          lineHeight: '1.6'
        }}>
          {answer}
        </p>
      )}
    </div>
  );
};

export default Settings;
