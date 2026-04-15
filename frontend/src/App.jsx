import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import QuestionGenerator from './pages/QuestionGenerator';
import MockInterview from './pages/MockInterview';
import Dashboard from './pages/Dashboard';
import PastSessions from './pages/PastSessions';
import Settings from './pages/Settings';
import './App.css';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : true;
  });
  const [activeLink, setActiveLink] = useState('/');

  useEffect(() => {
    // Update document theme
    if (isDarkMode) {
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.style.colorScheme = 'light';
    }
  }, [isDarkMode]);

  return (
    <Router>
      <div className={`app ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        <Header 
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode}
          activeLink={activeLink}
        />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/generate" element={<QuestionGenerator />} />
            <Route path="/interview" element={<MockInterview />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/past-sessions" element={<PastSessions />} />
            <Route path="/settings" element={<Settings />} />
           
            {/* Catch-all redirect to home */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
