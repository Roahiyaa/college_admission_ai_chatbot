// app.js - Main application logic
document.addEventListener('DOMContentLoaded', function() {
    loadHeader();
    loadFooter();
    loadPage('home');
    
    // Navigation
    document.addEventListener('click', function(e) {
        if (e.target.matches('[data-page]')) {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            loadPage(page);
        }
    });
});

function loadHeader() {
    const header = document.getElementById('header');
    header.innerHTML = `
        <div class="bg-white shadow-sm">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center py-4">
                    <div class="flex items-center">
                        <h1 class="text-2xl font-bold text-gray-900">Admiss Clarity Bot</h1>
                    </div>
                    <nav class="hidden md:flex space-x-8">
                        <a href="#" data-page="home" class="nav-link">Home</a>
                        <a href="#" data-page="courses" class="nav-link">Courses</a>
                        <a href="#" data-page="fees" class="nav-link">Fees</a>
                        <a href="#" data-page="dates" class="nav-link">Dates</a>
                        <a href="#" data-page="application" class="nav-link">Application</a>
                        <button id="chatbot-toggle" class="nav-link">Chatbot</button>
                    </nav>
                    <div class="md:hidden">
                        <button id="mobile-menu-button" class="text-gray-600 hover:text-gray-900">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Mobile menu toggle
    document.getElementById('mobile-menu-button').addEventListener('click', function() {
        // Implement mobile menu toggle
    });
    
    // Chatbot toggle
    document.getElementById('chatbot-toggle').addEventListener('click', function() {
        toggleChatbot();
    });
}

function loadFooter() {
    const footer = document.getElementById('footer');
    footer.innerHTML = `
        <div class="bg-gray-800 text-white py-8">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 class="text-lg font-semibold mb-4">Contact Us</h3>
                        <p class="text-gray-300">Email: admissions@greenfield.edu</p>
                        <p class="text-gray-300">Phone: +1 (555) 123-4567</p>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul class="space-y-2">
                            <li><a href="#" data-page="courses" class="text-gray-300 hover:text-white">Courses</a></li>
                            <li><a href="#" data-page="fees" class="text-gray-300 hover:text-white">Fees</a></li>
                            <li><a href="#" data-page="application" class="text-gray-300 hover:text-white">Application</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold mb-4">Follow Us</h3>
                        <div class="flex space-x-4">
                            <a href="#" class="text-gray-300 hover:text-white">Facebook</a>
                            <a href="#" class="text-gray-300 hover:text-white">Twitter</a>
                            <a href="#" class="text-gray-300 hover:text-white">Instagram</a>
                        </div>
                    </div>
                </div>
                <div class="mt-8 pt-8 border-t border-gray-700 text-center">
                    <p class="text-gray-300">&copy; 2026 Admiss Clarity Bot. All rights reserved.</p>
                </div>
            </div>
        </div>
    `;
}

function loadPage(page) {
    const mainContent = document.getElementById('main-content');
    
    // Update active nav link
    document.querySelectorAll('[data-page]').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-page="${page}"]`)?.classList.add('active');
    
    switch(page) {
        case 'home':
            mainContent.innerHTML = getHomeContent();
            break;
        case 'courses':
            mainContent.innerHTML = getCoursesContent();
            break;
        case 'fees':
            mainContent.innerHTML = getFeesContent();
            break;
        case 'dates':
            mainContent.innerHTML = getDatesContent();
            break;
        case 'application':
            mainContent.innerHTML = getApplicationContent();
            break;
        default:
            mainContent.innerHTML = getHomeContent();
    }
}

