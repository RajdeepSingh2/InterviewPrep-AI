# 🏗️ InterviewPrep AI - System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER (React)                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Pages: Home | Generate | Interview | Dashboard | Sessions   │  │
│  │ Components: Header | Footer | ChatCard | LoadingAnimation   │  │
│  │ Services: API Client, Hooks, Utilities                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓ HTTPS/REST ↓                        │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      API LAYER (Express.js)                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ /api/interviews   /api/sessions   /api/analytics            │  │
│  │ Controllers:      Services:       Models:                   │  │
│  │ - Interview       - AI Service    - User                    │  │
│  │ - Session         - Session       - Session                 │  │
│  │ - Analytics       - Analytics     - Question                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓                                      │
└─────────────────────────────────────────────────────────────────────┘
             ↙              ↓              ↘
     ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
     │  OpenRouter  │ │  MongoDB     │ │  Logging &   │
     │  AI APIs     │ │  Atlas       │ │  Error       │
     │              │ │  Database    │ │  Handling    │
     └──────────────┘ └──────────────┘ └──────────────┘
```

---

## Data Flow Diagram

### Generate Questions Flow:
```
User Input (Resume + Role)
      ↓
Question Generator Page
      ↓
Send POST /api/interviews/generate-questions
      ↓
Interview Controller
      ↓
AI Service (OpenRouter API)
      ↓
Parse Questions JSON
      ↓
Session Service (Create Session)
      ↓
Save to MongoDB
      ↓
Return Questions to Frontend
      ↓
Display Questions in UI
```

### Interview Evaluation Flow:
```
User Answer
      ↓
Mock Interview Page
      ↓
Send POST /api/interviews/evaluate-answer
      ↓
Interview Controller
      ↓
AI Service (OpenRouter API)
      ↓
Parse Evaluation JSON
      ↓
Session Service (Update Answers)
      ↓
Save to MongoDB
      ↓
Return Evaluation to Frontend
      ↓
Display Feedback & Score
```

### Analytics Flow:
```
User Request Dashboard
      ↓
Dashboard Page
      ↓
Send GET /api/analytics/user/:userId
      ↓
Analytics Controller
      ↓
Analytics Service (Query Sessions)
      ↓
Process Metrics
      ↓
Return Analytics Data
      ↓
Display Charts (Chart.js)
```

---

## Database Schema Relationships

```
┌─────────────────────────┐
│        User             │
├─────────────────────────┤
│ _id                     │
│ name                    │
│ email                   │
│ resume                  │
│ preferredRole           │
│ totalInterviews         │
│ averageScore            │
│ createdAt               │
└──────────────┬──────────┘
               │ (1:Many)
               ↓
┌─────────────────────────────────────────────────────┐
│              Session                                │
├─────────────────────────────────────────────────────┤
│ _id                                                 │
│ userId (ref: User)                                  │
│ role                                                │
│ resume                                              │
│ questionsGenerated: []                              │
│ answers: [{                                         │
│   questionId                                        │
│   question                                          │
│   userAnswer                                        │
│   aiScore (0-10)                                    │
│   aiFeedback                                        │
│   strengths: []                                     │
│   weaknesses: []                                    │
│   suggestedAnswer                                   │
│   missingConcepts: []                               │
│ }]                                                  │
│ totalScore                                          │
│ status (in-progress/completed)                      │
│ interviewMode (text/voice)                          │
│ startedAt                                           │
│ completedAt                                         │
│ topicWiseScores: {                                  │
│   technical, hr, project, followup                  │
│ }                                                   │
└─────────────────────────────────────────────────────┘
               │ (1:Many)
               ↓
┌─────────────────────────┐
│      Question           │
├─────────────────────────┤
│ _id                     │
│ sessionId (ref)         │
│ questionText            │
│ questionType            │
│ difficulty              │
│ skills: []              │
│ keywords: []            │
│ expectedAnswer          │
└─────────────────────────┘
```

---

## Component Hierarchy

```
App (Root)
├── BrowserRouter
│   └── Routes
│       ├── Home Page
│       ├── QuestionGenerator Page
│       │   └── Generated Questions (Cards)
│       ├── MockInterview Page
│       │   ├── Current Question (ChatCard)
│       │   ├── User Answer Input
│       │   ├── Evaluation Result (ChatCard)
│       │   └── LoadingAnimation
│       ├── Dashboard Page
│       │   ├── StatCard (x4)
│       │   ├── Pie Chart (Chart.js)
│       │   ├── Line Chart (Chart.js)
│       │   └── Sessions Table
│       ├── PastSessions Page
│       │   ├── Sessions List (Sidebar)
│       │   └── Session Details (Main)
│       └── Settings Page
│           ├── Preferences Section
│           ├── Display Settings
│           ├── Notifications
│           ├── FAQ
│           └── About
│
├── Header
│   ├── Logo
│   ├── Navigation Items
│   ├── Theme Toggle
│   └── User Menu (ready for auth)
│
└── Footer
    ├── Company Info
    ├── Links
    └── Social Media
