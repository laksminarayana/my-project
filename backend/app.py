from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from services.ai_service import analyze_resume

load_dotenv()

app = Flask(__name__)
# Allow CORS for the React frontend
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.route('/api/analyze', methods=['POST'])
def analyze():
    # Accept multiple field names for compatibility:
    # - syllabus: curriculum document (current)
    # - document: generic document (older frontend)
    # - resume: legacy
    uploaded_file = (
        request.files.get('syllabus')
        or request.files.get('document')
        or request.files.get('resume')
    )
    if not uploaded_file:
        return jsonify({"error": "No syllabus file provided"}), 400
    
    job_description = request.form.get('job_description')
    if not job_description:
        return jsonify({"error": "No job description provided"}), 400
    
    student_name = request.form.get('student_name', 'Student')
    
    if uploaded_file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    allowed_extensions = {'.pdf', '.docx', '.txt'}
    
    if uploaded_file and any(uploaded_file.filename.lower().endswith(ext) for ext in allowed_extensions):
        try:
            # Perform AI Analysis
            result = analyze_resume(uploaded_file, job_description, student_name)
            return jsonify(result), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "File must be a PDF, DOCX, or TXT"}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
