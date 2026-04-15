const axios = require('axios');
const logger = require('../utils/logger');

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Call OpenRouter API for generating questions
const generateQuestionsPrompt = (role, resume) => {
  return `You are an expert HR and technical interviewer. Based on the following resume and job role, generate exactly 7 interview questions:
- 3 technical questions based on the skills and technologies mentioned
- 2 HR/behavioral questions
- 2 project-specific questions about the projects mentioned in the resume

Job Role: ${role}

Resume:
${resume}

Format your response as a JSON object with this exact structure:
{
  "technical": [question1, question2, question3],
  "hr": [question1, question2],
  "project": [question1, question2],
  "followup": []
}

Make questions specific to the skills, projects, and technologies mentioned in the resume. Each question should be distinct and challenging.`;
};

const evaluateAnswerPrompt = (question, userAnswer, role, context = '') => {
  return `You are an expert technical interviewer evaluating a candidate's answer.

Question: ${question}
Candidate Answer: ${userAnswer}
Job Role: ${role}
Previous Context: ${context || 'None'}

Please evaluate this answer and provide a JSON response with this exact structure:
{
  "score": <number 0-10>,
  "strengths": [strength1, strength2, ...],
  "weaknesses": [weakness1, weakness2, ...],
  "suggestedAnswer": "A well-structured answer would be...",
  "missingConcepts": ["concept1", "concept2", ...],
  "feedback": "Overall feedback on the answer..."
}

Be fair but critical. Look for:
- Technical correctness
- Depth of understanding
- Real-world applicability
- Clarity of explanation
- Completeness of answer`;
};

const generateNextQuestionPrompt = (currentScore, questionHistory, role, resume) => {
  const scoreText = currentScore >= 7 ? 'high' : currentScore >= 4 ? 'moderate' : 'low';
  const difficultyLevel = currentScore >= 7 ? 'hard' : currentScore >= 4 ? 'medium' : 'easy';
  
  return `Based on the candidate's performance (${scoreText} - score: ${currentScore}/10), generate the next interview question.

Generate a ${difficultyLevel} difficulty question that:
- Is different from previous questions: ${questionHistory.join(', ')}
- Is appropriate for a ${role} role
- Challenges the candidate appropriately

Format as JSON:
{
  "question": "The question text",
  "type": "technical|hr|project|followup"
}`;
};

const callOpenRouter = async (prompt) => {
  try {
    const response = await axios.post(OPENROUTER_API_URL, {
      model: 'openai/gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
        'X-Title': 'InterviewPrep AI'
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    logger.error(`OpenRouter API Error: ${error.message}`);
    throw new Error('Failed to call AI service');
  }
};

const generateQuestions = async (role, resume) => {
  try {
    const prompt = generateQuestionsPrompt(role, resume);
    const response = await callOpenRouter(prompt);
    
    // Parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI');
    }
    
    const questions = JSON.parse(jsonMatch[0]);
    return questions;
  } catch (error) {
    logger.error(`Generate Questions Error: ${error.message}`);
    throw error;
  }
};

const evaluateAnswer = async (question, userAnswer, role, context = '') => {
  try {
    const prompt = evaluateAnswerPrompt(question, userAnswer, role, context);
    const response = await callOpenRouter(prompt);
    
    // Parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI');
    }
    
    const evaluation = JSON.parse(jsonMatch[0]);
    return evaluation;
  } catch (error) {
    logger.error(`Evaluate Answer Error: ${error.message}`);
    throw error;
  }
};

const generateNextQuestion = async (currentScore, questionHistory, role, resume) => {
  try {
    const prompt = generateNextQuestionPrompt(currentScore, questionHistory, role, resume);
    const response = await callOpenRouter(prompt);
    
    // Parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI');
    }
    
    const nextQuestion = JSON.parse(jsonMatch[0]);
    return nextQuestion;
  } catch (error) {
    logger.error(`Generate Next Question Error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  generateQuestions,
  evaluateAnswer,
  generateNextQuestion
};
