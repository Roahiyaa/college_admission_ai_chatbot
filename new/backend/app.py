from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from models import db, Admission, Course, FeeStructure
import os

app = Flask(__name__, static_folder='../static', static_url_path='')
CORS(app)  # Allow cross-origin requests from frontend
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db.init_app(app)

def seed_database():
    """Seed initial courses and fee structure if tables are empty."""
    if Course.query.count() == 0:
        courses = [
            Course(title="Computer Science", department="School of Computing", duration="4 years", tuition_fee="$11,500/year", description="AI, Data Science, Software Engineering, and Cybersecurity."),
            Course(title="Engineering", department="School of Engineering", duration="4 years", tuition_fee="$12,000/year", description="Computer Science, Mechanical, Electrical, Civil Engineering programs."),
            Course(title="Business Administration", department="School of Business", duration="4 years", tuition_fee="$10,500/year", description="Finance, Marketing, Management, and Entrepreneurship courses."),
            Course(title="Medicine", department="School of Health Sciences", duration="5-6 years", tuition_fee="$18,000/year", description="MBBS, Nursing, Pharmacy, and Health Sciences programs."),
            Course(title="Law", department="School of Law", duration="3 years", tuition_fee="$9,500/year", description="Criminal Law, Corporate Law, International Law studies."),
            Course(title="Liberal Arts", department="School of Arts & Humanities", duration="3-4 years", tuition_fee="$8,000/year", description="Psychology, Sociology, Literature, and Fine Arts programs.")
        ]
        db.session.bulk_save_objects(courses)
        
    if FeeStructure.query.count() == 0:
        fees = [
            FeeStructure(program="Engineering", tuition_per_year="$12,000", hostel_fee="$3,000 - $5,000/semester", other_fees="$300 (Insurance) + $500 (Books)", scholarship_info="Up to 50% merit scholarship for GPA > 3.7"),
            FeeStructure(program="Computer Science", tuition_per_year="$11,500", hostel_fee="$3,000 - $5,000/semester", other_fees="$300 (Insurance) + $500 (Books)", scholarship_info="Up to 50% merit scholarship for GPA > 3.7"),
            FeeStructure(program="Business Administration", tuition_per_year="$10,500", hostel_fee="$3,000 - $5,000/semester", other_fees="$300 (Insurance) + $500 (Books)", scholarship_info="Need-based & Merit scholarships available"),
            FeeStructure(program="Medicine", tuition_per_year="$18,000", hostel_fee="$3,000 - $5,000/semester", other_fees="$500 (Insurance) + $800 (Labs)", scholarship_info="Special medical excellence grant"),
            FeeStructure(program="Law", tuition_per_year="$9,500", hostel_fee="$3,000 - $5,000/semester", other_fees="$300 (Insurance) + $400 (Books)", scholarship_info="Merit scholarships available"),
            FeeStructure(program="Liberal Arts", tuition_per_year="$8,000", hostel_fee="$3,000 - $5,000/semester", other_fees="$300 (Insurance) + $300 (Books)", scholarship_info="Need-based financial aid available")
        ]
        db.session.bulk_save_objects(fees)
        
    db.session.commit()

with app.app_context():
    db.create_all()
    seed_database()

# ── Serve Frontend ────────────────────────────────────────────────────────────
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

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

    # Expanded keyword matching with synonyms
    course_keywords = ['course', 'program', 'degree', 'study', 'major', 'offer', 'department']
    fee_keywords = ['fee', 'cost', 'tuition', 'price', 'pay', 'charge', 'expensive', 'afford']
    scholarship_keywords = ['scholarship', 'financial aid', 'discount', 'waiver', 'grant', 'merit', 'bursary']
    deadline_keywords = ['deadline', 'date', 'apply', 'when', 'last date', 'close', 'open', 'start']
    hostel_keywords = ['hostel', 'accommodation', 'room', 'housing', 'dorm', 'stay', 'campus living']
    placement_keywords = ['placement', 'job', 'career', 'company', 'hire', 'recruit', 'salary', 'employ']
    eligibility_keywords = ['eligib', 'qualify', 'requirement', 'criteria', 'minimum', 'score', 'grade']
    contact_keywords = ['contact', 'email', 'phone', 'reach', 'call', 'address', 'office']
    transfer_keywords = ['transfer', 'credit', 'lateral', 'switch']
    international_keywords = ['international', 'foreign', 'abroad', 'visa', 'toefl', 'ielts', 'overseas']
    document_keywords = ['document', 'certificate', 'transcript', 'submit', 'upload', 'required']
        
    if any(k in message for k in course_keywords):
        courses = Course.query.all()
        titles = ", ".join([c.title for c in courses])
        return jsonify({'reply': f"We offer degree programs in: {titles}. Visit our Courses section for full details on duration, fees, and curriculum!"})
    elif any(k in message for k in fee_keywords):
        fees = FeeStructure.query.all()
        details = " | ".join([f"{f.program}: {f.tuition_per_year}/yr" for f in fees])
        return jsonify({'reply': f"Here is a summary of annual tuition fees: {details}. Scholarships up to 50% are available for eligible students!"})
    elif any(k in message for k in scholarship_keywords):
        return jsonify({'reply': "We offer merit-based and need-based scholarships. Merit scholarships cover up to 50% tuition for students with a GPA of 3.7 or above. Need-based aid is also available — contact admissions@greenfield.edu."})
    elif any(k in message for k in deadline_keywords):
        return jsonify({'reply': "Fall 2026 applications open March 15 and close June 30. Early decision deadline is April 15! Spring 2027 applications open October 1, closing November 30."})
    elif any(k in message for k in hostel_keywords):
        return jsonify({'reply': "On-campus housing is available for all admitted students. Rooms range from $3,000–$5,000/semester. Contact housing@greenfield.edu for availability."})
    elif any(k in message for k in placement_keywords):
        return jsonify({'reply': "Our placement cell partners with 200+ companies globally. 95% of graduates are placed within 6 months of graduation!"})
    elif any(k in message for k in eligibility_keywords):
        return jsonify({'reply': "Generally, a 10+2 or equivalent with a minimum 50% aggregate is required. Some programs have specific requirements — check the Courses section for details."})
    elif any(k in message for k in contact_keywords):
        return jsonify({'reply': "Reach us at 📧 admissions@greenfield.edu or 📞 +1 (555) 123-4567. Office hours: Mon–Fri, 9 AM – 5 PM."})
    elif any(k in message for k in transfer_keywords):
        return jsonify({'reply': "Transfer students are welcome! You need official transcripts and a minimum GPA of 2.5 for consideration."})
    elif any(k in message for k in international_keywords):
        return jsonify({'reply': "International students are welcome! You will need TOEFL (min 80) or IELTS (min 6.5) scores and a valid passport. We provide student visa assistance and have a dedicated international student office."})
    elif any(k in message for k in document_keywords):
        return jsonify({'reply': "Required documents: 1) Academic transcripts, 2) Standardized test scores, 3) Personal statement, 4) Two recommendation letters, 5) Proof of identity (passport/ID). Upload everything through the Apply Now page."})
    else:
        return jsonify({'reply': "Thank you for reaching out! You can ask me about our courses, tuition fees, scholarships, deadlines, hostel, placement, eligibility, or required documents. Or contact admissions@greenfield.edu directly."})

if __name__ == '__main__':
    app.run(debug=True)