function getHomeContent() {
    return `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div class="text-center mb-12">
                <h1 class="text-4xl font-bold text-gray-900 mb-4">Welcome to Greenfield University</h1>
                <p class="text-xl text-gray-600 max-w-3xl mx-auto">
                    Your gateway to excellence in education. Discover our programs, apply for admission, and get all your questions answered by our AI-powered chatbot.
                </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div class="card text-center">
                    <h3 class="text-xl font-semibold mb-4">Explore Courses</h3>
                    <p class="text-gray-600 mb-4">Discover our diverse range of undergraduate and graduate programs.</p>
                    <button data-page="courses" class="btn-primary">View Courses</button>
                </div>
                <div class="card text-center">
                    <h3 class="text-xl font-semibold mb-4">Check Fees</h3>
                    <p class="text-gray-600 mb-4">Learn about tuition fees, scholarships, and financial aid options.</p>
                    <button data-page="fees" class="btn-primary">View Fees</button>
                </div>
                <div class="card text-center">
                    <h3 class="text-xl font-semibold mb-4">Apply Now</h3>
                    <p class="text-gray-600 mb-4">Start your application process and join our community.</p>
                    <button data-page="application" class="btn-primary">Apply Now</button>
                </div>
            </div>
            
            <div class="text-center">
                <button id="chatbot-home-toggle" class="btn-secondary text-lg px-8 py-3">
                    Have Questions? Ask Our Chatbot
                </button>
            </div>
        </div>
    `;
}

function getCoursesContent() {
    return `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 class="text-3xl font-bold text-gray-900 mb-8">Our Courses</h1>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div class="card">
                    <h3 class="text-xl font-semibold mb-4">Engineering</h3>
                    <p class="text-gray-600 mb-4">Computer Science, Mechanical, Electrical, Civil Engineering programs.</p>
                    <p class="text-sm text-gray-500">Duration: 4 years</p>
                </div>
                <div class="card">
                    <h3 class="text-xl font-semibold mb-4">Business Administration</h3>
                    <p class="text-gray-600 mb-4">Finance, Marketing, Management, and Entrepreneurship courses.</p>
                    <p class="text-sm text-gray-500">Duration: 4 years</p>
                </div>
                <div class="card">
                    <h3 class="text-xl font-semibold mb-4">Computer Science</h3>
                    <p class="text-gray-600 mb-4">AI, Data Science, Software Engineering, and Cybersecurity.</p>
                    <p class="text-sm text-gray-500">Duration: 4 years</p>
                </div>
                <div class="card">
                    <h3 class="text-xl font-semibold mb-4">Medicine</h3>
                    <p class="text-gray-600 mb-4">MBBS, Nursing, Pharmacy, and Health Sciences programs.</p>
                    <p class="text-sm text-gray-500">Duration: 5-6 years</p>
                </div>
                <div class="card">
                    <h3 class="text-xl font-semibold mb-4">Law</h3>
                    <p class="text-gray-600 mb-4">Criminal Law, Corporate Law, International Law studies.</p>
                    <p class="text-sm text-gray-500">Duration: 3 years</p>
                </div>
                <div class="card">
                    <h3 class="text-xl font-semibold mb-4">Liberal Arts</h3>
                    <p class="text-gray-600 mb-4">Psychology, Sociology, Literature, and Fine Arts programs.</p>
                    <p class="text-sm text-gray-500">Duration: 3-4 years</p>
                </div>
            </div>
        </div>
    `;
}

