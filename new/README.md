# College Admission AI Chatbot

A web application that helps students apply to Amrita Vishwa Vidyapeetham (Coimbatore). Students can browse courses, check fees, submit an application, track their application status, and chat with an AI assistant that answers admission-related questions.

---

## What it does

**Course Browser** — View all available programmes like B.Tech, MBBS, MBA, and M.Tech with details on duration, fees, and curriculum.

**Fee Information** — See a clear breakdown of tuition fees, hostel charges, and available scholarships for each programme.

**Online Application** — Fill out and submit your admission form directly from the website. The system prevents duplicate submissions.

**Application Tracker** — Check your application status anytime using your email address or application ID.

**AI Chatbot** — Ask anything about admissions. The chatbot is powered by Google Gemini AI and knows the latest course and fee data. If no API key is set, it falls back to smart keyword-based responses so it always works.

**Admin Dashboard** — A PIN-protected panel where staff can view all submitted applications and mark them as Approved or Rejected. Supports CSV export.

---

## How to run it

### Requirements

- Python 3.9 or above
- Node.js 18 or above (only needed if you want to change the CSS)

### Step 1 - Clone the repository

```bash
git clone https://github.com/Roahiyaa/college_admission_ai_chatbot.git
cd college_admission_ai_chatbot/new
```

### Step 2 - Install Python dependencies

```bash
pip install -r requirements.txt
```

### Step 3 - Enable the AI chatbot (optional)

The chatbot works out of the box without any setup. If you want the full Gemini AI experience, get a free API key from https://aistudio.google.com/apikey and set it before starting the server.

On Windows (PowerShell):
```powershell
$env:GEMINI_API_KEY = "your-key-here"
```

On Mac or Linux:
```bash
export GEMINI_API_KEY="your-key-here"
```

### Step 4 - Start the server

```bash
cd backend
python app.py
```

Open your browser and go to http://localhost:5000

---

## Admin access

The admin dashboard is protected by a PIN. The default PIN is:

```
admin123
```

To change it, open `static/js/app.js` and update line 42:

```js
const ADMIN_PIN = 'your-new-pin';
```

---

## Rebuilding the CSS (only if you edit styles)

```bash
npm install
npm run build:css
```

To automatically rebuild while editing:
```bash
npm run watch:css
```

---

## API reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/admissions | Submit a new application |
| GET | /api/admissions | List all applications (admin) |
| PATCH | /api/admissions/id/status | Approve or reject an application |
| GET | /api/admissions/track?email= | Look up application by email |
| GET | /api/admissions/track?id= | Look up application by ID |
| GET | /api/courses | Get all courses |
| GET | /api/fees | Get fee structures |
| POST | /api/chat | Send a message to the chatbot |

---

## Project structure

```
new/
  backend/
    app.py        - All API routes and the AI chatbot logic
    models.py     - Database models for admissions, courses, and fees
  static/
    index.html    - The main page shell
    js/
      app.js      - Page routing and UI rendering
      chatbot.js  - Chatbot widget
      api.js      - Functions for calling the backend API
    css/
      styles.css  - Tailwind source styles
  requirements.txt
  package.json
```

---

## Tech stack

- Frontend: HTML, Vanilla JavaScript, Tailwind CSS
- Backend: Python, Flask, Flask-SQLAlchemy, Flask-CORS
- Database: SQLite (created automatically on first run)
- AI: Google Gemini 1.5 Flash with keyword fallback
