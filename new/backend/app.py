from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Admission

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from frontend
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/api/admissions', methods=['POST'])
def submit_admission():
    try:
        data = request.json
        
        # Create new admission record
        admission = Admission(
            full_name=data['full_name'],
            email=data['email'],
            phone=data['phone'],
            date_of_birth=data['date_of_birth'],
            gender=data['gender'],
            address=data['address'],
            program=data['program'],
            previous_institution=data['previous_institution'],
            gpa=float(data['gpa']) if data.get('gpa') else None,
            personal_statement=data.get('personal_statement')
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
    admissions = Admission.query.all()
    return jsonify([{
        'id': a.id,
        'full_name': a.full_name,
        'email': a.email,
        'program': a.program,
        'created_at': a.created_at.isoformat()
    } for a in admissions])

# Add more routes as needed for courses, fees, etc.

if __name__ == '__main__':
    app.run(debug=True)