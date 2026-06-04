import { useState, useEffect, useRef } from 'react';

const FILLER_PATTERNS = /\b(um|uh|like|basically|you know|actually|kind of|sort of)\b/gi;

const useSpeechRecognition = (isQuestionSpeaking = false) => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [liveConfidenceScore, setLiveConfidenceScore] = useState(0);
  const [speakingAnalysis, setSpeakingAnalysis] = useState(null);

  const recognitionRef = useRef(null);
  const accumulatedTranscriptRef = useRef('');
  const shouldBeListeningRef = useRef(false);
  const interimTranscriptRef = useRef('');
  const isQuestionSpeakingRef = useRef(isQuestionSpeaking);
  
  // Speaking analysis refs
  const startTimeRef = useRef(null);
  const lastSpeechTimeRef = useRef(null);
  const fillerWordsRef = useRef([]);
  const pausesRef = useRef([]);
  const wordsTimingRef = useRef([]);

  useEffect(() => {
    isQuestionSpeakingRef.current = isQuestionSpeaking;
  }, [isQuestionSpeaking]);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      // Ignore speech recognition results while AI is speaking the question
      console.log('🎤 Speech recognition result - isQuestionSpeaking:', isQuestionSpeakingRef.current, 'transcript length:', event.results[0][0].transcript.length);
      if (isQuestionSpeakingRef.current) {
        console.log('🔇 Ignoring speech recognition - AI is speaking');
        return;
      }

      let finalTranscript = '';
      let interimTranscript = '';
      const currentTime = Date.now();

      // Track pause detection
      if (lastSpeechTimeRef.current && (currentTime - lastSpeechTimeRef.current) > 2000) {
        pausesRef.current.push({
          duration: currentTime - lastSpeechTimeRef.current,
          time: lastSpeechTimeRef.current
        });
      }
      lastSpeechTimeRef.current = currentTime;

      // Process results from resultIndex onwards (only new results)
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += text + ' ';
          console.log('Final transcript chunk:', text);
          
          // Detect filler words in final transcript
          const fillerMatches = text.match(FILLER_PATTERNS);
          if (fillerMatches) {
            fillerMatches.forEach(word => {
              fillerWordsRef.current.push({
                word: word.toLowerCase(),
                time: currentTime
              });
            });
          }

          // Track word timing for WPM calculation
          const words = text.split(/\s+/).filter(w => w.length > 0);
          words.forEach((word, idx) => {
            wordsTimingRef.current.push({
              word,
              time: currentTime + (idx * 100) // Approximate timing
            });
          });
        } else {
          interimTranscript += text;
          console.log('Interim transcript chunk:', text);
        }
      }

      // Accumulate final transcript
      if (finalTranscript) {
        accumulatedTranscriptRef.current += finalTranscript;
      }

      // Update UI with accumulated + interim
      interimTranscriptRef.current = interimTranscript;
      const fullTranscript = accumulatedTranscriptRef.current + interimTranscript;
      console.log('Updated transcript:', fullTranscript);
      setTranscript(fullTranscript);

      // Calculate and update live confidence score
      updateLiveConfidence();
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setError(`Speech recognition error: ${event.error}`);
      // Don't set isListening to false on error - let onend handle it
    };

    const updateLiveConfidence = () => {
      // Calculate live confidence score based on current metrics
      const totalWords = accumulatedTranscriptRef.current.split(/\s+/).filter(w => w.length > 0).length;
      const fillerCount = fillerWordsRef.current.length;
      const pauseCount = pausesRef.current.length;

      let score = 100;
      
      // Deduct for filler words (2 pts per filler word, max -30)
      score -= Math.min(fillerCount * 2, 30);
      
      // Deduct for excessive pauses (5 pts per pause, max -20)
      score -= Math.min(pauseCount * 5, 20);

      // Deduct for too slow or too fast (if we can calculate WPM)
      if (startTimeRef.current && totalWords > 5) {
        const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000;
        const wpm = Math.round((totalWords / elapsedSeconds) * 60);
        if (wpm < 100 || wpm > 200) {
          score -= 10;
        }
      }

      // Ensure score is between 0-100
      score = Math.max(0, Math.min(100, score));
      setLiveConfidenceScore(score);
    };

    recognition.onend = () => {
      console.log('Speech recognition ended. shouldBeListening:', shouldBeListeningRef.current);
      
      // If user hasn't manually stopped, auto-restart
      if (shouldBeListeningRef.current) {
        console.log('Auto-restarting speech recognition after pause...');
        try {
          setTimeout(() => {
            if (shouldBeListeningRef.current && recognitionRef.current) {
              recognitionRef.current.start();
            }
          }, 100);
        } catch (err) {
          console.error('Failed to restart recognition:', err);
        }
      } else {
        setIsListening(false);
      }
    };

    return () => {
      shouldBeListeningRef.current = false;
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const startListening = () => {
    // Prevent starting microphone while AI is speaking the question
    console.log('🎤 Attempting to start listening - isQuestionSpeaking:', isQuestionSpeakingRef.current);
    if (isQuestionSpeakingRef.current) {
      console.log('❌ Cannot start listening - AI is still speaking');
      setError('Please wait for the question to finish speaking before starting to record.');
      return;
    }

    if (recognitionRef.current) {
      try {
        shouldBeListeningRef.current = true;
        accumulatedTranscriptRef.current = '';
        interimTranscriptRef.current = '';
        setTranscript('');
        setError(null);

        // Reset speaking analysis tracking
        startTimeRef.current = Date.now();
        lastSpeechTimeRef.current = Date.now();
        fillerWordsRef.current = [];
        pausesRef.current = [];
        wordsTimingRef.current = [];
        setSpeakingAnalysis(null);
        setLiveConfidenceScore(0);

        console.log('Starting speech recognition...');
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start recognition:', err);
        setError('Failed to start speech recognition. Please check microphone permissions.');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      console.log('🔴 Stopping speech recognition...');
      shouldBeListeningRef.current = false;
      // Finalize any interim text
      accumulatedTranscriptRef.current += interimTranscriptRef.current;
      interimTranscriptRef.current = '';
      setTranscript(accumulatedTranscriptRef.current);

      // Calculate final speaking analysis
      const analysis = calculateSpeakingAnalysis();
      console.log('📊 Calculated speakingAnalysis in hook:', analysis);
      setSpeakingAnalysis(analysis);
      console.log('✅ Set speakingAnalysis state in hook');
      
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const calculateSpeakingAnalysis = () => {
    const endTime = Date.now();
    const fullTranscript = accumulatedTranscriptRef.current;
    const words = fullTranscript.split(/\s+/).filter(w => w.length > 0);
    const totalWords = words.length;

    // Calculate WPM
    let wpm = 0;
    if (startTimeRef.current) {
      const elapsedSeconds = (endTime - startTimeRef.current) / 1000;
      wpm = elapsedSeconds > 0 ? Math.round((totalWords / elapsedSeconds) * 60) : 0;
    }

    // Hesitation & pause metrics
    const pauseDurations = pausesRef.current.map(p => p.duration);
    const pauseCount = pausesRef.current.length;
    const totalPauseMs = pauseDurations.reduce((a, b) => a + b, 0);
    const longestPause = pauseDurations.length > 0 ? Math.max(...pauseDurations) : 0;

    // Filler metrics
    const fillerCount = fillerWordsRef.current.length;

    // Repeated words detection (stuttering)
    let repeatedWordsCount = 0;
    for (let i = 1; i < words.length; i += 1) {
      if (words[i].toLowerCase() === words[i - 1].toLowerCase()) {
        repeatedWordsCount += 1;
      }
    }

    // Sentence completion / clarity heuristics
    const sentenceEndings = (fullTranscript.match(/[.!?]+/g) || []).length;
    const sentenceScore = totalWords > 0 ? Math.min(100, Math.round((sentenceEndings / Math.max(1, totalWords / 12)) * 100)) : 0;

    // Voice stability approximate: if high variation in pause duration and many repeated words -> lower
    const stabilityScore = Math.max(0, 100 - Math.min(40, repeatedWordsCount * 5 + Math.round((totalPauseMs / Math.max(1, pauseCount)) / 500)));

    // Fluency score: depends on hesitation, repeated words, filler
    const fluencyScore = Math.max(0, 100 - (Math.min(40, pauseCount * 4) + Math.min(30, fillerCount * 3) + Math.min(20, repeatedWordsCount * 5)));

    // Pace score: ideal 110-160
    let paceScore = 0;
    if (wpm <= 110) paceScore = Math.max(0, 100 - (110 - wpm));
    else if (wpm <= 160) paceScore = 100;
    else paceScore = Math.max(0, 100 - (wpm - 160));

    // Filler and pause penalties
    const fillerPenaltyScore = Math.max(0, 100 - Math.min(100, fillerCount * 7));
    const pausePenaltyScore = Math.max(0, 100 - Math.min(100, Math.round(totalPauseMs / 1000) * 6));

    const clarityScore = sentenceScore;

    let confidenceScore = (
      (fluencyScore * 0.25) +
      (paceScore * 0.20) +
      (fillerPenaltyScore * 0.15) +
      (pausePenaltyScore * 0.15) +
      (stabilityScore * 0.15) +
      (clarityScore * 0.10)
    );

    // Add slight natural variation
    const jitter = (Math.random() * 6) - 3; // ±3
    confidenceScore = Math.max(0, Math.min(100, Math.round(confidenceScore + jitter)));

    // Ensure realistic wide range
    if (confidenceScore > 98) confidenceScore = 98;

    const suggestions = [];
    if (fillerCount > 3) {
      suggestions.push(`Reduce filler words from ${fillerCount} to under 3 for clearer delivery.`);
    }
    if (wpm < 110) {
      suggestions.push(`Increase pace; current ${wpm} WPM, target 110–160.`);
    } else if (wpm > 160) {
      suggestions.push(`Slow down a bit; current ${wpm} WPM, target 110–160.`);
    }
    if (pauseCount > 2) {
      suggestions.push(`Minimize pauses; detected ${pauseCount} pauses during answer.`);
    }
    if (repeatedWordsCount > 1) {
      suggestions.push(`Avoid repeating words; detected ${repeatedWordsCount} stuttering instances.`);
    }
    if (suggestions.length === 0) {
      suggestions.push('Excellent speaking clarity and pace. Keep it up!');
    }

    return {
      wordsPerMinute: wpm,
      fillerWords: fillerCount,
      pauseCount,
      hesitationCount: pauseCount + fillerCount,
      repeatedWordsCount,
      longestPause: Math.round(longestPause / 1000),
      confidenceScore,
      wpmScore: paceScore,
      fluencyScore,
      stabilityScore,
      clarityScore,
      suggestions,
      totalWords,
      duration: endTime - (startTimeRef.current || endTime)
    };
  };

  const resetTranscript = () => {
    console.log('Resetting transcript');
    accumulatedTranscriptRef.current = '';
    interimTranscriptRef.current = '';
    setTranscript('');
  };

  return {
    transcript,
    isListening,
    error,
    startListening,
    stopListening,
    resetTranscript,
    speakingAnalysis,
    liveConfidenceScore
  };
};

export default useSpeechRecognition;