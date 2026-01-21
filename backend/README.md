# InsightMatrix Backend

This is the backend service for InsightMatrix, built with Flask. It handles AI model integration, file processing, and data analysis.

## Features

-   **Multi-Model AI Support**: Integrates OpenAI, Groq (Llama 3), Google Gemini, and Hugging Face.
-   **File Processing**: Extracts text from PDFs, DOCX, and TXT files.
-   **URL Analysis**: Scrapes and summarizes content from websites.
-   **Continuous Interview**: Manages endless mock interview sessions with context memory.
-   **News Feed**: Fetches trending tech news using AI.

## Setup

1.  **Navigate to backend directory**:
    ```bash
    cd backend
    ```

2.  **Create virtual environment**:
    ```bash
    python -m venv venv
    source venv/bin/activate  # Windows: venv\Scripts\activate
    ```

3.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Environment**:
    Create a `.env` file in the `backend` folder with your API keys:
    ```env
    GROQ_API_KEY=your_key
    OPENAI_API_KEY=your_key
    GOOGLE_API_KEY=your_key
    HUGGINGFACEHUB_API_TOKEN=your_key
    ```

5.  **Run Server**:
    ```bash
    python app.py
    ```
    Server runs on `http://localhost:5000`.

## API Documentation

### General
-   `GET /api/health`: Check server status.

### File & URL Processing
-   `POST /api/upload`: Upload a file (PDF, DOCX, TXT) for summarization.
    -   **Body**: `form-data` with `file`.
-   `POST /api/analyze-url`: Scrape and summarize a list of URLs.
    -   **Body**: `{"urls": ["http://..."]}`

### Chat & Q&A
-   `POST /api/chat`: Ask questions based on provided context.
    -   **Body**: `{"question": "...", "context": "..."}`

### Interview Tool
-   `POST /api/interview/start`: Start a new session.
    -   **Body**: `{"resume_text": "..."}`
-   `POST /api/interview/next_question`: Get the next question in the loop.
    -   **Body**: `{"history": [...], "resume_text": "..."}`
-   `POST /api/interview/feedback`: End interview and get ATS score.
    -   **Body**: `{"history": [...], "resume_text": "..."}`

### News Tool
-   `GET /api/news/trending`: Get 3 trending tech news headlines.
