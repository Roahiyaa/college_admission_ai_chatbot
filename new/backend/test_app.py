import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app import app, db, limiter

# Use an isolated in-memory DB so tests never touch the real database.db.
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
app.config['TESTING']                 = True
app.config['SECRET_KEY']              = 'test-secret'
# Disable rate limiting in tests so repeated requests don't get 429.
app.config['RATELIMIT_ENABLED']       = False


class AdmissionsAppTests(unittest.TestCase):

    def setUp(self):
        self.client = app.test_client()
        # Reset limiter counters between tests
        with app.app_context():
            limiter.reset()
        with app.app_context():
            db.create_all()
            # Import and run the seeder so courses / fees exist
            from backend.app import seed_database
            seed_database()

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    # ── Frontend ──────────────────────────────────────────────────────────────
    def test_home_page_serves(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        # The HTML should contain the portal title
        self.assertIn(b"Amrita", response.data)

    # ── Courses endpoint ──────────────────────────────────────────────────────
    def test_courses_endpoint(self):
        response = self.client.get("/api/courses")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)
        self.assertIn('title', data[0])

    # ── Fees endpoint ─────────────────────────────────────────────────────────
    def test_fees_endpoint(self):
        response = self.client.get("/api/fees")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)

    # ── Chat endpoint ─────────────────────────────────────────────────────────
    def test_chat_endpoint_courses(self):
        response = self.client.post("/api/chat", json={"message": "What courses are available?"})
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('reply', data)
        self.assertGreater(len(data['reply']), 0)

    def test_chat_endpoint_empty_message(self):
        response = self.client.post("/api/chat", json={"message": ""})
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('reply', data)

    # ── Admission submission ──────────────────────────────────────────────────
    _VALID_PAYLOAD = {
        "full_name":            "Test Student",
        "email":                "test@example.com",
        "phone":                "9876543210",
        "date_of_birth":        "2001-06-15",
        "gender":               "Male",
        "address":              "123 Test Street, Coimbatore",
        "program":              "B.Tech Computer Science & Engineering",
        "previous_institution": "Test High School",
        "gpa":                  "85",
    }

    def test_submit_admission_success(self):
        response = self.client.post("/api/admissions", json=self._VALID_PAYLOAD)
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertIn('id', data)

    def test_submit_admission_duplicate_email(self):
        # First submission
        self.client.post("/api/admissions", json=self._VALID_PAYLOAD)
        # Duplicate
        response = self.client.post("/api/admissions", json=self._VALID_PAYLOAD)
        self.assertEqual(response.status_code, 409)

    def test_submit_admission_invalid_email(self):
        payload = {**self._VALID_PAYLOAD, "email": "not-an-email"}
        response = self.client.post("/api/admissions", json=payload)
        self.assertEqual(response.status_code, 422)
        errors = response.get_json().get('errors', {})
        self.assertIn('email', errors)

    def test_submit_admission_missing_required_field(self):
        payload = {**self._VALID_PAYLOAD}
        del payload['full_name']
        response = self.client.post("/api/admissions", json=payload)
        self.assertEqual(response.status_code, 422)

    def test_submit_admission_gpa_out_of_range(self):
        payload = {**self._VALID_PAYLOAD, "gpa": "150"}
        response = self.client.post("/api/admissions", json=payload)
        self.assertEqual(response.status_code, 422)

    # ── Admin auth ────────────────────────────────────────────────────────────
    def test_get_admissions_requires_auth(self):
        """GET /api/admissions should return 401 without an admin session."""
        response = self.client.get("/api/admissions")
        self.assertEqual(response.status_code, 401)

    def test_admin_login_wrong_password(self):
        response = self.client.post("/api/admin/login", json={"password": "wrongpassword"})
        self.assertEqual(response.status_code, 401)

    def test_admin_login_and_access(self):
        """Login with correct password, then GET /api/admissions should succeed."""
        from backend.app import ADMIN_PASSWORD
        login_response = self.client.post("/api/admin/login", json={"password": ADMIN_PASSWORD})
        self.assertEqual(login_response.status_code, 200)
        # With session cookie set, the protected endpoint should now work
        admissions_response = self.client.get("/api/admissions")
        self.assertEqual(admissions_response.status_code, 200)

    # ── Track application ─────────────────────────────────────────────────────
    def test_track_application_not_found(self):
        response = self.client.get("/api/admissions/track?email=nobody@example.com")
        self.assertEqual(response.status_code, 404)

    def test_track_application_by_email(self):
        # Submit first
        self.client.post("/api/admissions", json=self._VALID_PAYLOAD)
        # Then track
        response = self.client.get(f"/api/admissions/track?email={self._VALID_PAYLOAD['email']}")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['email'], self._VALID_PAYLOAD['email'])

    def test_track_application_by_id(self):
        submit = self.client.post("/api/admissions", json=self._VALID_PAYLOAD)
        app_id = submit.get_json()['id']
        response = self.client.get(f"/api/admissions/track?id={app_id}")
        self.assertEqual(response.status_code, 200)

    # ── Update status ─────────────────────────────────────────────────────────
    def test_update_status_requires_auth(self):
        response = self.client.patch("/api/admissions/1/status", json={"status": "Approved"})
        self.assertEqual(response.status_code, 401)

    def test_update_status_invalid_value(self):
        from backend.app import ADMIN_PASSWORD
        self.client.post("/api/admin/login", json={"password": ADMIN_PASSWORD})
        # Submit an application first
        submit = self.client.post("/api/admissions", json=self._VALID_PAYLOAD)
        app_id = submit.get_json()['id']
        response = self.client.patch(f"/api/admissions/{app_id}/status", json={"status": "Invalid"})
        self.assertEqual(response.status_code, 400)

    def test_update_status_valid(self):
        from backend.app import ADMIN_PASSWORD
        self.client.post("/api/admin/login", json={"password": ADMIN_PASSWORD})
        submit = self.client.post("/api/admissions", json=self._VALID_PAYLOAD)
        app_id = submit.get_json()['id']
        response = self.client.patch(f"/api/admissions/{app_id}/status", json={"status": "Approved"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['status'], 'Approved')


if __name__ == "__main__":
    unittest.main()
