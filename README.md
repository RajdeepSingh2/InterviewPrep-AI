# 🚀 InterviewPrep AI - AI-Powered Interview Coach Platform

A complete, modern, production-quality interview preparation platform that uses AI to generate personalized interview questions, evaluate answers in real-time, and provide detailed analytics.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Usage](#usage)
- [Deployment](#deployment)

---

## ✨ Features

### Core Features
- **🎯 Personalized Question Generation** - AI generates technical, HR, and project-specific questions based on your resume
- **📝 Mock Interview Mode** - Practice answering questions with AI evaluation
- **⭐ Real-time Evaluation** - Get scores (0-10), feedback, strengths, and suggested answers
- **📊 Analytics Dashboard** - View progress, scores, and performance metrics
- **💾 Session Management** - Save and review past interviews
- **🎙️ Voice Interview Mode** - Answer questions using speech (optional)
- **🌙 Dark/Light Mode** - Toggle between themes for comfortable viewing

### Technical Features
- Adaptive difficulty questions based on performance
- Detailed topic-wise performance analysis
- Progress tracking with charts and graphs
- Responsive design for mobile and desktop
- Glassmorphism UI with modern animations
- OpenRouter API integration for AI

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **React Router v6** - Navigation
- **Chart.js** - Analytics visualization
- **CSS3** - Styling with glassmorphism effects
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **OpenRouter API** - AI integration
- **Mongoose** - ODM for MongoDB

### Tools & Services
- **MongoDB Atlas** - Database hosting
- **OpenRouter** - AI API provider
- **Git** - Version control

---

## 📁 Project Structure

```
interviewprepaimade/
├── backend/
│   ├── controllers/
│   │   ├── interviewController.js    # Interview logic
│   │   ├── sessionController.js      # Session management
│   │   └── analyticsController.js    # Analytics logic
│   ├── models/
│   │   ├── User.js                   # User schema
│   │   ├── Session.js                # Interview session schema
│   │   └── Question.js               # Question schema
│   ├── routes/
│   │   ├── interviews.js             # Interview routes
│   │   ├── sessions.js               # Session routes
│   │   └── analytics.js              # Analytics routes
│   ├── services/
│   │   ├── aiService.js              # OpenRouter integration
│   │   ├── sessionService.js         # Session business logic
│   │   └── analyticsService.js       # Analytics logic
│   ├── utils/
│   │   ├── db.js                     # MongoDB connection
│   │   └── logger.js                 # Logging utility
│   ├── .env                          # Environment variables
│   ├── package.json
│   └── server.js                     # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx            # Navigation header
│   │   │   ├── Header.css
│   │   │   ├── Footer.jsx            # Footer component
│   │   │   ├── Footer.css
│   │   │   ├── LoadingAnimation.jsx  # Loading spinner
│   │   │   ├── LoadingAnimation.css
│   │   │   ├── ChatCard.jsx          # Q&A display card
│   │   │   └── ChatCard.css
│   │   ├── pages/
│   │   │   ├── Home.jsx              # Landing page
│   │   │   ├── QuestionGenerator.jsx # Question generation
│   │   │   ├── MockInterview.jsx     # Interview mode
│   │   │   ├── Dashboard.jsx         # Analytics
│   │   │   ├── PastSessions.jsx      # Session history
│   │   │   ├── Settings.jsx          # User settings
│   │   │   └── Pages.css             # Page styles
│   │   ├── services/
│   │   │   └── api.js                # API client
│   │   ├── hooks/
│   │   │   └── useFetch.js           # Custom fetch hook
│   │   ├── utils/
│   │   │   ├── constants.js          # App constants
│   │   │   └── helpers.js            # Utility functions
│   │   ├── App.jsx                   # Main app component
│   │   ├── App.css                   # Global styles
│   │   ├── index.js                  # Entry point
│   │   └── index.html
│   ├── public/
│   │   └── index.html
│   ├── .gitignore
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## 🚀 Installation

### Prerequisites
- **Node.js** v14 or higher
- **npm** or **yarn**
- **MongoDB Atlas** account (free tier available)
- **OpenRouter** API key

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd interviewprepaimade
```

### Step 2: Backend Setup

```bash
cd backend
npm install
```

**Create `.env` file in backend directory:**

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/interviewprep?retryWrites=true&w=majority
OPENROUTER_API_KEY=your_api_key_here
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:3000
```

### Step 3: Frontend Setup

```bash
cd ../frontend
npm install
```

**Create `.env` file in frontend directory (optional):**

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## ⚙️ Configuration

### MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Replace `username` and `password` in the connection string
6. Add your IP address to the whitelist

### OpenRouter API Setup

1. Go to [OpenRouter](https://openrouter.ai)
2. Sign up and create an account
3. Generate an API key
4. Add it to your backend `.env` file

---

## 🎮 Running the Application

### Development Mode

**Terminal 1 - Start Backend:**

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:5000`

**Terminal 2 - Start Frontend:**

```bash
cd frontend
npm start
```

Frontend will run on `http://localhost:3000`

### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm install -g serve
serve -s build
```

---

## 🔌 API Endpoints

### Interview Management
- `POST /api/interviews/generate-questions` - Generate interview questions
- `POST /api/interviews/evaluate-answer` - Evaluate a user's answer
- `POST /api/interviews/next-question` - Get next adaptive question
- `POST /api/interviews/complete` - Complete interview session

### Session Management
- `GET /api/sessions/user/:userId` - Get all sessions for user
- `GET /api/sessions/:sessionId` - Get session details
- `DELETE /api/sessions/:sessionId` - Delete a session

### Analytics
- `GET /api/analytics/user/:userId` - Get user analytics
- `GET /api/analytics/session/:sessionId` - Get session performance

---

## 📖 Usage

### Quick Start Guide

1. **Visit the Home Page** (http://localhost:3000)
   - View features and benefits
   - Click "Start Preparing Now"

2. **Generate Questions**
   - Select your target job role
   - Paste your resume
   - Click "Generate Questions"

3. **Take Mock Interview**
   - Review generated questions
   - Click "Start Mock Interview"
   - Answer each question
   - Receive AI evaluation and feedback

4. **View Analytics**
   - Go to Dashboard
   - See performance metrics
   - Track progress over time

5. **Manage Sessions**
   - Visit Past Sessions
   - Review previous interviews
   - Delete old sessions

---

## 💡 Tips for Best Results

- **Be Specific in Resume**: Include technologies, frameworks, and projects
- **Answer Thoroughly**: Provide detailed answers for better evaluation
- **Review Feedback**: Pay attention to weaknesses identified
- **Practice Regularly**: Take multiple interviews to improve
- **Save Sessions**: Keep track of your progress

---

## 📱 Browser Support

- Chrome/Chromium (Latest)
- Firefox (Latest)
- Safari (Latest)
- Edge (Latest)

---

## 🔒 Security Notes

- Environment variables are kept secret
- MongoDB connections use SSL/TLS
- API responses validate user input
- Sessions are stored securely

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🎯 Roadmap

- [ ] User authentication (login/signup)
- [ ] Video interview mode with recording
- [ ] More AI models integration
- [ ] Interview scheduling feature
- [ ] Mobile app (React Native)
- [ ] PDF report download
- [ ] Company-specific question sets
- [ ] Peer comparison and benchmarking

---

## 🐛 Troubleshooting

### Backend doesn't connect to MongoDB
- Check MongoDB URI in `.env`
- Ensure IP is whitelisted in MongoDB Atlas
- Verify network connection

### AI API calls fail
- Check OpenRouter API key
- Verify API key is active
- Check rate limits

### Frontend can't reach backend
- Ensure backend is running on port 5000
- Check `REACT_APP_API_URL` in frontend `.env`
- Check CORS settings in backend

---

## 📞 Support

For issues or questions:
1. Check the FAQ in Settings
2. Review the README
3. Check browser console for errors
4. Open an issue on GitHub

---

## 🎉 Thank You!

Thank you for using InterviewPrep AI! Good luck with your interviews! 🚀

---

**Made with ❤️ for interview enthusiasts**
