import React, { useEffect } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaPlay } from 'react-icons/fa';

const VoiceRecorder = ({ 
  onTranscriptChange, 
  value, 
  disabled,
  isListening,
  error,
  startListening,
  stopListening
}) => {
  // Voice recorder is now a dumb component - speech recognition is managed by parent
  
  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const speakQuestion = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      // Try to use a female voice if available
      const voices = speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => voice.name.includes('Female') || voice.name.includes('Zira') || voice.name.includes('Samantha'));
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      {/* Browser Compatibility Warning */}
      <div style={{
        background: 'rgba(255, 170, 0, 0.1)',
        border: '1px solid #ffaa00',
        borderRadius: '6px',
        padding: '0.5rem',
        marginBottom: '1rem',
        fontSize: '0.85rem',
        color: '#ffaa00'
      }}>
        <strong>💡 Voice mode works best in Chrome and Edge browsers</strong>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          background: 'rgba(255, 51, 51, 0.1)',
          border: '1px solid #ff3333',
          borderRadius: '6px',
          padding: '0.5rem',
          marginBottom: '1rem',
          fontSize: '0.85rem',
          color: '#ff6666'
        }}>
          {error}
        </div>
      )}

      {/* Status Indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.5rem',
        fontSize: '0.9rem',
        color: isListening ? '#00cc66' : '#888'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: isListening ? '#00cc66' : '#888',
          animation: isListening ? 'pulse 1.5s infinite' : 'none'
        }}></div>
        {isListening ? 'Listening...' : 'Recording stopped'}
      </div>

      {/* Microphone Button */}
      <button
        onClick={handleMicClick}
        disabled={disabled}
        style={{
          background: isListening ? 'rgba(255, 51, 51, 0.2)' : 'rgba(0, 204, 102, 0.2)',
          border: `2px solid ${isListening ? '#ff3333' : '#00cc66'}`,
          color: isListening ? '#ff6666' : '#00cc66',
          padding: '0.75rem 1.5rem',
          borderRadius: '50px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: '600',
          transition: 'all 0.3s ease',
          marginBottom: '1rem',
          animation: isListening ? 'micPulse 1.5s infinite' : 'none'
        }}
      >
        {isListening ? <FaMicrophoneSlash size={16} /> : <FaMicrophone size={16} />}
        {isListening ? 'Stop Recording' : 'Start Recording'}
      </button>

      {/* Speak Question Button */}
      <button
        onClick={() => speakQuestion('Please answer the following question: ' + value)}
        disabled={disabled || !value.trim()}
        style={{
          background: 'rgba(0, 150, 255, 0.2)',
          border: '2px solid #0096ff',
          color: '#00d4ff',
          padding: '0.5rem 1rem',
          borderRadius: '25px',
          cursor: disabled || !value.trim() ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.85rem',
          fontWeight: '600',
          marginLeft: '1rem',
          opacity: disabled || !value.trim() ? 0.5 : 1
        }}
      >
        <FaPlay size={12} />
        Speak Question
      </button>
    </div>
  );
};

export default VoiceRecorder;