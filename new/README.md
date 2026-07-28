# 🎓 Admiss Clarity Bot — Greenfield University

An AI-powered university admission portal with a chatbot, online application form, fee structure, and admin dashboard.

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.9+**
- **Node.js 18+** (for Tailwind CSS build)

---

### 1. Install Python Dependencies

```bash
cd c:\Users\roahi\OneDrive\Desktop\new
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

---

### 2. Build Tailwind CSS

Run this once to compile CSS, or use `watch:css` during development:

```bash
npm install
npm run build:css
```

**For development (auto-rebuild on CSS changes):**
```bash
npm run watch:css
```

---

### 3. Run the Flask Backend

```bash
cd backend
python app.py
```

The app will be available at **http://localhost:5000/**

Flask serves the frontend automatically — no separate web server needed.

---

## 📁 Project Structure

```
├── backend/
│   ├── app.py          ← Flask API + static file server
│   └── models.py       ← SQLAlchemy database models
├── static/
│   ├── index.html      ← Main HTML shell
│   ├── css/
│   │   └── styles.css  ← Tailwind source (edit this)
│   ├── js/
│   │   ├── api.js      ← All backend API calls
│   │   ├── app.js      ← Page logic & UI rendering
│   │   └── chatbot.js  ← Chatbot functionality
│   └── dist/
│       └── styles.css  ← Compiled Tailwind (auto-generated)
├── package.json
├── requirements.txt
└── tailwind.config.js
```

---

## 🔑 Admin Dashboard

The admin dashboard is protected by a PIN.

> **Default PIN:** `admin123`

To change the PIN, edit line 19 in [static/js/app.js](static/js/app.js):
```js
const ADMIN_PIN = 'your-new-pin';
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admissions` | Submit an application |
| `GET` | `/api/admissions` | List all applications (admin) |
| `PATCH` | `/api/admissions/<id>/status` | Update application status |
| `GET` | `/api/admissions/track?email=` | Track application by email |
| `GET` | `/api/admissions/track?id=` | Track application by ID |
| `GET` | `/api/courses` | List all courses |
| `GET` | `/api/fees` | List fee structure |
| `POST` | `/api/chat` | Chatbot message |

---

## ✨ Features

- 🏠 **Home** — Stats, feature cards, hero section
- 🎓 **Courses** — Dynamic course grid from database
- 💰 **Fees** — Fee table with scholarship info
- 📅 **Dates** — Fall 2026 & Spring 2027 deadlines
- 🔍 **Track Application** — Check status by email or ID
- 📋 **Apply** — Online admission form with validation
- 🔐 **Admin Dashboard** — PIN-protected, paginated, with CSV export
- 💬 **Chatbot** — Keyword-based with local fallback

---

## 🛠️ Tech Stack

- **Frontend:** HTML, Vanilla JS, Tailwind CSS
- **Backend:** Python, Flask, Flask-CORS, Flask-SQLAlchemy
- **Database:** SQLite (auto-created on first run)
