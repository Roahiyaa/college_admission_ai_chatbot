// api.js - API functions for backend communication
const API_BASE_URL = 'http://localhost:5000/api'; // Change this to your Python backend URL

async function submitAdmission(data) {
    try {
        const response = await fetch(`${API_BASE_URL}/admissions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error submitting admission:', error);
        throw error;
    }
}

// Add more API functions as needed
// For example, if you want to fetch courses, fees, etc. from backend

async function getCourses() {
    try {
        const response = await fetch(`${API_BASE_URL}/courses`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching courses:', error);
        throw error;
    }
}

async function getFees() {
    try {
        const response = await fetch(`${API_BASE_URL}/fees`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching fees:', error);
        throw error;
    }
}

// You can expand this file with more API functions as your backend grows