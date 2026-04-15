import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { interviewAPI } from '../services/api';
import ChatCard from '../components/ChatCard';
import LoadingAnimation from '../components/LoadingAnimation';
import VoiceRecorder from '../components/VoiceRecorder';
import SpeakingAnalysisCard from '../components/SpeakingAnalysisCard';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { FaArrowRight, FaCheckCircle, FaKeyboard, FaMicrophone } from 'react-icons/fa';
import './Pages.css';

const MockInterview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { questions, sessionId } = location.state || {};

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [allQuestions, setAllQuestions] = useState([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [scores, setScores] = useState([]);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const currentQuestionType = currentQuestion?.type || 'general';
  const [interviewMode, setInterviewMode] = useState('text'); // 'text' or 'voice'
  const [currentSpeakingAnalysis, setCurrentSpeakingAnalysis] = useState(null);
  const [isQuestionSpeaking, setIsQuestionSpeaking] = useState(false);

  // Use speech recognition hook for voice analysis
  const {
    transcript,
    isListening,
    error,
    startListening,
    stopListening,
    resetTranscript,
    speakingAnalysis,
    liveConfidenceScore
  } = useSpeechRecognition(isQuestionSpeaking);

  console.log('🎤 MockInterview - speakingAnalysis from hook:', speakingAnalysis);

  // Log when speakingAnalysis changes
  useEffect(() => {
    console.log('🔄 speakingAnalysis changed:', speakingAnalysis);
  }, [speakingAnalysis]);

  // Sync hook transcript to userAnswer when in voice mode
  useEffect(() => {
    if (interviewMode === 'voice' && transcript) {
      console.log('✅ Transcript from hook updated:', transcript.substring(0, 50) + '...');
      setUserAnswer(transcript);
    }
  }, [transcript, interviewMode]);

  useEffect(() => {
    if (questions) {
      const allQs = [
        ...(questions.technical || []).map(q => ({ text: q, topic: 'technical' })),
        ...(questions.hr || []).map(q => ({ text: q, topic: 'hr' })),
        ...(questions.project || []).map(q => ({ text: q, topic: 'project' })),
        ...(questions.followup || []).map(q => ({ text: q, topic: 'followup' }))
      ];
      setAllQuestions(allQs);
      setCurrentQuestion(allQs[0] || null);
    }
  }, [questions]);

  // Auto-speak question when it changes (only in voice mode)
  useEffect(() => {
    if (currentQuestion?.text && interviewMode === 'voice' && 'speechSynthesis' in window) {
      setIsQuestionSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(currentQuestion.text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      // Try to use a female voice if available
      const voices = speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => voice.name.includes('Female') || voice.name.includes('Zira') || voice.name.includes('Samantha'));
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      utterance.onend = () => {
        console.log('🎵 Question speech ended');
        setIsQuestionSpeaking(false);
      };

      utterance.onerror = () => {
        console.log('🎵 Question speech error');
        setIsQuestionSpeaking(false);
      };

      console.log('🎵 Speaking question:', (currentQuestion.text || '').substring(0, 50) + '...');
      speechSynthesis.speak(utterance);
    }
  }, [currentQuestion, interviewMode]);

  const handleEvaluate = async () => {
    if (!userAnswer.trim()) {
      alert('Please provide an answer');
      return;
    }

    // For voice mode, ensure recording is stopped and speakingAnalysis exists
    if (interviewMode === 'voice') {
      if (isListening) {
        alert('Please stop recording before evaluating your answer');
        return;
      }
      if (!speakingAnalysis) {
        console.log('❌ Voice mode but speakingAnalysis is null - waiting for calculation...');
        alert('Please wait for speaking analysis to be calculated');
        return;
      }
    }

    try {
      setEvaluating(true);

      const evaluatePayload = {
        sessionId,
        question: currentQuestion?.text || currentQuestion || '',
        userAnswer,
        answerNumber: currentQuestionIndex + 1,
        answerType: interviewMode,
        questionType: currentQuestionType || 'adaptive',
        speakingAnalysis: interviewMode === 'voice' ? speakingAnalysis : null
      };

      console.log("🎤 Current speakingAnalysis from hook:", speakingAnalysis);
      console.log("📤 Payload sent to evaluate-answer:", JSON.stringify(evaluatePayload, null, 2));
      console.log("🎯 interviewMode:", interviewMode, "answerType in payload:", evaluatePayload.answerType);

      const response = await interviewAPI.evaluateAnswer(evaluatePayload);

      console.log('=== FULL EVALUATE RESPONSE ===');
      console.log('Full response data:', response.data);
      console.log('Speaking analysis from response:', response.data.speakingAnalysis);
      console.log('Answer type from response:', response.data.answerType);
      console.log('Answer saved with type:', interviewMode);

      if (response.data.success) {
        const eval_score = response.data.evaluation.score;
        setEvaluation(response.data.evaluation);
        
        // Use speakingAnalysis from response, not local variable
        console.log('🔄 About to set currentSpeakingAnalysis from response...');
        if (interviewMode === 'voice' && response.data.speakingAnalysis) {
          console.log('✅ Setting SpeakingAnalysisCard with:', response.data.speakingAnalysis);
          setCurrentSpeakingAnalysis(response.data.speakingAnalysis);
        } else if (interviewMode === 'text') {
          console.log('📝 Text mode answer - no speaking analysis');
          setCurrentSpeakingAnalysis(null);
        } else {
          console.log('❌ Voice mode but no speakingAnalysis in response');
          setCurrentSpeakingAnalysis(null);
        }
        
        setScores([...scores, eval_score]);
      }
    } catch (err) {
      alert('Failed to evaluate answer');
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleNext = async () => {
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentQuestion(allQuestions[currentQuestionIndex + 1]);
      setUserAnswer('');
      setEvaluation(null);
    } else {
      // Complete interview
      await completeInterview();
    }
  };

  const completeInterview = async () => {
    try {
      if (!sessionId) {
        console.error('No sessionId available');
        alert('No active session found. Please start a new interview.');
        navigate('/generate');
        return;
      }
      
      if (scores.length === 0) {
        console.error('No scores recorded');
        alert('No answers evaluated yet. Please complete at least one question.');
        return;
      }
      
      if (scores.length !== allQuestions.length) {
        console.warn(`Scores length (${scores.length}) doesn't match questions length (${allQuestions.length})`);
        alert('Some answers may not have been evaluated. Please ensure all questions are answered.');
        return;
      }
      
      const totalScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      
      const payload = {
        sessionId,
        totalScore
      };
      
      console.log('=== COMPLETING INTERVIEW ===');
      console.log('Payload being sent:', JSON.stringify(payload, null, 2));
      
      const response = await interviewAPI.completeInterview(payload);

      console.log('=== COMPLETE INTERVIEW RESPONSE ===');
      console.log('Full response:', response);
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      console.log('Response headers:', response.headers);

      if (response.data && response.data.success) {
        console.log('✅ Interview completed successfully');
        setInterviewCompleted(true);
        
        // Auto-redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        console.error('❌ Backend returned success=false:', response.data);
        const errorMsg = response.data?.message || 'Unknown error';
        alert(`Failed to complete interview: ${errorMsg}`);
      }
    } catch (err) {
      console.error('=== ERROR COMPLETING INTERVIEW ===');
      console.error('Error object:', err);
      console.error('Error message:', err.message);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      console.error('Error headers:', err.response?.headers);
      console.error('Error stack:', err.stack);
      
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Unknown error';
      console.error('Final error message:', errorMessage);
      alert(`Error completing interview: ${errorMessage}`);
    }
  };

  if (!sessionId) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>No active interview session</h2>
          <button 
            className="btn btn-primary btn-large"
            onClick={() => navigate('/generate')}
            style={{ marginTop: '1rem' }}
          >
            Generate Questions First
          </button>
        </div>
      </div>
    );
  }

  if (interviewCompleted) {
    const totalScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{
          textAlign: 'center',
          background: 'rgba(26, 31, 46, 0.8)',
          border: '2px solid rgba(0, 150, 255, 0.3)',
          borderRadius: '16px',
          padding: '3rem',
          maxWidth: '600px',
          backdropFilter: 'blur(10px)'
        }}>
          <FaCheckCircle size={60} style={{ color: '#00cc66', marginBottom: '1rem' }} />
          <h2 style={{ color: '#00cc66', fontSize: '2rem', margin: '1rem 0' }}>Interview Completed! 🎉</h2>
          
          <div style={{
            background: 'rgba(0, 204, 102, 0.1)',
            border: '2px solid #00cc66',
            borderRadius: '12px',
            padding: '1rem',
            margin: '1rem 0',
            color: '#00cc66',
            fontWeight: 'bold'
          }}>
            ✅ Interview completed successfully
          </div>
          
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '12px',
            padding: '2rem',
            margin: '2rem 0'
          }}>
            <h3 style={{ color: '#00d4ff', marginTop: 0 }}>Your Score</h3>
            <div style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: '#00cc66',
              margin: '1rem 0'
            }}>
              {totalScore}/10
            </div>
            <p>Total Questions: {allQuestions.length}</p>
            <p>Average Score: {totalScore}/10</p>
          </div>

          <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Redirecting to Dashboard in 3 seconds...
          </div>

          <div style={{ marginTop: '2rem' }}>
            <button 
              className="btn btn-primary btn-large"
              onClick={() => navigate('/dashboard')}
              style={{ marginRight: '1rem' }}
            >
              View Analytics
            </button>
            <button 
              className="btn btn-secondary btn-large"
              onClick={() => navigate('/past-sessions')}
            >
              Review Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ padding: '2rem' }}>
      <div className="container">
        {/* Progress Bar */}
        <div style={{
          marginBottom: '2rem',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
          height: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'linear-gradient(90deg, #0066ff, #00d4ff)',
            height: '100%',
            width: `${((currentQuestionIndex + 1) / allQuestions.length) * 100}%`,
            transition: 'width 0.3s ease'
          }}></div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <h2 style={{ margin: 0, color: '#00d4ff' }}>
            Question {currentQuestionIndex + 1} of {allQuestions.length}
          </h2>
          
          {/* Mode Toggle */}
          <div style={{
            display: 'flex',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '25px',
            padding: '0.25rem',
            border: '2px solid rgba(0, 150, 255, 0.2)'
          }}>
            <button
              onClick={() => setInterviewMode('text')}
              style={{
                background: interviewMode === 'text' ? '#00d4ff' : 'transparent',
                color: interviewMode === 'text' ? '#1a1f2e' : '#00d4ff',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              <FaKeyboard size={14} />
              Text Mode
            </button>
            <button
              onClick={() => setInterviewMode('voice')}
              style={{
                background: interviewMode === 'voice' ? '#00d4ff' : 'transparent',
                color: interviewMode === 'voice' ? '#1a1f2e' : '#00d4ff',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              <FaMicrophone size={14} />
              Voice Mode
            </button>
          </div>
          
          {scores.length > 0 && (
            <div style={{
              background: 'rgba(0, 150, 255, 0.1)',
              border: '2px solid #00d4ff',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              color: '#00d4ff',
              fontWeight: 'bold'
            }}>
              Current Average: {(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)}/10
            </div>
          )}
        </div>

        {/* Current Question */}
        {currentQuestion && (
          <ChatCard 
            type="question"
            content={currentQuestion?.text || currentQuestion}
          />
        )}

        {/* Answer Input */}
        {!evaluation && (
          <div style={{
            background: 'rgba(26, 31, 46, 0.8)',
            border: '2px solid rgba(0, 150, 255, 0.2)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            backdropFilter: 'blur(10px)'
          }}>
            <label style={{
              display: 'block',
              color: '#00d4ff',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              Your Answer {interviewMode === 'voice' && <span style={{ fontSize: '0.8rem', color: '#00cc66' }}>🎤 Voice Mode</span>}
            </label>
            
            {interviewMode === 'voice' && (
              <>
                <VoiceRecorder 
                  onTranscriptChange={setUserAnswer}
                  value={currentQuestion?.text || ''}
                  disabled={evaluating}
                  isListening={isListening}
                  error={error}
                  startListening={startListening}
                  stopListening={stopListening}
                  isQuestionSpeaking={isQuestionSpeaking}
                />
                
                {/* Live Confidence Score During Recording */}
                {isListening && liveConfidenceScore > 0 && (
                  <div style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                    animation: 'pulse 2s infinite',
                    zIndex: 1000,
                    background: liveConfidenceScore >= 75 
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : liveConfidenceScore >= 60
                      ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                      : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    border: '3px solid white'
                  }}>
                    <div style={{ fontSize: '36px', color: 'white' }}>{liveConfidenceScore}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.9)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      CONFIDENCE
                    </div>
                  </div>
                )}
              </>
            )}
            
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder={interviewMode === 'voice' ? "Your speech will appear here..." : "Type your answer here..."}
              style={{
                width: '100%',
                minHeight: '150px',
                padding: '1rem',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '2px solid rgba(0, 150, 255, 0.2)',
                borderRadius: '8px',
                color: '#e0e0e0',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                resize: 'vertical'
              }}
              disabled={evaluating}
            />
            <button 
              className="btn btn-primary btn-large"
              onClick={handleEvaluate}
              disabled={evaluating || (interviewMode === 'voice' && isListening)}
              style={{ marginTop: '1rem' }}
            >
              {evaluating ? 'Evaluating...' : 
               (interviewMode === 'voice' && isListening) ? 'Stop Recording First' :
               'Evaluate Answer ✓'}
            </button>
          </div>
        )}

        {evaluating && (
          <LoadingAnimation message="AI is evaluating your answer..." />
        )}

        {/* Evaluation Result */}
        {evaluation && (
          <div>
            <ChatCard 
              type="answer"
              content={evaluation.feedback}
              score={evaluation.score}
              feedback={evaluation.feedback}
              strengths={evaluation.strengths}
              weaknesses={evaluation.weaknesses}
              suggestedAnswer={evaluation.suggestedAnswer}
            />
            
            {/* Speaking Analysis Card (Voice Mode Only) */}
            {(() => {
              console.log('🎨 Render check - interviewMode:', interviewMode, 'currentSpeakingAnalysis:', currentSpeakingAnalysis);
              if (interviewMode === 'voice' && currentSpeakingAnalysis) {
                console.log('✅ Showing SpeakingAnalysisCard');
                return <SpeakingAnalysisCard analysis={currentSpeakingAnalysis} />;
              }
              if (interviewMode === 'voice' && !currentSpeakingAnalysis) {
                console.log('❌ Voice mode but currentSpeakingAnalysis is null/undefined');
              }
              return null;
            })()}
            
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button 
                className="btn btn-primary btn-large"
                onClick={handleNext}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', margin: '0 auto' }}
              >
                <FaArrowRight size={16} />
                {currentQuestionIndex < allQuestions.length - 1 ? 'Next Question' : 'Complete Interview'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockInterview;
