import os
import json
import PyPDF2
from google import genai

def extract_text_from_pdf(pdf_file):
    reader = PyPDF2.PdfReader(pdf_file)
    text = ""
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted
    return text

def extract_text_from_docx(docx_file):
    import docx
    doc = docx.Document(docx_file)
    text = []
    for paragraph in doc.paragraphs:
        text.append(paragraph.text)
    return '\n'.join(text)

def extract_text_from_txt(txt_file):
    return txt_file.read().decode('utf-8', errors='ignore')

def extract_text(file):
    filename = file.filename.lower()
    if filename.endswith('.pdf'):
        return extract_text_from_pdf(file)
    elif filename.endswith('.docx'):
        return extract_text_from_docx(file)
    elif filename.endswith('.txt'):
        return extract_text_from_txt(file)
    else:
        raise ValueError(f"Unsupported file format: {filename}")

def analyze_syllabus(syllabus_file, job_description, student_name):
    # Extract text based on file type
    syllabus_text = extract_text(syllabus_file)
    
    # Initialize Google GenAI client
    # By default it will look for the GEMINI_API_KEY environment variable.
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise Exception("GEMINI_API_KEY environment variable is not set. Please set it in your backend environment.")

    client = genai.Client(api_key=api_key)
    
    prompt = f"""
    You are an expert technical recruiter and career coach.
    You have been provided with a candidate's course syllabus and a target job description.
    The student's name is {student_name}. 
    Perform a gap analysis between the syllabus's skills/topics and the job description's requirements.

    Job Description:
    {job_description}

    Course Syllabus Text:
    {syllabus_text}

    Please return ONLY a valid JSON object with the following structure:
    {{
        "student_name": "{student_name}",
        "match_score": <integer from 0 to 100 representing how well the syllabus matches the JD>,
        "matched_skills": ["skill1", "skill2", ...],
        "missing_skills": ["skill1", "skill2", ...],
        "irrelevant_skills": ["skill1", "skill2", ...],
        "recommended_jobs": ["Job Title 1", "Job Title 2", ...],
        "report": "A personalized paragraph providing actionable advice on how the curriculum can bridge the skill gaps for the target role.",
        "student_pathway": "A detailed paragraph explaining what the student learned from this syllabus and what specific skills they must learn in the future to qualify for this job.",
        "university_pathway": "A detailed paragraph recommending specific skills, tools, or topics the university should integrate into this syllabus to better prepare future students for this job."
    }}
    NOTE: 'irrelevant_skills' should be a list of skills/topics found in the syllabus that are NOT useful or relevant for the target job description.
    NOTE: 'recommended_jobs' should be a list of up to 5 job titles or roles that the candidate is well-suited for based on their syllabus.
    Make sure the response is valid JSON, do not include markdown blocks like ```json ... ```. 
    Just output the raw JSON string.
    """

    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
    )

    result_text = response.text.strip()
    # Strip out any potential markdown blocks if the model outputs them anyway
    if result_text.startswith("```json"):
        result_text = result_text[7:]
    if result_text.startswith("```"):
        result_text = result_text[3:]
    if result_text.endswith("```"):
        result_text = result_text[:-3]
    
    result_text = result_text.strip()

    try:
        data = json.loads(result_text)
        return data
    except json.JSONDecodeError:
        print("Failed to decode JSON. Raw response from LLM:", response.text)
        raise Exception("Failed to parse the AI response. It may not be correctly formatted JSON.")


# Backward-compatible alias (older code paths call this "resume").
def analyze_resume(syllabus_file, job_description, student_name="Student"):
    return analyze_syllabus(syllabus_file, job_description, student_name)
