from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import groq
from PyPDF2 import PdfReader
from docx import Document
import requests
from bs4 import BeautifulSoup
import io
import json
import openai
import google.generativeai as genai
from huggingface_hub import InferenceClient

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure AI Providers
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
HUGGINGFACEHUB_API_TOKEN = os.getenv("HUGGINGFACEHUB_API_TOKEN")

# Initialize Clients
groq_client = groq.Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

if OPENAI_API_KEY:
    openai.api_key = OPENAI_API_KEY

if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

hf_client = InferenceClient(token=HUGGINGFACEHUB_API_TOKEN) if HUGGINGFACEHUB_API_TOKEN else None

def get_ai_response(prompt, provider="groq", model=None):
    """
    Fetch AI response from specified provider.
    Defaults to Groq (Llama 3) as primary free/fast model.
    """
    try:
        # 1. GROQ (Primary)
        if provider == "groq" and groq_client:
            chat_completion = groq_client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.1-8b-instant",
            )
            return chat_completion.choices[0].message.content

        # 2. OPENAI
        elif provider == "openai" and OPENAI_API_KEY:
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo", # Default to cheaper model
                messages=[{"role": "user", "content": prompt}]
            )
            return response.choices[0].message.content

        # 3. GEMINI
        elif provider == "gemini" and GOOGLE_API_KEY:
            model = genai.GenerativeModel('gemini-pro')
            response = model.generate_content(prompt)
            return response.text

        # 4. HUGGING FACE
        elif provider == "huggingface" and hf_client:
            # Using a generic instruction model
            response = hf_client.text_generation(prompt, model="mistralai/Mistral-7B-Instruct-v0.2", max_new_tokens=500)
            return response

        # FALLBACK: Try Groq if specific provider failed or not set
        if groq_client:
            print(f"Warning: Provider {provider} unavailable, falling back to Groq.")
            return get_ai_response(prompt, provider="groq")
            
        return "Error: No AI provider available. Please checks keys in .env"

    except Exception as e:
        print(f"AI Error ({provider}): {str(e)}")
        # Ultimate Fallback
        return f"AI Generation Failed: {str(e)}"

# --- Utility Functions ---

def extract_text_from_file(file):
    filename = file.filename.lower()
    text = ""
    
    if filename.endswith('.pdf'):
        pdf = PdfReader(file)
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    
    elif filename.endswith('.docx'):
        doc = Document(file)
        for para in doc.paragraphs:
            text += para.text + "\n"
            
    elif filename.endswith('.txt'):
        text = file.read().decode('utf-8')
        
    return text

def scrape_website(url):
    try:
        if not url.startswith('http'):
            url = 'https://' + url
            
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract meaningful text
        for script in soup(["script", "style"]):
            script.decompose()
            
        text = soup.get_text()
        return " ".join(text.split())
    except Exception as e:
        return f"Error scraping website: {str(e)}"

