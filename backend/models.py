from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Admission(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False) 
    email = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    address = db.Column(db.Text, nullable=False)
    program = db.Column(db.String(120), nullable=False)
    previous_institution = db.Column(db.String(150), nullable=False)
    gpa = db.Column(db.Float)
    personal_statement = db.Column(db.Text)
    status = db.Column(db.String(20), default='Pending')
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(50), nullable=False)
    duration = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)
    tuition_fee = db.Column(db.String(50), nullable=False)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

class FeeStructure(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    program = db.Column(db.String(100), nullable=False)
    tuition_per_year = db.Column(db.String(50), nullable=False)
    hostel_fee = db.Column(db.String(50), nullable=False)
    other_fees = db.Column(db.String(50), nullable=False)
    scholarship_info = db.Column(db.Text)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

