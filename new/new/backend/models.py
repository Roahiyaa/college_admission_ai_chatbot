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
    program = db.Column(db.String(50), nullable=False)
    previous_institution = db.Column(db.String(100), nullable=False)
    gpa = db.Column(db.Float)
    personal_statement = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())