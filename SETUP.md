# 🚀 Quick Start Guide - InterviewPrep AI

Complete setup guide for InterviewPrep AI in under 10 minutes.

---

## 📋 Prerequisites Checklist

- [ ] Node.js v14+ installed (`node --version`)
- [ ] MongoDB Atlas account created (free tier)
- [ ] OpenRouter account with API key
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

---

## ⚡ Step-by-Step Setup

### 1️⃣ MongoDB Atlas Setup (2 minutes)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a new cluster (M0 Free tier)
4. Click "Collections" > "Create Database"
5. Database name: `interviewprep`
6. Collection: `sessions`
7. Click "Connect"
8. Choose "Drivers"
9. Copy connection string: `mongodb+srv://username:password@...`
10. Replace `username` and `password` with your credentials
11. Save this string ✅

### 2️⃣ OpenRouter API Setup (2 minutes)

1. Go to https://openrouter.ai
2. Sign up
3. Go to Settings > API Keys
4. Create new API key
5. Copy the key ✅

### 3️⃣ Backend Setup (2 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
# On Windows (PowerShell):
Copy-Item .env.example .env

# On Mac/Linux:
cp .env.example .env

# Edit .env and add your credentials:
# MONGODB_URI=your_mongodb_connection_string
# OPENROUTER_API_KEY=your_openrouter_key
```

**Edit `backend/.env`:**
```env
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.mongodb.net/interviewprep?retryWrites=true&w=majority
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx
NODE_ENV=development
JWT_SECRET=interview-prep-secret-2024
FRONTEND_URL=http://localhost:3000
```

### 4️⃣ Frontend Setup (2 minutes)

```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Optional: Create .env (usually not needed for local dev)
# Copy-Item .env.example .env
```

### 5️⃣ Run the Application

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev

# Expected output:
# Server running on port 5000
# MongoDB Connected: cluster0.mongodb.net
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm start

# Expected output:
# Compiled successfully!
# Localhost: http://localhost:3000
```

---

## ✅ Verify Everything Works

1. Open http://localhost:3000 in browser
2. You should see the landing page
3. Try these steps:
   - Click "Start Preparing Now"
   - Paste sample resume:
     ```
     John Doe
     Email: john@example.com
     
     TECHNICAL SKILLS
     - React, Node.js, MongoDB, JavaScript
     - REST APIs, Git, Docker
     
     EXPERIENCE
     - Senior Developer at TechCorp (2021-Present)
       - Built scalable web applications
       - Led a team of 5 developers
     
     PROJECTS
     - E-commerce Platform: React + Node.js + MongoDB
     - Weather App: Real-time data using public APIs
     
     EDUCATION
     - B.S. in Computer Science
     ```
   - Select "Software Developer" role
   - Click "Generate Questions"
   - If questions appear ✅ Success!

---

## 🎯 Common Issues

### Issue: "Cannot connect to MongoDB"
**Solution:**
- Check connection string in `.env`
- Verify IP whitelist in MongoDB Atlas
- Test connection in MongoDB Compass

### Issue: "OpenRouter API error"
**Solution:**
- Check API key is correct and active
- Verify account has credits
- Check rate limits

### Issue: "Backend not connecting to frontend"
**Solution:**
- Ensure backend runs on port 5000
- Check CORS in `server.js`
- Verify `REACT_APP_API_URL` if using custom

### Issue: "Port already in use"
**Solution:**
```bash
# Find process using port
# Windows:
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F

# Or use different port in .env
PORT=5001
```

---

## 📚 Environment Variables Quick Reference

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGODB_URI | Database connection | mongodb+srv://... |
| OPENROUTER_API_KEY | AI API key | sk-or-v1-... |
| NODE_ENV | Environment | development/production |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:3000 |

### Frontend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| REACT_APP_API_URL | Backend API URL | http://localhost:5000/api |

---

## 🧪 Test API Endpoints

Use Postman or curl to test:

```bash
# Health check
curl http://localhost:5000/api/health

# Generate questions (example)
curl -X POST http://localhost:5000/api/interviews/generate-questions \
  -H "Content-Type: application/json" \
  -d '{
    "role": "Software Developer",
    "resume": "Your resume text here",
    "userId": "test-user-123"
  }'
```

---

## 📱 Next Steps After Setup

1. ✅ Complete your first interview
2. ✅ View your analytics on Dashboard
3. ✅ Explore Settings and customize
4. ✅ Practice with multiple roles
5. ✅ Track progress over time

---

## 🚀 Production Deployment

When ready to deploy:

1. **Backend** (Heroku/Railway/Render):
   - Set environment variables
   - Deploy from GitHub
   - Use production MongoDB

2. **Frontend** (Vercel/Netlify):
   - Set `REACT_APP_API_URL` to production backend
   - Deploy from GitHub
   - Enable auto-deployments

See `README.md` for detailed deployment instructions.

---

## 💡 Pro Tips

- **Faster Testing**: Save sample resume in Settings
- **Better Feedback**: Write detailed resume with projects
- **Track Progress**: Take interviews regularly and check Dashboard
- **Learn from Feedback**: Review suggestions after each question

---

## 🆘 Need Help?

1. Check ERROR LOGS in browser console (F12)
2. Check terminal for backend errors
3. Review `.env` variables
4. Check MongoDB Atlas status
5. Visit API health: http://localhost:5000/api/health

---

## 🎉 You're All Set!

InterviewPrep AI is ready to use! 

Start preparing: http://localhost:3000

Good luck with your interviews! 🚀

---

**Questions? Check the README.md or Settings > FAQ**
