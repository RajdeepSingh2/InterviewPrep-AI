import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewAPI } from '../services/api';
import { ROLES } from '../utils/constants';
import { generateUserId } from '../utils/helpers';
import LoadingAnimation from '../components/LoadingAnimation';
import { FaPlay } from 'react-icons/fa';
import './Pages.css';

const QuestionGenerator = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('Software Developer');
  const [resume, setResume] = useState('');
  const [loading, setLoading] = useState(false);
  const [generated,setGenerated] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError(null);

    if (!resume.trim()) {
      setError('Please paste your resume text');
      return;
    }

    try {
      setLoading(true);
      const userId = generateUserId();
      
      const response = await interviewAPI.generateQuestions({
        role,
        resume,
        userId
      });

      if (response.data.success) {
        setQuestions(response.data.questions);
        setSessionId(response.data.sessionId);
        setGenerated(true);
        setError(null);
      }
    } catch (err) {
      setError('Failed to generate questions. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startInterview = () => {
    if (sessionId) {
      localStorage.setItem('currentSessionId', sessionId);
      navigate('/interview', { 
        state: { 
          questions, 
          sessionId,
          role,
          resume 
        } 
      });
    }
  };

  return (
    <div className="page question-generator">
      <div className="container">
        <h1 style={{ textAlign: 'center', marginTop: '2rem', marginBottom: '0.5rem' }}>
          Generate Interview Questions
        </h1>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '2rem' }}>
          Paste your resume and select a role to get personalized questions
        </p>

        {!generated ? (
          <form className="generator-form" onSubmit={handleGenerate}>
            <div className="form-group">
              <label htmlFor="role">Select Job Role</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
              >
                {ROLES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="resume">Paste Your Resume</label>
              <textarea
                id="resume"
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                placeholder="Paste your full resume here. Include:\n- Your name and contact info\n- Technical skills\n- Work experience\n- Projects you've built\n- Technologies used\n- Certifications"
                disabled={loading}
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(255, 51, 51, 0.1)',
                border: '2px solid #ff3333',
                color: '#ff6666',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            <div className="form-action">
              <button 
                type="submit" 
                className="btn btn-primary btn-large"
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Questions 🎯'}
              </button>
            </div>
          </form>
        ) : null}

        {loading && (
          <LoadingAnimation message="Generating personalized interview questions..." />
        )}

        {generated && questions && !loading && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ color: '#00d4ff', marginBottom: '1rem' }}>
                ✓ Questions Generated Successfully!
              </h2>
              <p style={{ color: '#888' }}>
                Ready to practice? Start the mock interview now.
              </p>
            </div>

            <div className="generated-questions">
              {questions.technical && questions.technical.map((q, idx) => (
                <div key={`tech-${idx}`} className="question-box">
                  <div className="question-box-header">📘 Technical ({idx + 1})</div>
                  <div className="question-box-text">{q}</div>
                </div>
              ))}
              
              {questions.hr && questions.hr.map((q, idx) => (
                <div key={`hr-${idx}`} className="question-box">
                  <div className="question-box-header">💼 HR ({idx + 1})</div>
                  <div className="question-box-text">{q}</div>
                </div>
              ))}
              
              {questions.project && questions.project.map((q, idx) => (
                <div key={`proj-${idx}`} className="question-box">
                  <div className="question-box-header">🚀 Project ({idx + 1})</div>
                  <div className="question-box-text">{q}</div>
                </div>
              ))}
              
              {questions.followup && questions.followup.map((q, idx) => (
                <div key={`follow-${idx}`} className="question-box">
                  <div className="question-box-header">❓ Follow-up ({idx + 1})</div>
                  <div className="question-box-text">{q}</div>
                </div>
              ))}
            </div>

            <div className="form-action">
              <button 
                className="btn btn-primary btn-large"
                onClick={startInterview}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
              >
                <FaPlay size={16} />
                Start Mock Interview
              </button>
              <button 
                className="btn btn-secondary btn-large"
                onClick={() => setGenerated(false)}
                style={{ marginLeft: '1rem' }}
              >
                Generate New
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionGenerator;
