from datetime import datetime
import os

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

import sys
import os as _os

# Ensure the backend directory is always on sys.path so both direct
# execution and package imports resolve correctly.
_backend_dir = _os.path.abspath(_os.path.dirname(__file__))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from models import db, Admission, Course, FeeStructure

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
STATIC_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', 'static'))

app = Flask(__name__, static_folder=STATIC_DIR, static_url_path='')
CORS(app)  # type: ignore[arg-type]  # Allow cross-origin requests from frontend
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(BASE_DIR, "database.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

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
    db.session.remove()

# ── Serve Frontend ────────────────────────────────────────────────────────────
@app.route('/')
def index():
    assert app.static_folder is not None, "Static folder is not configured"
    return send_from_directory(app.static_folder, 'index.html')


@app.teardown_appcontext
def shutdown_session(exception=None):
    db.session.remove()

# ── Admissions ────────────────────────────────────────────────────────────────
@app.route('/api/admissions', methods=['POST'])
def submit_admission():
    try:
        data = request.json

        # Check for duplicate email
        existing = Admission.query.filter_by(email=data.get('email', '')).first()
        if existing:
            return jsonify({'error': 'An application with this email already exists.'}), 409

        dob = data.get('date_of_birth')
        if isinstance(dob, str):
            dob = datetime.strptime(dob, '%Y-%m-%d').date()

        # Create new admission record
        admission = Admission(
            full_name=data['full_name'],
            email=data['email'],
            phone=data['phone'],
            date_of_birth=dob,
            gender=data['gender'],
            address=data['address'],
            program=data['program'],
            previous_institution=data['previous_institution'],
            gpa=float(data['gpa']) if data.get('gpa') else None,
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
def update_admission_status(admission_id):
    try:
        admission = db.session.get(Admission, admission_id)
        if not admission:
            return jsonify({'error': 'Application not found'}), 404
        data = request.json
        new_status = data.get('status')
        if new_status in ['Pending', 'Approved', 'Rejected']:
            admission.status = new_status
            db.session.commit()
            return jsonify({'message': 'Status updated successfully', 'status': admission.status}), 200
        return jsonify({'error': 'Invalid status value'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ── Application Status Lookup ─────────────────────────────────────────────────
@app.route('/api/admissions/track', methods=['GET'])
def track_application():
    email = request.args.get('email', '').strip().lower()
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

# ── Courses ───────────────────────────────────────────────────────────────────
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

# ── Fees ──────────────────────────────────────────────────────────────────────
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

# ── Chatbot ───────────────────────────────────────────────────────────────────
@app.route('/api/chat', methods=['POST'])
def handle_chat():
    data = request.json or {}
    message = data.get('message', '').strip().lower()

    if not message:
        return jsonify({'reply': 'Please type a question and I will be happy to help!'})

    # Keyword groups
    course_keywords      = ['course', 'program', 'degree', 'study', 'major', 'offer', 'department', 'btech', 'b.tech', 'mba', 'mbbs', 'mtech', 'm.tech']
    fee_keywords         = ['fee', 'cost', 'tuition', 'price', 'pay', 'charge', 'expensive', 'afford', 'rupee', 'inr', '₹']
    scholarship_keywords = ['scholarship', 'financial aid', 'discount', 'waiver', 'grant', 'merit', 'bursary', 'vidyamritam', 'free']
    deadline_keywords    = ['deadline', 'date', 'apply', 'when', 'last date', 'close', 'open', 'start', 'schedule']
    hostel_keywords      = ['hostel', 'accommodation', 'room', 'housing', 'dorm', 'stay', 'campus living', 'pg']
    placement_keywords   = ['placement', 'job', 'career', 'company', 'hire', 'recruit', 'salary', 'employ', 'package', 'lpa']
    eligibility_keywords = ['eligib', 'qualify', 'requirement', 'criteria', 'minimum', 'score', 'grade', 'cutoff', 'marks']
    contact_keywords     = ['contact', 'email', 'phone', 'reach', 'call', 'address', 'office', 'helpline']
    transfer_keywords    = ['transfer', 'credit', 'lateral', 'switch']
    international_keywords = ['international', 'foreign', 'abroad', 'visa', 'toefl', 'ielts', 'overseas', 'nri']
    document_keywords    = ['document', 'certificate', 'transcript', 'submit', 'upload', 'required', 'marksheet']
    entrance_keywords    = ['aeee', 'jee', 'entrance', 'exam', 'test', 'rank', 'amrita entrance']
    campus_keywords      = ['campus', 'coimbatore', 'location', 'where', 'facility', 'infrastructure', 'amrita']

    if any(k in message for k in course_keywords):
        courses = Course.query.all()
        titles = ", ".join([c.title for c in courses])
        return jsonify({'reply': f"Amrita Vishwa Vidyapeetham (Coimbatore) offers: {titles}. Visit our Courses section for full details on duration, fees, and curriculum!"})

    elif any(k in message for k in entrance_keywords):
        return jsonify({'reply': "Amrita conducts the AEEE (Amrita Entrance Examination – Engineering) for B.Tech admissions. JEE Main scores are also accepted for direct admission. The AEEE 2026 applications are open — register at amrita.edu/aeee!"})

    elif any(k in message for k in fee_keywords):
        fees = FeeStructure.query.all()
        details = " | ".join([f"{f.program}: {f.tuition_per_year}/yr" for f in fees])
        return jsonify({'reply': f"Here is a summary of annual tuition fees: {details}. Hostel fees are additional (₹80,000–₹1,50,000/year). Vidyamritam Scholarships cover up to 100% of fees for eligible students!"})

    elif any(k in message for k in scholarship_keywords):
        return jsonify({'reply': "Amrita offers the prestigious Vidyamritam Scholarship — up to 100% tuition fee waiver based on your AEEE or JEE Main rank. Need-based financial aid is also available. Contact admissions@amrita.edu for details."})

    elif any(k in message for k in deadline_keywords):
        return jsonify({'reply': "AEEE 2026 Phase 1: January–February 2026 | Phase 2: April 2026. JEE Main-based admissions counselling: June–July 2026. Classes typically begin in August. Check amrita.edu for exact dates!"})

    elif any(k in message for k in hostel_keywords):
        return jsonify({'reply': "Amrita Coimbatore has fully residential AC and non-AC hostels for boys and girls. Hostel fees range from ₹80,000–₹1,20,000/year including mess. Contact housing@cb.amrita.edu for availability."})

    elif any(k in message for k in placement_keywords):
        return jsonify({'reply': "Amrita has an excellent placement record! 5000+ placement offers per year, average package of ₹7–8 LPA, and top recruiters include Amazon, Google, Microsoft, TCS, Infosys, Wipro, and 500+ other companies!"})

    elif any(k in message for k in eligibility_keywords):
        return jsonify({'reply': "For B.Tech: 10+2 with minimum 60% in Physics, Chemistry & Mathematics. Admission via AEEE or JEE Main scores. For MBBS: NEET qualification is mandatory. For MBA: Valid CAT/MAT/XAT score required."})

    elif any(k in message for k in contact_keywords):
        return jsonify({'reply': "Reach the Amrita Coimbatore Admissions Office at:\n📧 admissions@amrita.edu\n📞 0422-2685000\n🕑 Mon–Sat, 9 AM – 5 PM\n📍 Amritanagar, Coimbatore – 641112"})

    elif any(k in message for k in transfer_keywords):
        return jsonify({'reply': "Lateral entry into B.Tech (3rd semester) is available for diploma holders with a minimum 60% aggregate. Contact the admissions office for lateral entry eligibility and process."})

    elif any(k in message for k in international_keywords):
        return jsonify({'reply': "Amrita welcomes NRI and international students! NRI/OCI category seats are available for B.Tech and MBBS. You need valid passport, academic transcripts, and TOEFL/IELTS scores. Contact nri.admissions@amrita.edu."})

    elif any(k in message for k in document_keywords):
        return jsonify({'reply': "Required documents: 1) 10th & 12th marksheets & certificates, 2) AEEE/JEE rank card, 3) Transfer certificate, 4) Character certificate, 5) Passport-size photos, 6) Aadhaar card / ID proof, 7) Caste certificate (if applicable). Upload via the Apply Now page."})

    elif any(k in message for k in campus_keywords):
        return jsonify({'reply': "Amrita Vishwa Vidyapeetham, Coimbatore is the flagship campus (est. 1994). Rated NAAC A++ with a NIRF rank in top 10 engineering colleges. Spread across 400+ acres with world-class labs, library, sports facilities, and hospital."})

    else:
        return jsonify({'reply': "Thank you for reaching out to Amrita Vishwa Vidyapeetham! You can ask me about courses, fees, AEEE entrance exam, scholarships, hostel, placements, eligibility, or required documents. Or call us at 0422-2685000."})

if __name__ == '__main__':
    app.run(debug=True)