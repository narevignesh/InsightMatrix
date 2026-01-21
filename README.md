# InsightMatrix

**InsightMatrix** is an open AI platform designed for students and professionals. It provides essential tools for learning, interview preparation, and news understanding in a single, privacy-focused environment.

## Overview

-   **Simple**: No complex setup or accounts needed.
-   **Private**: No database, no long-term tracking. Everything is session-based.
-   **Powerful**: Powered by multiple AI models (Groq, OpenAI, Gemini).

## Project Structure

This project is organized into a separate Frontend and Backend:

-   **`/frontend`**: React + Vite application (UI).
-   **`/backend`**: Flask + Python application (AI processing).

## Quick Start

### Prerequisites
-   Node.js & npm
-   Python 3.8+

### 1. Start Backend
```bash
cd backend
# Create/Activate functionality (see backend/README.md)
python app.py
```

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to start using the app.

## Key Features

1.  **AI Mock Interview**: Unlimited continuous questions with final ATS feedback.
2.  **Smart Document Analysis**: Chat with your PDFs and docs.
3.  **Tech News**: Stay updated with AI-curated headlines.
4.  **Web Analysis**: Summarize content from any URL.
