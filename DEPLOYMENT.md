# Deployment Guide

This guide details how to deploy **InsightMatrix** to production using **Render** (Backend) and **Vercel** (Frontend).

## Part 1: Backend Deployment (Render)

We will deploy the Flask backend to Render, a free cloud hosting platform.

### Prerequisites
-   Ensure `requirements.txt` includes `gunicorn` (It has been added).
-   Ensure `app.py` is in the `backend/` folder.
-   Push your latest code to GitHub.

### Steps
1.  **Sign up/Login** to [Render](https://render.com/).
2.  Click **"New +"** -> **"Web Service"**.
3.  Connect your **GitHub repository**.
4.  Configure the service:
    -   **Name**: `insightmatrix-backend` (or distinct name)
    -   **Root Directory**: `backend` (Important!)
    -   **Runtime**: **Python 3**
    -   **Build Command**: `pip install -r requirements.txt`
    -   **Start Command**: `gunicorn app:app`
5.  **Environment Variables**:
    Scroll down to "Environment Variables" and add these keys from your `.env`:
    -   `GROQ_API_KEY`: ...
    -   `OPENAI_API_KEY`: ... (if used)
    -   `GOOGLE_API_KEY`: ... (if used)
    -   `HUGGINGFACEHUB_API_TOKEN`: ...
    -   `PYTHON_VERSION`: `3.9.0` (Recommended)
6.  Click **"Create Web Service"**.
7.  **Wait for deployment**. Once live, copy the **URL** (e.g., `https://insightmatrix-backend.onrender.com`). You will need this for the frontend.

### Verification
-   Visit `https://YOUR-BACKEND-URL.onrender.com/api/health`
-   You should see: `{"status": "ok", "message": "InsightMatrix Backend V3 Running"}`

---

## Part 2: Frontend Deployment (Vercel)

We will deploy the React frontend to Vercel.

### Preparation
1.  **Code Check**: The project uses `import.meta.env.VITE_API_URL` in `src/services/api.js`. This is already set up to accept the production URL.

### 🧠 Understanding the Connection (How it works)

When you deploy, you actally create two separate "computers" on the internet:
1.  **Frontend (Vercel)**: Holds your React code (HTML/CSS/JS).
2.  **Backend (Render)**: Holds your Python/Flask code (AI logic).

**The Problem**: The Frontend doesn't know where the Backend lives. Locally, they are both on "localhost", but online, they have different URLs.

**The Solution (`VITE_API_URL`)**: 
-   This is a special "phone number" (Environment Variable) we give to the Frontend.
-   We tell Vercel: "Hey, whenever the code asks for the backend, use *this specific URL* (e.g., `https://my-backend.onrender.com`)."
-   The code in `api.js` is written to look for this number:
    ```javascript
    // "Use the environment variable number, OR use local 5000 if none exists"
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    ```

### Steps
1.  **Sign up/Login** to [Vercel](https://vercel.com/).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your **GitHub repository**.
4.  Configure Project:
    -   **Framework Preset**: **Vite** (should detect automatically).
    -   **Root Directory**: Click "Edit" and select `frontend`.
5.  **Environment Variables**:
    -   Add `VITE_API_URL` with the value of your Render Backend URL (e.g., `https://insightmatrix-backend.onrender.com`).
    *Note: Do NOT add a trailing slash if your backend code adds `/api` manually, but our code expects the base URL. Example: `https://insightmatrix-backend.onrender.com` (no `/api` suffix here, the code appends it if needed, or if code appends `/api`, check `api.js`).*
    *Check `src/services/api.js`: it uses `... || "http://localhost:5000/api"`. This means `VITE_API_URL` should probably be `https://insightmatrix-backend.onrender.com/api` OR just the domain depending on implementation. Let's strictly follow `api.js`: `API_URL` is the base for calls. So set `VITE_API_URL` to `https://insightmatrix-backend.onrender.com/api`.*
6.  Click **"Deploy"**.

---

## Part 3: Final Checks

1.  Open your Vercel App URL.
2.  **Test CORS**:
    -   Open Developer Tools (F12) -> Network.
    -   Try to start a chat or use the interview tool.
    -   If you see CORS errors, ensure your Backend (Render) has `flask-cors` enabled (it is included in `app.py`).
3.  **Test AI**:
    -   Ensure your API Keys (Groq, etc.) are correctly set in Render.

**Success!** Your InsightMatrix application is now live.
