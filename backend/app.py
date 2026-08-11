from datetime import datetime
import os
import re
import functools

from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import sys

# Load .env if present (python-dotenv)
try:
    from dotenv import load_dotenv
    _env_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), '.env')
    load_dotenv(_env_path)
except ImportError:
    pass

# Ensure the backend directory is always on sys.path so both direct
# execution and package imports resolve correctly.
_backend_dir = os.path.abspath(os.path.dirname(__file__))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from models import db, Admission, Course, FeeStructure

BASE_DIR   = os.path.abspath(os.path.dirname(__file__))
STATIC_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', 'static'))

app = Flask(__name__, static_folder=STATIC_DIR, static_url_path='')
CORS(app, supports_credentials=True)  # type: ignore[arg-type]

app.config['SQLALCHEMY_DATABASE_URI']    = f'sqlite:///{os.path.join(BASE_DIR, "database.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY']                 = os.environ.get('SECRET_KEY', 'dev-secret-change-me')
app.config['SESSION_COOKIE_SAMESITE']    = 'Lax'
app.config['SESSION_COOKIE_HTTPONLY']    = True

db.init_app(app)

# ── Rate Limiter ───────────────────────────────────────────────────────────────
# Tests set app.config['RATELIMIT_ENABLED'] = False before importing app to
# disable limits in test runs. In production this defaults to True.
limiter = Limiter(
    key_func=get_remote_address,
    app=app,
    default_limits=[]
)

# ── Gemini LLM setup ───────────────────────────────────────────────────────────
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
_gemini_model  = None

def _get_gemini_model():
    """Lazily initialise the Gemini model (so app starts even without a key)."""
    global _gemini_model
    if _gemini_model is not None:
        return _gemini_model
    if not GEMINI_API_KEY:
        return None
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        _gemini_model = genai.GenerativeModel('gemini-1.5-flash')
        return _gemini_model
    except Exception:
        return None

def _build_system_prompt() -> str:
    """Build a rich system prompt with live DB context injected."""
    try:
        courses = Course.query.all()
        fees    = FeeStructure.query.all()

        course_text = "\n".join(
            f"- {c.title} ({c.department}): {c.duration}, {c.tuition_fee}/year — {c.description}"
            for c in courses
        )
        fee_text = "\n".join(
            f"- {f.program}: Tuition {f.tuition_per_year}/year | Hostel {f.hostel_fee} | Others {f.other_fees} | Scholarships: {f.scholarship_info}"
            for f in fees
        )
    except Exception:
        course_text = "(course data unavailable)"
        fee_text    = "(fee data unavailable)"

    return f"""You are the official AI Admissions Assistant for Amrita Vishwa Vidyapeetham, Coimbatore Campus.
Respond in a helpful, friendly, and professional tone. Keep answers concise (2-5 sentences unless a list is needed).
Only answer questions related to Amrita Coimbatore admissions, courses, fees, scholarships, eligibility, campus life, placements, or related topics.
If asked something unrelated, politely redirect the conversation back to admissions.

=== AVAILABLE PROGRAMMES ===
{course_text}

=== FEE STRUCTURE ===
{fee_text}

=== KEY FACTS ===
- Entrance exams accepted: AEEE (Amrita's own exam) and JEE Main for B.Tech; NEET for MBBS; CAT/MAT/XAT for MBA
- AEEE 2026: Phase 1 (Jan–Feb 2026), Phase 2 (April 2026)
- B.Tech eligibility: 10+2 with min. 60% in Physics, Chemistry & Mathematics
- MBBS eligibility: NEET qualification is mandatory
- MBA eligibility: Valid CAT/MAT/XAT score required
- Vidyamritam Scholarship: up to 100% tuition fee waiver based on AEEE/JEE Main rank
- Hostel: ₹80,000–₹1,20,000/year (AC and non-AC options for boys and girls)
- Placements: 5000+ offers/year, avg. ₹7–8 LPA; top recruiters include Amazon, Google, Microsoft, TCS
- NAAC A++ accredited | NIRF Top 10 Engineering
- Campus: Amritanagar, Coimbatore – 641112 (400+ acres)
- Contact: admissions@amrita.edu | 0422-2685000 | Mon–Sat 9 AM – 5 PM
- NRI/OCI seats available; need TOEFL (min 80) or IELTS (min 6.5); contact nri.admissions@amrita.edu
- Lateral entry (B.Tech 3rd sem) for diploma holders with min. 60% aggregate
- Required documents: 10th & 12th marksheets, AEEE/JEE rank card, transfer cert, character cert, Aadhaar, passport photos

Always end with an offer to help further or suggest the user visit amrita.edu or call 0422-2685000 for complex queries.
"""


