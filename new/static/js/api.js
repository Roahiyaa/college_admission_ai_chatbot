// api.js - API functions for backend communication
const API_BASE_URL = '/api';

async function submitAdmission(data) {
    try {
        const response = await fetch(`${API_BASE_URL}/admissions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error submitting admission:', error);
        throw error;
    }
}

async function getAdmissions() {
    try {
        const response = await fetch(`${API_BASE_URL}/admissions`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching admissions:', error);
        throw error;
    }
}

async function updateAdmissionStatus(id, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/admissions/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error updating status:', error);
        throw error;
    }
}

async function getCourses() {
    try {
        const response = await fetch(`${API_BASE_URL}/courses`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching courses:', error);
        throw error;
    }
}

async function getFees() {
    try {
        const response = await fetch(`${API_BASE_URL}/fees`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching fees:', error);
        throw error;
    }
}

async function sendChatMessage(message) {
    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message }),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error sending chat message:', error);
        throw error;
    }
}

async function trackApplication(query) {
    try {
        const params = new URLSearchParams(query);
        const response = await fetch(`${API_BASE_URL}/admissions/track?${params.toString()}`);
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error tracking application:', error);
        throw error;
    }
}