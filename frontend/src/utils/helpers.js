export const generateUserId = () => {
  const userId = localStorage.getItem('userId');
  if (userId) return userId;
  
  const newUserId = 'user_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('userId', newUserId);
  return newUserId;
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const calculateAverageScore = (scores) => {
  if (!scores || scores.length === 0) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
};

export const getScoreColor = (score) => {
  if (score >= 8) return '#00cc66'; // Green
  if (score >= 6) return '#ffaa00'; // Orange
  if (score >= 4) return '#ff6b00'; // Dark Orange
  return '#ff3333'; // Red
};

export const getScoreFeedback = (score) => {
  if (score >= 8) return 'Excellent';
  if (score >= 6) return 'Good';
  if (score >= 4) return 'Average';
  return 'Needs Improvement';
};

export const truncateText = (text, length = 100) => {
  if (!text) return '';
  return text.length > length ? text.substr(0, length) + '...' : text;
};

export const extractKeywords = (text) => {
  // Simple keyword extraction (can be improved)
  const words = text.toLowerCase().split(/\s+/);
  const stopwords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with']);
  return words.filter(word => word.length > 3 && !stopwords.has(word)).slice(0, 10);
};

export const downloadJSON = (data, filename) => {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2)));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    return true;
  }).catch(() => {
    return false;
  });
};