```

---

## Backend Route Structure

```
/api
├── /interviews
│   ├── POST /generate-questions      → interviewController.generateQuestions()
│   ├── POST /evaluate-answer         → interviewController.evaluateAnswer()
│   ├── POST /next-question           → interviewController.getNextQuestion()
│   └── POST /complete                → interviewController.completeInterview()
│
├── /sessions
│   ├── GET /user/:userId             → sessionController.getAllSessions()
│   ├── GET /:sessionId               → sessionController.getSession()
│   └── DELETE /:sessionId            → sessionController.deleteSession()
│
└── /analytics
    ├── GET /user/:userId             → analyticsController.getUserAnalytics()
    └── GET /session/:sessionId       → analyticsController.getSessionPerformance()
```

---

## External API Integrations

### OpenRouter API (AI)
```
Request:
POST https://openrouter.ai/api/v1/chat/completions
{
  "model": "openai/gpt-3.5-turbo",
  "messages": [
    {
      "role": "user",
      "content": "Your prompt here"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 2000
}

Response:
{
  "choices": [
    {
      "message": {
        "content": "AI response"
      }
    }
  ]
}
```

### MongoDB Atlas
```
Connection:
mongodb+srv://username:password@cluster.mongodb.net/database

Operations:
- Create/Read/Update/Delete Sessions
- Create/Read Questions
- Aggregate Analytics
```

---

## State Management & Data Flow

### Frontend State (React Hooks):
```
App Level:
- isDarkMode (boolean)
- activeLink (string)

Page Level:
- QuestionGenerator: role, resume, questions, loading, error
- MockInterview: currentQIndex, userAnswer, evaluation, scores
- Dashboard: analytics, loading, error
- PastSessions: sessions, selectedSession, filter
- Settings: preferences, savedSettings

Local Storage:
- userId
- currentSessionId
- userPreferences
- savedResume
```

### Backend Data Flow:
```
Request → Validation → Processing → Database → Response

1. Request arrives at route
2. Controller receives request
3. Service processes business logic
4. Model interacts with MongoDB
5. Data returned to service
6. Service formats response
7. Controller sends response
8. Middleware handles errors
```

---

## Authentication Points (Ready for Future)

```
Current: No authentication (guest mode)

Future Implementation:
frontend/services/authService.js
backend/routes/auth.js
backend/controllers/authController.js
backend/middleware/authMiddleware.js

Flow:
Login/Signup → JWT Token → Store in localStorage → 
Send with each API request → Verify on backend → 
Return protected data
```

---

## Performance Considerations

### Frontend Optimization:
```
✓ Component memoization ready
✓ Lazy loading routes ready
✓ Image optimization ready
✓ CSS minimified for production
✓ API call caching ready
✓ Debouncing for repeated calls
```

### Backend Optimization:
```
✓ Database indexing ready
✓ Query optimization ready
✓ Caching layer ready
✓ Pagination ready
✓ Compression middleware ready
✓ Rate limiting ready
```

---

## Deployment Architecture

### Development:
```
Frontend: http://localhost:3000 (npm start)
Backend: http://localhost:5000 (npm run dev)
Database: MongoDB Atlas Cloud
```

### Production:
```
Frontend: CDN/Vercel/Netlify
Backend: Cloud Platform (Render/Railway/Heroku)
Database: MongoDB Atlas Production Cluster
```

---

## Error Handling Flow

```
Error Occurs
    ↓
Node.js catches error
    ↓
Backend Logger.error()
    ↓
Error middleware processes
    ↓
Send error response (no sensitive data)
    ↓
Frontend receives error
    ↓
Display user-friendly message
    ↓
Log to browser console for debugging
```

---

## Security Architecture

```
HTTPS/TLS Encryption
        ↓
CORS Policy (specific origin)
        ↓
Environment Variables (secrets)
        ↓
Input Validation (required fields)
        ↓
Sanitization (XSS prevention)
        ↓
MongoDB SSL Connection
        ↓
No sensitive data in logs/responses
```

---

## Scalability Considerations

```
Current Bottleneck:
- AI API rate limits
- MongoDB connection limits

Solutions:
- Queue system for many API calls
- Connection pooling
- Database read replicas
- CDN for static assets
- Load balancing for multiple servers
- Caching layer (Redis)
```

---

## Monitoring Points

Ready to implement:
```
Frontend:
- Error tracking (Sentry)
- Performance monitoring
- User analytics
- Session replay

Backend:
- Request logging
- Error tracking
- Performance metrics
- Database monitoring
```

---

**For detailed information, see the code and inline comments**
