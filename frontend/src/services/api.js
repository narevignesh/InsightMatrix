const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Uploads a file (PDF/DOCX/TXT) to the backend for extraction and summarization.
 * @param {File} file 
 * @returns {Promise<Object>} { filename, text, summary }
 */
export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('File upload failed');
    }
    return response.json();
};

/**
 * Sends a URL or list of URLs to the backend for scraping and analysis.
 * @param {string|string[]} urls - Single URL string or array of URL strings
 * @returns {Promise<Object>} { urls, content, summary }
 */
export const analyzeUrl = async (urls) => {
    // Ensure we send a list if a single string is passed (backward compat)
    const payload = Array.isArray(urls) ? { urls } : { url: urls };

    const response = await fetch(`${API_URL}/analyze-url`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error('URL analysis failed');
    }
    return response.json();
};

/**
 * Sends a chat message with context to the backend.
 * @param {string} context 
 * @param {string} question 
 * @returns {Promise<string>} Answer
 */
export const askQuestion = async (context, question) => {
    const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ context, question }),
    });

    if (!response.ok) {
        throw new Error('Chat request failed');
    }
    const data = await response.json();
    return data.answer;
};

/**
 * Starts a new continuous interview session.
 * @param {string} resumeText
 * @returns {Promise<Object>} { question, status }
 */
export const startInterviewSession = async (resumeText) => {
    const response = await fetch(`${API_URL}/interview/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text: resumeText }),
    });
    if (!response.ok) throw new Error('Failed to start interview');
    return response.json();
};

/**
 * Gets the next question in a continuous interview.
 * @param {Array} history - List of {role, content}
 * @param {string} resumeText
 * @returns {Promise<Object>} { question, status }
 */
export const getNextInterviewQuestion = async (history, resumeText) => {
    const response = await fetch(`${API_URL}/interview/next_question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history, resume_text: resumeText }),
    });
    if (!response.ok) throw new Error('Failed to get next question');
    return response.json();
};

/**
 * Generates interview feedback based on full history.
 * @param {string} resumeText
 * @param {Array} history
 * @returns {Promise<Object>} Feedback object with ATS score
 */
export const getInterviewFeedback = async (resumeText, history) => {
    const response = await fetch(`${API_URL}/interview/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text: resumeText, history }),
    });

    if (!response.ok) {
        throw new Error('Failed to get feedback');
    }
    return response.json();
};

/**
 * Fetches trending AI/Tech news from the backend.
 * @returns {Promise<Array>} List of news objects
 */
export const getTrendingNews = async () => {
    const response = await fetch(`${API_URL}/news/trending`);
    if (!response.ok) {
        throw new Error('Failed to get trending news');
    }
    return response.json();
};
