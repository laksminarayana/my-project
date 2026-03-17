import React, { useState, useRef } from 'react';
import './UploadForm.css';

const UploadForm = ({ onAnalyze }) => {
  const [file, setFile] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const validExtensions = ['.pdf', '.docx', '.txt'];
    
    // Check type or extension (for some OS drag-drop quirks)
    if (validTypes.includes(selectedFile.type) || validExtensions.some(ext => selectedFile.name.toLowerCase().endsWith(ext))) {
      setFile(selectedFile);
    } else {
      alert("Please upload a PDF, DOCX, or TXT file.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please provide a syllabus (PDF, DOCX, or TXT).");
      return;
    }
    if (!jobDescription.trim()) {
      alert("Please provide a job description.");
      return;
    }
    if (!studentName.trim()) {
      alert("Please provide the student name.");
      return;
    }
    onAnalyze(file, jobDescription, studentName);
  };

  return (
    <div className="upload-container glass-panel">
      <h2>Analyze Your Fit</h2>
      <p className="subtitle">Upload your syllabus and the target job description to get started.</p>
      
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label>Student Name</label>
          <input 
            type="text"
            placeholder="Enter student name..."
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="name-input"
          />
        </div>
        <div className="form-group">
          <label>Target Job Description</label>
          <textarea 
            placeholder="Paste the job requirements and description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={5}
          />
        </div>

        <div className="form-group">
          <label>Your Syllabus (PDF, DOCX, TXT)</label>
          <div 
            className={`drop-zone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <input 
              type="file" 
              accept=".pdf,.docx,.txt" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              hidden 
            />
            {file ? (
              <div className="file-info">
                <span className="file-icon">📄</span>
                <span className="file-name">{file.name}</span>
                <span className="change-file">Click or drag to change</span>
              </div>
            ) : (
              <div className="drop-prompt">
                <span className="upload-icon">☁️</span>
                <span>Drag & drop your syllabus here or click to browse</span>
                <span className="supported-formats">Supported formats: PDF, DOCX, TXT</span>
              </div>
            )}
          </div>
        </div>

        <button type="submit" className="btn submit-btn" disabled={!file || !jobDescription.trim()}>
          Analyze Match ✨
        </button>
      </form>
    </div>
  );
};

export default UploadForm;
