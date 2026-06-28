# Nexus AI

A responsive, React-based AI chat application powered by the Gemini API. It features dynamic AI personas, a sleek dark-mode UI, and a dedicated backend for secure API handling.

## Features
* **AI Personas:** Switch between General AI, Code Mentor, and Mock Interviewer roles.
* **Responsive UI:** Fully mobile-responsive design with an off-canvas sidebar toggle.
* **Modern Interface:** Dark mode default, rounded pill designs, and smooth scroll behavior.
* **Secure API Handling:** Node.js backend to protect the Gemini API key.

## Tech Stack
* **Frontend:** React 19, Vite, plain CSS.
* **Backend:** Node.js, Express, CORS, dotenv.
* **AI Model:** Google Gemini 1.5 Flash.

## Setup Instructions

### 1. Backend Setup
1. Open a terminal and navigate to the directory containing `server.js`.
2. Install dependencies:
   ```bash
   npm install express cors dotenv