import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaBrain, FaHistory, FaChartBar, FaCog, FaMoon, FaSun } from 'react-icons/fa';
import './Header.css';

const Header = ({ isDarkMode, setIsDarkMode, activeLink }) => {
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', icon: FaHome, path: '/' },
    { name: 'Generate', icon: FaBrain, path: '/generate' },
    { name: 'Interview', icon: FaBrain, path: '/interview' },
    { name: 'Past Sessions', icon: FaHistory, path: '/past-sessions' },
    { name: 'Dashboard', icon: FaChartBar, path: '/dashboard' },
    { name: 'Settings', icon: FaCog, path: '/settings' }
  ];

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo" onClick={() => navigate('/')}>
          <div className="logo-icon">🚀</div>
          <span>InterviewPrep</span>
        </div>

        <nav className="nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                className={`nav-item ${activeLink === item.path ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <Icon size={16} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="header-right">
          <button
            className="theme-toggle"
            onClick={() => setIsDarkMode(!isDarkMode)}
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {isDarkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;