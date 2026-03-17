import React, { useState, useEffect } from 'react';
import UploadForm from './components/UploadForm';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  
  const [theme, setTheme] = useState(() => {
    // Check local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark'; // Default to dark
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleAnalyze = async (file, jobDescription, studentName) => {
    setLoading(true);
    setError('');
    
    // Create form data
    const formData = new FormData();
    formData.append('syllabus', file);
    formData.append('job_description', jobDescription);
    formData.append('student_name', studentName);

    try {
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to analyze syllabus');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Analysis Error:", err);
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError('');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-top">
           <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
             {theme === 'dark' ? '☀️' : '🌙'}
           </button>
        </div>
        <h1>Skill Gap Analyzer <span className="badge">AI Powered</span></h1>
        <p>Align your syllabus with real job requirements.</p>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-banner glass-panel">
            <span>⚠️</span> {error}
          </div>
        )}

        {loading ? (
          <div className="loader-container glass-panel">
            <div className="spinner"></div>
            <p className="loading-text">Our AI is analyzing your syllabus...</p>
            <div className="loading-progress">
              <div className="progress-bar"></div>
            </div>
          </div>
        ) : !result ? (
          <UploadForm onAnalyze={handleAnalyze} />
        ) : (
          <Dashboard result={result} onReset={handleReset} />
        )}
      </main>
    </div>
  );
}

export default App;