# ── Admin Auth ─────────────────────────────────────────────────────────────────
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')

def require_admin(f):
    """Decorator that returns 401 if the admin session is not set."""
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('is_admin'):
            return jsonify({'error': 'Unauthorised. Please log in as admin.'}), 401
        return f(*args, **kwargs)
    return decorated


# ── Database Seed ──────────────────────────────────────────────────────────────
def seed_database():
    """Seed initial courses and fee structure if tables are empty."""
    if Course.query.count() == 0:
        courses = [
            Course(
                title="B.Tech Computer Science & Engineering",
                department="School of Engineering",
                duration="4 years",
                tuition_fee="₹2,10,000/year",
                description="Core CS fundamentals including Data Structures, Algorithms, DBMS, OS, Computer Networks, and Software Engineering."
            ),
            Course(
                title="B.Tech CSE – Artificial Intelligence & Machine Learning",
                department="School of Engineering",
                duration="4 years",
                tuition_fee="₹2,10,000/year",
                description="Specialised program in AI, Deep Learning, NLP, Computer Vision, and Reinforcement Learning."
            ),
            Course(
                title="B.Tech CSE – Cybersecurity",
                department="School of Engineering",
                duration="4 years",
                tuition_fee="₹2,10,000/year",
                description="Network Security, Ethical Hacking, Cryptography, Digital Forensics, and Secure Systems Design."
            ),
            Course(
                title="B.Tech Electronics & Communication Engineering",
                department="School of Engineering",
                duration="4 years",
                tuition_fee="₹1,85,000/year",
                description="VLSI Design, Embedded Systems, Signal Processing, Wireless Communication, and IoT."
            ),
            Course(
                title="B.Tech Mechanical Engineering",
                department="School of Engineering",
                duration="4 years",
                tuition_fee="₹1,85,000/year",
                description="Thermodynamics, Fluid Mechanics, Manufacturing Technology, CAD/CAM, and Robotics."
            ),
            Course(
                title="B.Tech Civil Engineering",
                department="School of Engineering",
                duration="4 years",
                tuition_fee="₹1,75,000/year",
                description="Structural Engineering, Environmental Engineering, Transportation, Geotechnical, and Construction Management."
            ),
            Course(
                title="M.Tech (Various Specialisations)",
                department="School of Engineering",
                duration="2 years",
                tuition_fee="₹1,40,000/year",
                description="Post-graduate engineering programmes in CSE, ECE, Mechanical, and other specialisations."
            ),
            Course(
                title="MBA",
                department="Amrita School of Business",
                duration="2 years",
                tuition_fee="₹2,50,000/year",
                description="Finance, Marketing, Human Resources, Operations, and Business Analytics tracks."
            ),
            Course(
                title="MBBS",
                department="Amrita Institute of Medical Sciences",
                duration="5.5 years",
                tuition_fee="₹12,00,000/year",
                description="Full medical degree with clinical training at Amrita Hospital, one of India's top 10 hospitals."
            ),
        ]
        db.session.bulk_save_objects(courses)

    if FeeStructure.query.count() == 0:
        fees = [
            FeeStructure(
                program="B.Tech CSE / AI-ML / Cybersecurity",
                tuition_per_year="₹2,10,000",
                hostel_fee="₹80,000 – ₹1,20,000/year",
                other_fees="₹15,000 (Exam) + ₹5,000 (Library)",
                scholarship_info="Vidyamritam Scholarship: up to 100% fee waiver based on AEEE / JEE rank"
            ),
            FeeStructure(
                program="B.Tech ECE",
                tuition_per_year="₹1,85,000",
                hostel_fee="₹80,000 – ₹1,20,000/year",
                other_fees="₹15,000 (Exam) + ₹5,000 (Library)",
                scholarship_info="Vidyamritam Scholarship: up to 100% fee waiver based on AEEE / JEE rank"
            ),
            FeeStructure(
                program="B.Tech Mechanical Engineering",
                tuition_per_year="₹1,85,000",
                hostel_fee="₹80,000 – ₹1,20,000/year",
                other_fees="₹15,000 (Exam) + ₹5,000 (Library)",
                scholarship_info="Merit-based and need-based scholarships available"
            ),
            FeeStructure(
                program="B.Tech Civil Engineering",
                tuition_per_year="₹1,75,000",
                hostel_fee="₹80,000 – ₹1,20,000/year",
                other_fees="₹15,000 (Exam) + ₹5,000 (Library)",
                scholarship_info="Merit-based and need-based scholarships available"
            ),
            FeeStructure(
                program="M.Tech",
                tuition_per_year="₹1,40,000",
                hostel_fee="₹80,000 – ₹1,20,000/year",
                other_fees="₹10,000 (Exam) + ₹5,000 (Library)",
                scholarship_info="GATE-qualified students eligible for AICTE stipend of ₹12,400/month"
            ),
            FeeStructure(
                program="MBA",
                tuition_per_year="₹2,50,000",
                hostel_fee="₹80,000 – ₹1,20,000/year",
                other_fees="₹20,000 (Exam & Activities)",
                scholarship_info="Merit scholarships for CAT/MAT/XAT high scorers"
            ),
            FeeStructure(
                program="MBBS",
                tuition_per_year="₹12,00,000",
                hostel_fee="₹1,00,000 – ₹1,50,000/year",
                other_fees="₹50,000 (Clinical training & labs)",
                scholarship_info="Scholarships available for NEET top rankers and economically weaker sections"
            ),
        ]
        db.session.bulk_save_objects(fees)

    db.session.commit()

