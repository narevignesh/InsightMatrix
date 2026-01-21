# InsightMatrix Frontend

The frontend for InsightMatrix, built with React, Vite, and modern CSS.

## Features

-   **Modern UI**: Glassmorphism design, professional fonts (Share Tech, Saira), and dynamic backgrounds.
-   **Tools**:
    -   **Insights Hub**: Central dashboard for all tools.
    -   **Mock Interview**: Continuous AI interview with real-time feedback and ATS scoring.
    -   **Tech News**: AI-curated trending news feed.
    -   **Document Analyzer**: Upload and query documents.
-   **Privacy Focused**: Session-based data handling (no login required).

## Setup

1.  **Navigate to frontend directory**:
    ```bash
    cd frontend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    App runs on `http://localhost:5173`.

## Structure

-   `src/components/`: Reusable UI components.
-   `src/components/Insights/`: Feature-specific tools (Interview, News, Documents).
-   `src/components/Layout/`: Navbar and shared layout elements.
-   `src/index.css`: Global styles, variables, and typography.