# --- API Routes ---

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "InsightMatrix Backend V3 Running"})

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        text = extract_text_from_file(file)
        
        # Auto-summarize
        summary_prompt = f"Summarize the following document content into key points:\n\n{text[:10000]}"
        summary = get_ai_response(summary_prompt)
        
        return jsonify({
            "filename": file.filename,
            "text": text,
            "summary": summary
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/analyze-url', methods=['POST'])
def analyze_url():
    data = request.json
    urls = data.get('urls', [])
    if not urls and data.get('url'):
        urls = [data.get('url')]
        
    if not urls:
        return jsonify({"error": "URLs required"}), 400

    try:
        combined_content = ""
        for url in urls:
            content = scrape_website(url)
            combined_content += f"\n\n--- Source: {url} ---\n{content}"

        summary_prompt = f"Summarize the content from these websites:\n\n{combined_content[:20000]}"
        summary = get_ai_response(summary_prompt)
        
        return jsonify({
            "urls": urls,
            "content": combined_content,
            "summary": summary
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    print("Chat endpoint hit") # Debug logging
    data = request.json
    context = data.get('context', '')
    question = data.get('question', '')
    
    if not question:
        return jsonify({"error": "Question required"}), 400

    prompt = f"""
    Context:
    {context[:30000]}
    
    Question: {question}
    
    Answer locally based on context if possible, otherwise use general knowledge but mention if it's not in the context.
    """
    answer = get_ai_response(prompt)
    return jsonify({"answer": answer})

@app.route('/api/news/trending', methods=['GET'])
def get_trending_news():
    try:
        # V3 Requirement: Fetch EXACTLY 3 items
        prompt = """
        Generate 3 distinct, realistic, trending tech news headlines for today.
        Focus on: 1. AI Innovation, 2. Web Technologies, 3. Cybersecurity.
        Return ONLY a JSON list of objects with keys: "title", "source", "date" (e.g. '2 hrs ago'), "url" (make up a realistic looking url), "summary" (1 short sentence).
        Example: [{"title": "New AI Model Released", "source": "TechCrunch", "date": "1 hr ago", "url": "https://techcrunch.com/ai-model", "summary": "Faster model..."}]
        """
        response = get_ai_response(prompt)
        
        # Clean response to ensure valid JSON
        cleaned_response = response.replace('```json', '').replace('```', '').strip()
        headlines = json.loads(cleaned_response)
        
        # Ensure exactly 3 items
        return jsonify(headlines[:3])
    except Exception as e:
        # Fallback
        return jsonify([
            {"title": "AI Revolutionizes Health Care (Fallback)", "source": "Nature", "date": "1 hr ago", "url": "https://nature.com/ai", "summary": "AI tools detect diseases earlier than ever."},
            {"title": "Quantum Computing Breakthrough", "source": "ScienceDaily", "date": "3 hrs ago", "url": "https://sciencedaily.com/quantum", "summary": "New stable qubit state discovered."},
            {"title": "Web Assembly 2.0 Launched", "source": "W3C", "date": "5 hrs ago", "url": "https://w3.org/wasm", "summary": "Performance boost for web apps."}
        ])

# --- V3 CONTINUOUS INTERVIEW ENDPOINTS ---

@app.route('/api/interview/start', methods=['POST'])
def start_interview():
    """Starts the interview session, generates the first question."""
    data = request.json
    resume_text = data.get('resume_text', '')
    
    prompt = f"""
    You are an expert interviewer. Start a continuous interview based on this resume.
    Ask the FIRST question to break the ice or ask about their introduction.
    Keep it professional but welcoming.
    RESUME: {resume_text[:2000]}
    
    Return ONLY the question text.
    """
    question = get_ai_response(prompt)
    return jsonify({"question": question, "status": "active"})

@app.route('/api/interview/next_question', methods=['POST'])
def next_question():
    """Generates the next question based on chat history."""
    data = request.json
    history = data.get('history', [])  # List of {role: 'user'/'ai', content: '...'}
    resume_text = data.get('resume_text', '')
    
    # Construct conversation string
    conversation_str = ""
    for msg in history[-6:]: # Keep last few turns for context
        role = "Interviewer" if msg['role'] == 'ai' else "Candidate"
        conversation_str += f"{role}: {msg['content']}\n"
    
    prompt = f"""
    You are an expert interviewer conducting a technical and behavioral interview.
    Current Context:
    RESUME: {resume_text[:1000]}
    
    Recent Conversation:
    {conversation_str}
    
    Generate the NEXT question. Dig deeper if the previous answer was vague, or move to a new relevant topic (Technical, Situational, Soft Skills).
    Keep the question concise and clear.
    Return ONLY the question text.
    """
    question = get_ai_response(prompt)
    return jsonify({"question": question, "status": "active"})

@app.route('/api/interview/feedback', methods=['POST'])
def interview_feedback():
    """Generates final ATS Score and feedback."""
    data = request.json
    history = data.get('history', [])
    resume_text = data.get('resume_text', '')
    
    conversation_str = ""
    for msg in history:
        role = "Interviewer" if msg['role'] == 'ai' else "Candidate"
        conversation_str += f"{role}: {msg['content']}\n"
        
    prompt = f"""
    Evaluate this interview performance.
    RESUME: {resume_text[:1000]}
    TRANSCRIPT:
    {conversation_str}
    
    Return ONLY a JSON object with this EXACT structure:
    {{
        "ats_score": <integer 0-100 based on keyword match and answer quality>,
        "recommended_roles": [<list of 3 suitable job titles>],
        "key_improvements": [<list of 3 specific actionable tips to improve>],
        "summary": "<Short paragraph summarizing the candidate's performance>"
    }}
    """
    try:
        response = get_ai_response(prompt)
        cleaned_response = response.replace('```json', '').replace('```', '').strip()
        feedback_json = json.loads(cleaned_response)
        return jsonify(feedback_json)
    except Exception as e:
        return jsonify({
            "ats_score": "70",
            "recommended_roles": ["Software Developer", "Analyst", "QA Engineer"],
            "key_improvements": ["Provide more specific examples", "Speak with more confidence", "Highlight technical skills better"],
            "summary": f"Could not generate detailed analysis due to error: {str(e)}. However, based on general patterns, focus on clarity."
        })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
