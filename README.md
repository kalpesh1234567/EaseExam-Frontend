# EasyExam Frontend (React)
Production Automated Answer Sheet Evaluation System Frontend.

Built with **React**, **Vite**, and **React Router**, and features a custom premium Dark Mode Glassmorphism UI.

## Features
- **Student Portal**: Secure dashboard to view enrolled exams, upload PDF/Image answer sheets, and view AI-evaluated scorecards.
- **Teacher Portal**: Secure dashboard to create exams, input solution keys, track class completion, and download CSV/PDF grading reports.
- **Role-Based Routing**: Cleanly separates Student and Teacher workflows using JWT-based Context.
- **Direct API Integration**: Connects to the Express & Gemini AI Evaluation engine backend.

## Local Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
The React App will be accessible at `http://localhost:5173`.
