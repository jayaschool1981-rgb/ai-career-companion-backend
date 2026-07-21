# 🚀 AI Career Companion — Enterprise Backend API

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v20-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5-blue.svg)](https://expressjs.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

An enterprise-grade RESTful AI backend engine powering the **AI Career Companion Platform**. Processes student & professional resumes, extracts core skills using Natural Language Processing (NLP), and generates actionable career guidance using a **Multi-Provider AI Resilience Engine**.

---

## 💡 What Problem Does This Product Solve?

Job seekers and graduating students often fail ATS (Applicant Tracking Systems) resume scanners due to missing keywords, poor formatting, or unaligned skill presentation. This backend API automatically:
1. Parses PDF and text resumes with high precision.
2. Extracts ATS skill match indexes and keyword gap recommendations.
3. Generates personalized 5-year career timelines and target certifications using AI.

---

## 🛡️ Enterprise Safeguards & Security

- **💓 MongoDB Keep-Alive Heartbeat**: Automated 3-minute heartbeat ping to prevent cloud database inactivity timeouts.
- **🤖 Multi-Provider AI Fallback**: Automatic fallback circuit (OpenRouter ➔ Google Gemini ➔ High-Availability Analysis Engine).
- **🔒 OWASP Security**: Hardened with `helmet` HTTP headers, rate limiting (100 req/15min), Zod environment validation, and CORS whitelist authorization.

---

## 🚀 Quick Start (Local Setup)

```bash
# Clone the repository
git clone https://github.com/jayaschool1981-rgb/AI-Career-Companion-Backend.git
cd AI-Career-Companion-Backend

# Setup environment variables
cp .env.example .env

# Install dependencies
npm install

# Start development server (Port 5000)
npm run dev
```

---

## 🐳 Docker Deployment

```bash
# Build Docker image
docker build -t ai-career-backend .

# Run container
docker run -p 5000:5000 --env-file .env ai-career-backend
```

---

## 📊 API Specification

### `POST /api/analyze` — Analyze Resume & Generate Career Roadmap
- Accepts `multipart/form-data` with `file` (PDF/Text) or JSON body `{ text, industry, gradYear }`.
- Returns ATS score (0-100), recommended career pathway, skill gap matrix, and career timeline.

### `GET /api/status` — System & Database Health Check

---

## 📜 License

Distributed under the MIT License.
