import React, { useRef, useState } from 'react';
import html2pdf from 'html2pdf.js';
import './Dashboard.css';

const Dashboard = ({ result, onReset }) => {
  const dashboardRef = useRef(null);
  const [activePath, setActivePath] = useState('student'); // 'student' or 'university'

  if (!result) return null;

  const { 
    match_score, matched_skills, missing_skills, irrelevant_skills, 
    recommended_jobs, report, student_pathway, university_pathway,
    student_name
  } = result;

  // Determine color based on score
  let scoreColor = 'var(--danger-color)'; // red
  let scoreLabel = 'Low Compatibility';
  if (match_score >= 75) {
    scoreColor = 'var(--success-color)'; // green
    scoreLabel = 'Excellent Match';
  } else if (match_score >= 50) {
    scoreColor = '#f59e0b'; // amber/orange
    scoreLabel = 'Good Potential';
  }

  const handleDownloadPdf = async () => {
    const element = dashboardRef.current;
    if (!element) return;

    // Temporarily disable animations so html2canvas captures the completed state
    element.classList.add('pdf-export-mode');

    const opt = {
      margin:       0.5,
      filename:     'skill_gap_report.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } finally {
      // Restore animations safely after the PDF is mapped
      element.classList.remove('pdf-export-mode');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header glass-panel">
        <div className="header-info">
          <h2>Analysis Results</h2>
          <p className="student-display">Prepared for: <strong>{student_name || 'Valued Student'}</strong></p>
        </div>
        <div className="header-actions">
          <button className="btn outline-btn" onClick={handleDownloadPdf}>Download PDF 📥</button>
          <button className="btn outline-btn" onClick={onReset}>Analyze Another</button>
        </div>
      </div>

      <div className="dashboard-grid" ref={dashboardRef}>
        {/* Advanced Score Card */}
        <div className="score-card glass-panel" style={{ '--score-color': scoreColor }}>
          <h3><span className="icon">📊</span> Match Analysis</h3>
          <div className="advanced-score-container">
            <div className="glowing-ring">
              <svg viewBox="0 0 36 36" className="circular-chart advanced">
                <path className="circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path className="circle"
                  strokeDasharray={`${match_score}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="score-inner">
                <span className="percentage-text">{match_score}%</span>
              </div>
            </div>
            
            <div className="score-interpretation">
               <h4 style={{ color: scoreColor }}>{scoreLabel}</h4>
               <p className="score-detail">
                 Based on analysis of <strong>{matched_skills?.length || 0}</strong> matched and <strong>{missing_skills?.length || 0}</strong> missing skills.
               </p>
            </div>
          </div>
        </div>

        {/* Actionable Report Card */}
        <div className="report-card glass-panel">
          <h3>Personalized Report</h3>
          <p className="report-text">{report}</p>
        </div>

        {/* Skills Lists */}
        <div className="skills-card matched glass-panel">
          <h3><span className="icon">✅</span> Matched Skills</h3>
          {matched_skills && matched_skills.length > 0 ? (
            <div className="skills-tags">
              {matched_skills.map((skill, index) => (
                <span key={index} className="tag matched-tag">{skill}</span>
              ))}
            </div>
          ) : (
            <p className="empty-state">No matching skills found.</p>
          )}
        </div>

        <div className="skills-card missing glass-panel">
          <h3><span className="icon">❌</span> Missing Skills / Gaps</h3>
          {missing_skills && missing_skills.length > 0 ? (
            <div className="skills-tags">
              {missing_skills.map((skill, index) => (
                <span key={index} className="tag missing-tag">{skill}</span>
              ))}
            </div>
          ) : (
            <p className="empty-state">No missing skills! Perfect match.</p>
          )}
        </div>

        <div className="skills-card irrelevant glass-panel">
          <h3><span className="icon">⚠️</span> Irrelevant Skills</h3>
          {irrelevant_skills && irrelevant_skills.length > 0 ? (
            <div className="skills-tags">
              {irrelevant_skills.map((skill, index) => (
                <span key={index} className="tag irrelevant-tag">{skill}</span>
              ))}
            </div>
          ) : (
            <p className="empty-state">No irrelevant skills found.</p>
          )}
        </div>

        {/* Recommended Jobs */}
        <div className="skills-card jobs glass-panel">
          <h3><span className="icon">🎯</span> Recommended Roles</h3>
          {recommended_jobs && recommended_jobs.length > 0 ? (
            <div className="skills-tags">
              {recommended_jobs.map((job, index) => (
                <span key={index} className="tag job-tag">{job}</span>
              ))}
            </div>
          ) : (
            <p className="empty-state">No specific roles recommended.</p>
          )}
        </div>
      </div>

      {/* Actionable Pathways (Student vs University) */}
      {(student_pathway || university_pathway) && (
        <div className="pathway-section glass-panel">
          <div className="pathway-tabs">
            <button 
              className={`pathway-tab ${activePath === 'student' ? 'active' : ''}`}
              onClick={() => setActivePath('student')}
            >
              🎓 Student Path
            </button>
            <button 
              className={`pathway-tab ${activePath === 'university' ? 'active' : ''}`}
              onClick={() => setActivePath('university')}
            >
              🏛️ University Path
            </button>
          </div>
          <div className="pathway-content">
            {activePath === 'student' ? (
              <p className="report-text">{student_pathway || "Student pathway insights are not available for this analysis."}</p>
            ) : (
              <p className="report-text">{university_pathway || "University pathway insights are not available for this analysis."}</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