function getFeesContent() {
    return `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 class="text-3xl font-bold text-gray-900 mb-8">Fee Structure</h1>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="card">
                    <h3 class="text-xl font-semibold mb-4">Tuition Fees</h3>
                    <ul class="space-y-2 text-gray-600">
                        <li>Engineering: $12,000/year</li>
                        <li>Business Administration: $10,500/year</li>
                        <li>Computer Science: $11,500/year</li>
                        <li>Medicine: $18,000/year</li>
                        <li>Law: $9,500/year</li>
                        <li>Liberal Arts: $8,000/year</li>
                    </ul>
                </div>
                <div class="card">
                    <h3 class="text-xl font-semibold mb-4">Additional Costs</h3>
                    <ul class="space-y-2 text-gray-600">
                        <li>Hostel: $3,000-$5,000/semester</li>
                        <li>Food: $2,500/semester</li>
                        <li>Books & Supplies: $500-$1,000/year</li>
                        <li>Medical Insurance: $300/year</li>
                    </ul>
                </div>
            </div>
            <div class="card mt-8">
                <h3 class="text-xl font-semibold mb-4">Scholarships</h3>
                <p class="text-gray-600 mb-4">We offer merit-based and need-based scholarships. Merit scholarships cover up to 50% of tuition for students with a GPA above 3.7.</p>
                <p class="text-gray-600">Contact our admissions office for scholarship applications and eligibility criteria.</p>
            </div>
        </div>
    `;
}

function getDatesContent() {
    return `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 class="text-3xl font-bold text-gray-900 mb-8">Important Dates</h1>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="card">
                    <h3 class="text-xl font-semibold mb-4">Fall 2026 Admission</h3>
                    <ul class="space-y-2 text-gray-600">
                        <li>Application Opens: March 15, 2026</li>
                        <li>Early Decision Deadline: April 15, 2026</li>
                        <li>Regular Deadline: June 30, 2026</li>
                        <li>Results Announcement: July 15, 2026</li>
                        <li>Classes Begin: August 25, 2026</li>
                    </ul>
                </div>
                <div class="card">
                    <h3 class="text-xl font-semibold mb-4">Spring 2027 Admission</h3>
                    <ul class="space-y-2 text-gray-600">
                        <li>Application Opens: October 1, 2026</li>
                        <li>Deadline: November 30, 2026</li>
                        <li>Results Announcement: December 15, 2026</li>
                        <li>Classes Begin: January 10, 2027</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

function getApplicationContent() {
    return `
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 class="text-3xl font-bold text-gray-900 mb-8">Application Form</h1>
            <div class="card">
                <form id="admission-form">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                            <input type="text" name="full_name" required class="input-field">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                            <input type="email" name="email" required class="input-field">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                            <input type="tel" name="phone" required class="input-field">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                            <input type="date" name="date_of_birth" required class="input-field">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                            <select name="gender" required class="input-field">
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Program *</label>
                            <select name="program" required class="input-field">
                                <option value="">Select Program</option>
                                <option value="Engineering">Engineering</option>
                                <option value="Business Administration">Business Administration</option>
                                <option value="Computer Science">Computer Science</option>
                                <option value="Medicine">Medicine</option>
                                <option value="Law">Law</option>
                                <option value="Liberal Arts">Liberal Arts</option>
                            </select>
                        </div>
                    </div>
                    <div class="mt-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                        <textarea name="address" required class="input-field" rows="3"></textarea>
                    </div>
                    <div class="mt-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Previous Institution *</label>
                        <input type="text" name="previous_institution" required class="input-field">
                    </div>
                    <div class="mt-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">GPA</label>
                        <input type="number" name="gpa" step="0.01" min="0" max="4" class="input-field">
                    </div>
                    <div class="mt-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Personal Statement</label>
                        <textarea name="personal_statement" class="input-field" rows="5" placeholder="Tell us about yourself..."></textarea>
                    </div>
                    <div class="mt-8">
                        <button type="submit" class="btn-primary w-full">Submit Application</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// Event listeners for dynamic elements
document.addEventListener('click', function(e) {
    if (e.target.id === 'chatbot-home-toggle') {
        toggleChatbot();
    }
});

document.addEventListener('submit', function(e) {
    if (e.target.id === 'admission-form') {
        e.preventDefault();
        submitAdmissionForm(e.target);
    }
});

async function submitAdmissionForm(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    try {
        const result = await submitAdmission(data);
        alert('Application submitted successfully!');
        form.reset();
    } catch (error) {
        alert('Error submitting application. Please try again.');
        console.error(error);
    }
}