with app.app_context():
    db.create_all()
    seed_database()

# ── Serve Frontend ─────────────────────────────────────────────────────────────
@app.route('/')
def index():
    assert app.static_folder is not None, "Static folder is not configured"
    return send_from_directory(app.static_folder, 'index.html')


@app.teardown_appcontext
def shutdown_session(exception=None):
    db.session.remove()

# ── Admin Auth Endpoints ───────────────────────────────────────────────────────
@app.route('/api/admin/login', methods=['POST'])
@limiter.limit("10 per minute")
def admin_login():
    data     = request.json or {}
    password = data.get('password', '')
    if password == ADMIN_PASSWORD:
        session['is_admin'] = True
        return jsonify({'message': 'Login successful'}), 200
    return jsonify({'error': 'Incorrect password'}), 401


@app.route('/api/admin/logout', methods=['POST'])
def admin_logout():
    session.pop('is_admin', None)
    return jsonify({'message': 'Logged out'}), 200


@app.route('/api/admin/status', methods=['GET'])
def admin_status():
    return jsonify({'is_admin': bool(session.get('is_admin'))}), 200

# ── Admissions ─────────────────────────────────────────────────────────────────
@app.route('/api/admissions', methods=['POST'])
@limiter.limit("5 per minute")
def submit_admission():
    try:
        data = request.json or {}

        # ── Server-side validation ────────────────────────────────────────────
        errors = {}

        full_name = (data.get('full_name') or '').strip()
        if not full_name:
            errors['full_name'] = 'Full name is required.'
        elif len(full_name) > 100:
            errors['full_name'] = 'Full name must be 100 characters or fewer.'

        email = (data.get('email') or '').strip()
        if not email:
            errors['email'] = 'Email is required.'
        elif not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            errors['email'] = 'Please provide a valid email address.'

        phone = (data.get('phone') or '').strip()
        if not phone:
            errors['phone'] = 'Phone number is required.'
        elif not re.match(r'^\+?[\d\s\-(). ]{7,20}$', phone):
            errors['phone'] = 'Phone number must be 7–20 digits.'

        dob_raw = data.get('date_of_birth')
        dob = None
        if not dob_raw:
            errors['date_of_birth'] = 'Date of birth is required.'
        else:
            try:
                dob = datetime.strptime(dob_raw, '%Y-%m-%d').date() if isinstance(dob_raw, str) else dob_raw
            except ValueError:
                errors['date_of_birth'] = 'Invalid date format. Use YYYY-MM-DD.'

        gender = (data.get('gender') or '').strip()
        if gender not in ('Male', 'Female', 'Other', 'Prefer not to say'):
            errors['gender'] = 'Please select a valid gender option.'

        address = (data.get('address') or '').strip()
        if not address:
            errors['address'] = 'Address is required.'

        program = (data.get('program') or '').strip()
        if not program:
            errors['program'] = 'Program selection is required.'

        prev_inst = (data.get('previous_institution') or '').strip()
        if not prev_inst:
            errors['previous_institution'] = 'Previous institution is required.'

        gpa_raw = data.get('gpa')
        gpa = None
        if gpa_raw not in (None, ''):
            try:
                gpa = float(gpa_raw)
                if not (0.0 <= gpa <= 100.0):
                    errors['gpa'] = 'GPA/percentage must be between 0 and 100.'
            except (ValueError, TypeError):
                errors['gpa'] = 'GPA must be a number.'

        if errors:
            return jsonify({'errors': errors}), 422

        # Check for duplicate email
        existing = Admission.query.filter(
            db.func.lower(Admission.email) == email.lower()
        ).first()
        if existing:
            return jsonify({'error': 'An application with this email already exists.'}), 409

        # Create new admission record
        admission = Admission(
            full_name=full_name,
            email=email,
            phone=phone,
            date_of_birth=dob,
            gender=gender,
            address=address,
            program=program,
            previous_institution=prev_inst,
            gpa=gpa,
            personal_statement=data.get('personal_statement'),
            status='Pending'
        )

        db.session.add(admission)
        db.session.commit()

        return jsonify({
            'message': 'Application submitted successfully',
            'id': admission.id
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/admissions', methods=['GET'])
@require_admin
def get_admissions():
    admissions = Admission.query.order_by(Admission.created_at.desc()).all()
    return jsonify([{
        'id': a.id,
        'full_name': a.full_name,
        'email': a.email,
        'phone': a.phone,
        'gender': a.gender,
        'program': a.program,
        'previous_institution': a.previous_institution,
        'gpa': a.gpa,
        'status': a.status or 'Pending',
        'created_at': a.created_at.isoformat() if a.created_at else None
    } for a in admissions])

@app.route('/api/admissions/<int:admission_id>/status', methods=['PATCH'])
@require_admin
def update_admission_status(admission_id):
    try:
        admission = db.session.get(Admission, admission_id)
        if not admission:
            return jsonify({'error': 'Application not found'}), 404
        data = request.json or {}
        new_status = data.get('status')
        if new_status in ['Pending', 'Approved', 'Rejected']:
            admission.status = new_status
            db.session.commit()
            return jsonify({'message': 'Status updated successfully', 'status': admission.status}), 200
        return jsonify({'error': 'Invalid status value'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ── Application Status Lookup ──────────────────────────────────────────────────
@app.route('/api/admissions/track', methods=['GET'])
def track_application():
    email  = request.args.get('email', '').strip().lower()
    app_id = request.args.get('id', '').strip()

    if not email and not app_id:
        return jsonify({'error': 'Please provide an email or application ID'}), 400

    if app_id:
        try:
            admission = db.session.get(Admission, int(app_id))
        except (ValueError, TypeError):
            admission = None
    else:
        admission = Admission.query.filter(
            db.func.lower(Admission.email) == email
        ).first()

    if not admission:
        return jsonify({'error': 'No application found with the provided details'}), 404

    return jsonify({
        'id': admission.id,
        'full_name': admission.full_name,
        'email': admission.email,
        'program': admission.program,
        'status': admission.status or 'Pending',
        'created_at': admission.created_at.isoformat() if admission.created_at else None
    })

# ── Courses ────────────────────────────────────────────────────────────────────
@app.route('/api/courses', methods=['GET'])
def get_courses():
    courses = Course.query.all()
    return jsonify([{
        'id': c.id,
        'title': c.title,
        'department': c.department,
        'duration': c.duration,
        'tuition_fee': c.tuition_fee,
        'description': c.description
    } for c in courses])

# ── Fees ───────────────────────────────────────────────────────────────────────
@app.route('/api/fees', methods=['GET'])
def get_fees():
    fees = FeeStructure.query.all()
    return jsonify([{
        'id': f.id,
        'program': f.program,
        'tuition_per_year': f.tuition_per_year,
        'hostel_fee': f.hostel_fee,
        'other_fees': f.other_fees,
        'scholarship_info': f.scholarship_info
    } for f in fees])

# ── Chatbot ────────────────────────────────────────────────────────────────────
# Keyword fallback (used when Gemini API key is not configured)
_KEYWORD_MAP = {
    ('course', 'program', 'degree', 'study', 'major', 'offer', 'department',
     'btech', 'b.tech', 'mba', 'mbbs', 'mtech', 'm.tech'):
        lambda: "Amrita Coimbatore offers B.Tech (CSE, AI-ML, Cybersecurity, ECE, Mechanical, Civil), M.Tech, MBA, and MBBS. Visit our Courses page for full details!",
    ('aeee', 'jee', 'entrance', 'exam', 'test', 'rank', 'amrita entrance'):
        lambda: "Amrita conducts the AEEE (Amrita Entrance Examination – Engineering) for B.Tech admissions. JEE Main scores are also accepted. AEEE 2026 applications are open at amrita.edu/aeee!",
    ('fee', 'cost', 'tuition', 'price', 'pay', 'charge', 'expensive', 'afford', 'rupee', 'inr', '₹'):
        lambda: "B.Tech CSE/AI-ML/Cybersecurity: ₹2,10,000/yr | ECE/Mech: ₹1,85,000/yr | Civil: ₹1,75,000/yr | M.Tech: ₹1,40,000/yr | MBA: ₹2,50,000/yr | MBBS: ₹12,00,000/yr. Vidyamritam Scholarship covers up to 100% of tuition!",
    ('scholarship', 'financial aid', 'discount', 'waiver', 'grant', 'merit', 'vidyamritam', 'free'):
        lambda: "The Vidyamritam Scholarship offers up to 100% tuition fee waiver based on AEEE or JEE Main rank. Need-based financial aid is also available. Contact admissions@amrita.edu for details.",
    ('deadline', 'date', 'when', 'last date', 'close', 'open', 'start', 'schedule'):
        lambda: "AEEE 2026 Phase 1: January–February | Phase 2: April 2026. JEE Main counselling: June–July 2026. Classes start August 2026. Check amrita.edu for exact dates!",
    ('hostel', 'accommodation', 'room', 'housing', 'dorm', 'stay', 'campus living', 'pg'):
        lambda: "Amrita Coimbatore has fully residential AC and non-AC hostels for boys and girls. Hostel fees: ₹80,000–₹1,20,000/year including mess. Contact housing@cb.amrita.edu.",
    ('placement', 'job', 'career', 'company', 'hire', 'recruit', 'salary', 'employ', 'package', 'lpa'):
        lambda: "Amrita has an excellent placement record! 5000+ offers per year, average package ₹7–8 LPA. Top recruiters include Amazon, Google, Microsoft, TCS, Infosys, Wipro, and 500+ companies!",
    ('eligib', 'qualify', 'requirement', 'criteria', 'minimum', 'score', 'grade', 'cutoff', 'marks'):
        lambda: "B.Tech: 10+2 with min. 60% in Physics, Chemistry & Mathematics + AEEE/JEE rank. MBBS: NEET qualification mandatory. MBA: Valid CAT/MAT/XAT score required.",
    ('contact', 'email', 'phone', 'reach', 'call', 'address', 'office', 'helpline'):
        lambda: "Amrita Coimbatore Admissions:\nEmail: admissions@amrita.edu\nPhone: 0422-2685000\nHours: Mon–Sat, 9 AM – 5 PM\nAddress: Amritanagar, Coimbatore – 641112",
    ('transfer', 'credit', 'lateral', 'switch'):
        lambda: "Lateral entry into B.Tech (3rd semester) is available for diploma holders with min. 60% aggregate. Contact the admissions office for the full process.",
    ('international', 'foreign', 'abroad', 'visa', 'toefl', 'ielts', 'overseas', 'nri'):
        lambda: "NRI/OCI category seats are available for B.Tech and MBBS. You need valid passport, academic transcripts, and TOEFL (min 80) or IELTS (min 6.5). Contact nri.admissions@amrita.edu.",
    ('document', 'certificate', 'transcript', 'submit', 'upload', 'required', 'marksheet'):
        lambda: "Required documents: 10th & 12th marksheets & certificates, AEEE/JEE rank card, transfer certificate, character certificate, passport-size photos, Aadhaar card, and caste certificate (if applicable).",
    ('campus', 'coimbatore', 'location', 'where', 'facility', 'infrastructure', 'amrita'):
        lambda: "Amrita Vishwa Vidyapeetham, Coimbatore is the flagship campus (est. 1994). NAAC A++ | NIRF Top 10 Engineering. Spread across 400+ acres with world-class labs, library, sports facilities, and a teaching hospital.",
}

def _keyword_fallback(message: str) -> str:
    lower = message.lower()
    for keywords, response_fn in _KEYWORD_MAP.items():
        if any(k in lower for k in keywords):
            return response_fn()
    return (
        "Thank you for reaching out to Amrita Vishwa Vidyapeetham! "
        "You can ask me about courses, fees, AEEE entrance exam, scholarships, hostel, "
        "placements, eligibility, or required documents. Or call us at 0422-2685000."
    )


@app.route('/api/chat', methods=['POST'])
@limiter.limit("20 per minute")
def handle_chat():
    data    = request.json or {}
    message = (data.get('message') or '').strip()

    if not message:
        return jsonify({'reply': 'Please type a question and I will be happy to help!'})

    model = _get_gemini_model()
    if model is not None:
        try:
            system_prompt = _build_system_prompt()
            full_prompt   = f"{system_prompt}\n\nUser: {message}\nAssistant:"
            response      = model.generate_content(full_prompt)
            reply         = response.text.strip()
            return jsonify({'reply': reply, 'source': 'gemini'})
        except Exception as e:
            # Fall through to keyword fallback on any Gemini error
            app.logger.warning(f"Gemini API error: {e}")

    # Keyword fallback when Gemini is unavailable
    return jsonify({'reply': _keyword_fallback(message), 'source': 'fallback'})


if __name__ == '__main__':
    debug = os.environ.get('FLASK_ENV', 'development') != 'production'
    app.run(debug=debug)