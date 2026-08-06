import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app import app


class AdmissionsAppTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_home_page_serves(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Admiss Clarity Bot", response.data)

    def test_courses_endpoint(self):
        response = self.client.get("/api/courses")
        self.assertEqual(response.status_code, 200)

    def test_chat_endpoint(self):
        response = self.client.post("/api/chat", json={"message": "What courses are available?"})
        self.assertEqual(response.status_code, 200)


if __name__ == "__main__":
    unittest.main()
