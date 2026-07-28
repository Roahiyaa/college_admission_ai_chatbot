// app.js - Main application logic
document.addEventListener('DOMContentLoaded', function () {
    loadHeader();
    loadFooter();
    loadPage('home');

    // Delegate navigation clicks
    document.addEventListener('click', function (e) {
        if (e.target.matches('[data-page]') || e.target.closest('[data-page]')) {
            const el = e.target.matches('[data-page]') ? e.target : e.target.closest('[data-page]');
            e.preventDefault();
            const page = el.getAttribute('data-page');
            loadPage(page);
            // Close mobile menu on navigation
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu) mobileMenu.classList.add('hidden');
        }
    });
});

// ─── Admin PIN ─────────────────────────────────────────────────────────────────
const ADMIN_PIN = 'admin123';
let adminUnlocked = false;

function promptAdminPin(onSuccess) {
    // If already unlocked this session, skip
    if (adminUnlocked) { onSuccess(); return; }

    const overlay = document.createElement('div');
    overlay.id = 'pin-overlay';
    overlay.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] flex items-center justify-center';
    overlay.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 animate-fadeIn">
            <div class="text-center mb-6">
                <div class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span class="text-3xl">🔐</span>
                </div>
                <h2 class="text-xl font-bold text-gray-900">Admin Access</h2>
                <p class="text-sm text-gray-500 mt-1">Enter the admin PIN to continue</p>
            </div>
            <input
                id="pin-input"
                type="password"
                placeholder="Enter PIN"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center tracking-widest text-lg mb-4"
                maxlength="20"
                autocomplete="off"
            >
            <p id="pin-error" class="text-red-500 text-xs text-center mb-3 hidden">Incorrect PIN. Please try again.</p>
            <div class="flex gap-3">
                <button id="pin-cancel" class="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition text-sm">Cancel</button>
                <button id="pin-submit" class="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition text-sm">Unlock</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const pinInput = overlay.querySelector('#pin-input');
    const pinError = overlay.querySelector('#pin-error');

    function checkPin() {
        if (pinInput.value === ADMIN_PIN) {
            adminUnlocked = true;
            overlay.remove();
            onSuccess();
        } else {
            pinError.classList.remove('hidden');
            pinInput.value = '';
            pinInput.classList.add('border-red-400');
            setTimeout(() => pinInput.classList.remove('border-red-400'), 800);
        }
    }

    overlay.querySelector('#pin-submit').addEventListener('click', checkPin);
    overlay.querySelector('#pin-cancel').addEventListener('click', () => {
        overlay.remove();
        loadPage('home');
    });
    pinInput.addEventListener('keypress', e => { if (e.key === 'Enter') checkPin(); });
    setTimeout(() => pinInput.focus(), 100);
}

// ─── Toast Notifications ──────────────────────────────────────────────────────
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed top-6 right-6 z-[9999] flex flex-col gap-3';
        document.body.appendChild(container);
    }

    const colors = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        info: 'bg-blue-600',
        warning: 'bg-yellow-500',
    };

    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠',
    };

    const toast = document.createElement('div');
    toast.className = `flex items-center gap-3 ${colors[type] || colors.info} text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium transition-all duration-300 translate-x-20 opacity-0 max-w-xs`;
    toast.innerHTML = `<span class="text-base font-bold">${icons[type]}</span><span>${message}</span>`;
    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.classList.remove('translate-x-20', 'opacity-0');
        });
    });

    // Animate out and remove
    setTimeout(() => {
        toast.classList.add('translate-x-20', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ─── Header ───────────────────────────────────────────────────────────────────
function loadHeader() {
    const header = document.getElementById('header');
    header.innerHTML = `
        <div class="bg-white shadow-sm sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center py-4">
                    <div class="flex items-center gap-3 cursor-pointer" data-page="home">
                        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">AC</div>
                        <h1 class="text-xl font-bold text-gray-900">Admiss Clarity Bot</h1>
                    </div>
                    <nav class="hidden md:flex items-center space-x-1">
                        <a href="#" data-page="home" class="nav-link">Home</a>
                        <a href="#" data-page="courses" class="nav-link">Courses</a>
                        <a href="#" data-page="fees" class="nav-link">Fees</a>
                        <a href="#" data-page="dates" class="nav-link">Dates</a>
                        <a href="#" data-page="track" class="nav-link">Track</a>
                        <a href="#" data-page="application" class="nav-link">Apply</a>
                        <a href="#" data-page="admin" class="nav-link">Admin</a>
                        <button id="chatbot-toggle" class="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200">
                            💬 Chatbot
                        </button>
                    </nav>
                    <button id="mobile-menu-button" class="md:hidden text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                </div>
                <!-- Mobile Menu -->
                <div id="mobile-menu" class="hidden md:hidden border-t border-gray-100 py-3 space-y-1">
                    <a href="#" data-page="home" class="block nav-link">Home</a>
                    <a href="#" data-page="courses" class="block nav-link">Courses</a>
                    <a href="#" data-page="fees" class="block nav-link">Fees</a>
                    <a href="#" data-page="dates" class="block nav-link">Important Dates</a>
                    <a href="#" data-page="track" class="block nav-link">Track Application</a>
                    <a href="#" data-page="application" class="block nav-link">Apply Now</a>
                    <a href="#" data-page="admin" class="block nav-link">Admin Dashboard</a>
                    <button id="chatbot-toggle-mobile" class="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200">
                        💬 Open Chatbot
                    </button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('mobile-menu-button').addEventListener('click', function () {
        const menu = document.getElementById('mobile-menu');
        menu.classList.toggle('hidden');
    });

    document.getElementById('chatbot-toggle').addEventListener('click', toggleChatbot);

    // Mobile chatbot toggle added after render
    document.addEventListener('click', function (e) {
        if (e.target.id === 'chatbot-toggle-mobile') toggleChatbot();
    });
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function loadFooter() {
    const footer = document.getElementById('footer');
    footer.innerHTML = `
        <div class="bg-gray-900 text-white py-12 mt-16">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div>
                        <div class="flex items-center gap-3 mb-4">
                            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">AC</div>
                            <span class="font-bold text-lg">Admiss Clarity Bot</span>
                        </div>
                        <p class="text-gray-400 text-sm leading-relaxed">Your intelligent admission assistant for Greenfield University. Get answers 24/7.</p>
                    </div>
                    <div>
                        <h3 class="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Quick Links</h3>
                        <ul class="space-y-2">
                            <li><a href="#" data-page="courses" class="text-gray-400 hover:text-white text-sm transition">Courses</a></li>
                            <li><a href="#" data-page="fees" class="text-gray-400 hover:text-white text-sm transition">Fees &amp; Scholarships</a></li>
                            <li><a href="#" data-page="application" class="text-gray-400 hover:text-white text-sm transition">Apply Online</a></li>
                            <li><a href="#" data-page="dates" class="text-gray-400 hover:text-white text-sm transition">Important Dates</a></li>
                            <li><a href="#" data-page="track" class="text-gray-400 hover:text-white text-sm transition">Track Application</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Contact Us</h3>
                        <ul class="space-y-2 text-gray-400 text-sm">
                            <li>📧 admissions@greenfield.edu</li>
                            <li>📞 +1 (555) 123-4567</li>
                            <li>🕑 Mon–Fri, 9 AM – 5 PM</li>
                        </ul>
                    </div>
                </div>
                <div class="mt-10 pt-6 border-t border-gray-800 text-center text-gray-500 text-sm">
                    &copy; 2026 Greenfield University – Admiss Clarity Bot. All rights reserved.
                </div>
            </div>
        </div>
    `;
}

// ─── Page Router ──────────────────────────────────────────────────────────────
function loadPage(page) {
    const mainContent = document.getElementById('main-content');

    // Update active nav
    document.querySelectorAll('[data-page]').forEach(link => link.classList.remove('active'));
    document.querySelectorAll(`[data-page="${page}"]`).forEach(el => el.classList.add('active'));

    if (page === 'admin') {
        promptAdminPin(() => _renderPage(page, mainContent));
    } else {
        _renderPage(page, mainContent);
    }
}

function _renderPage(page, mainContent) {
    switch (page) {
        case 'home':        loadHomePage(mainContent);        break;
        case 'courses':     loadCoursesPage(mainContent);     break;
        case 'fees':        loadFeesPage(mainContent);        break;
        case 'dates':       mainContent.innerHTML = getDatesContent(); break;
        case 'track':       loadTrackPage(mainContent);       break;
        case 'application': loadApplicationPage(mainContent); break;
        case 'admin':       loadAdminPage(mainContent);       break;
        default:            loadHomePage(mainContent);
    }
}

// ─── Home Page ────────────────────────────────────────────────────────────────
function loadHomePage(container) {
    container.innerHTML = `
        <div>
            <!-- Hero -->
            <div class="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-24 px-4">
                <div class="max-w-4xl mx-auto text-center">
                    <span class="inline-block bg-white/20 backdrop-blur text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wider uppercase">Fall 2026 Admissions Open</span>
                    <h1 class="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">Welcome to<br>Greenfield University</h1>
                    <p class="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Discover world-class programs, apply for admission, and get instant answers from our AI-powered chatbot.
                    </p>
                    <div class="flex flex-col sm:flex-row gap-4 justify-center">
                        <button data-page="application" class="bg-white text-blue-700 font-bold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition shadow-lg">Apply Now →</button>
                        <button id="chatbot-home-toggle" class="border-2 border-white/50 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-white/10 transition">💬 Ask Chatbot</button>
                    </div>
                </div>
            </div>

            <!-- Stats Banner -->
            <div class="bg-white border-b">
                <div class="max-w-5xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div><div class="text-3xl font-extrabold text-blue-600">95%</div><div class="text-sm text-gray-500 mt-1">Placement Rate</div></div>
                    <div><div class="text-3xl font-extrabold text-blue-600">200+</div><div class="text-sm text-gray-500 mt-1">Partner Companies</div></div>
                    <div><div class="text-3xl font-extrabold text-blue-600">6</div><div class="text-sm text-gray-500 mt-1">Degree Programs</div></div>
                    <div><div class="text-3xl font-extrabold text-blue-600">50%</div><div class="text-sm text-gray-500 mt-1">Max Scholarship</div></div>
                </div>
            </div>

            <!-- Feature Cards -->
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h2 class="text-2xl font-bold text-gray-900 text-center mb-10">Everything You Need, In One Place</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div class="card text-center hover:shadow-xl transition group cursor-pointer" data-page="courses">
                        <div class="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-blue-600 transition">
                            <span class="text-2xl">🎓</span>
                        </div>
                        <h3 class="text-lg font-semibold mb-2">Explore Courses</h3>
                        <p class="text-gray-500 text-sm mb-5">Discover our 6 undergraduate and graduate degree programs with world-class faculty.</p>
                        <span class="text-blue-600 text-sm font-semibold">View Courses →</span>
                    </div>
                    <div class="card text-center hover:shadow-xl transition group cursor-pointer" data-page="fees">
                        <div class="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-green-600 transition">
                            <span class="text-2xl">💰</span>
                        </div>
                        <h3 class="text-lg font-semibold mb-2">Fees &amp; Scholarships</h3>
                        <p class="text-gray-500 text-sm mb-5">Transparent fee structures with generous merit-based and need-based scholarships.</p>
                        <span class="text-green-600 text-sm font-semibold">View Fee Structure →</span>
                    </div>
                    <div class="card text-center hover:shadow-xl transition group cursor-pointer" data-page="application">
                        <div class="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-purple-600 transition">
                            <span class="text-2xl">📋</span>
                        </div>
                        <h3 class="text-lg font-semibold mb-2">Apply Online</h3>
                        <p class="text-gray-500 text-sm mb-5">Simple, online admission application. Fill out the form and track your application status.</p>
                        <span class="text-purple-600 text-sm font-semibold">Start Application →</span>
                    </div>
                    <div class="card text-center hover:shadow-xl transition group cursor-pointer" data-page="track">
                        <div class="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-orange-500 transition">
                            <span class="text-2xl">🔍</span>
                        </div>
                        <h3 class="text-lg font-semibold mb-2">Track Application</h3>
                        <p class="text-gray-500 text-sm mb-5">Already applied? Check your application status instantly using your email or ID.</p>
                        <span class="text-orange-600 text-sm font-semibold">Track Status →</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ─── Courses Page (Dynamic) ───────────────────────────────────────────────────
async function loadCoursesPage(container) {
    container.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Our Courses</h1>
            <p class="text-gray-500 mb-10">Choose from our diverse portfolio of undergraduate and graduate programs.</p>
            <div id="courses-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                ${[1,2,3,4,5,6].map(() => `
                    <div class="card animate-pulse">
                        <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div class="h-3 bg-gray-200 rounded w-full mb-2"></div>
                        <div class="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                        <div class="h-3 bg-gray-100 rounded w-1/3"></div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    try {
        const courses = await getCourses();
        document.getElementById('courses-grid').innerHTML = courses.map(c => `
            <div class="card hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <div class="flex items-start justify-between mb-3">
                    <h3 class="text-lg font-semibold text-gray-900">${c.title}</h3>
                    <span class="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-1 rounded-full whitespace-nowrap ml-2">${c.duration}</span>
                </div>
                <p class="text-xs text-indigo-600 font-medium mb-3">${c.department}</p>
                <p class="text-gray-500 text-sm flex-1 mb-4">${c.description}</p>
                <div class="flex items-center justify-between border-t pt-4">
                    <span class="text-green-700 font-bold text-sm">${c.tuition_fee}</span>
                    <button data-page="application" class="text-blue-600 text-xs font-semibold hover:underline">Apply →</button>
                </div>
            </div>
        `).join('');
    } catch (e) {
        document.getElementById('courses-grid').innerHTML = `
            <div class="col-span-3 text-center py-16 text-gray-500">
                <p class="text-4xl mb-4">⚠️</p>
                <p class="font-medium">Could not load courses. Make sure the Flask backend is running.</p>
            </div>
        `;
    }
}

// ─── Fees Page (Dynamic) ──────────────────────────────────────────────────────
async function loadFeesPage(container) {
    container.innerHTML = `
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Fee Structure</h1>
            <p class="text-gray-500 mb-10">Transparent pricing with scholarship opportunities for eligible students.</p>
            <div id="fees-content">
                <div class="card animate-pulse h-64"></div>
            </div>
        </div>
    `;

    try {
        const fees = await getFees();
        document.getElementById('fees-content').innerHTML = `
            <div class="overflow-hidden rounded-2xl border border-gray-200 shadow-sm mb-10">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="bg-gray-50 text-gray-600 font-semibold text-left">
                            <th class="px-6 py-4">Program</th>
                            <th class="px-6 py-4">Tuition / Year</th>
                            <th class="px-6 py-4">Hostel Fee</th>
                            <th class="px-6 py-4">Other Fees</th>
                            <th class="px-6 py-4">Scholarships</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        ${fees.map((f, i) => `
                            <tr class="${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/50 transition">
                                <td class="px-6 py-4 font-semibold text-gray-900">${f.program}</td>
                                <td class="px-6 py-4 text-green-700 font-bold">${f.tuition_per_year}</td>
                                <td class="px-6 py-4 text-gray-600">${f.hostel_fee}</td>
                                <td class="px-6 py-4 text-gray-600">${f.other_fees}</td>
                                <td class="px-6 py-4 text-blue-600 text-xs">${f.scholarship_info}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="card bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                    <h3 class="font-bold text-blue-800 mb-2">💡 Merit Scholarship</h3>
                    <p class="text-sm text-blue-700">Students with a GPA of 3.7 or above qualify for up to <strong>50% tuition waiver</strong>.</p>
                </div>
                <div class="card bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
                    <h3 class="font-bold text-green-800 mb-2">🤝 Need-Based Aid</h3>
                    <p class="text-sm text-green-700">Financial aid is available. Contact <a href="mailto:admissions@greenfield.edu" class="underline">admissions@greenfield.edu</a> for applications.</p>
                </div>
            </div>
        `;
    } catch (e) {
        document.getElementById('fees-content').innerHTML = `
            <div class="text-center py-16 text-gray-500">
                <p class="text-4xl mb-4">⚠️</p>
                <p>Could not load fees. Make sure the Flask backend is running.</p>
            </div>
        `;
    }
}

// ─── Dates Page (Static) ──────────────────────────────────────────────────────
function getDatesContent() {
    return `
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Important Dates</h1>
            <p class="text-gray-500 mb-10">Mark your calendar with key admission deadlines and academic dates.</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="card border-l-4 border-blue-500">
                    <h3 class="text-xl font-semibold mb-5 text-blue-700">🍂 Fall 2026 Admission</h3>
                    <ul class="space-y-3">
                        ${[
                            ['Application Opens', 'March 15, 2026'],
                            ['Early Decision Deadline', 'April 15, 2026'],
                            ['Regular Deadline', 'June 30, 2026'],
                            ['Results Announcement', 'July 15, 2026'],
                            ['Classes Begin', 'August 25, 2026'],
                        ].map(([label, date]) => `
                            <li class="flex items-center justify-between border-b pb-2 last:border-0">
                                <span class="text-gray-600 text-sm">${label}</span>
                                <span class="font-semibold text-gray-900 text-sm">${date}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                <div class="card border-l-4 border-purple-500">
                    <h3 class="text-xl font-semibold mb-5 text-purple-700">❄️ Spring 2027 Admission</h3>
                    <ul class="space-y-3">
                        ${[
                            ['Application Opens', 'October 1, 2026'],
                            ['Deadline', 'November 30, 2026'],
                            ['Results Announcement', 'December 15, 2026'],
                            ['Classes Begin', 'January 10, 2027'],
                        ].map(([label, date]) => `
                            <li class="flex items-center justify-between border-b pb-2 last:border-0">
                                <span class="text-gray-600 text-sm">${label}</span>
                                <span class="font-semibold text-gray-900 text-sm">${date}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;
}

// ─── Track Application Page ───────────────────────────────────────────────────
function loadTrackPage(container) {
    container.innerHTML = `
        <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Track Your Application</h1>
            <p class="text-gray-500 mb-8">Enter your registered email address or application ID to check your status.</p>
            <div class="card shadow-lg">
                <form id="track-form" novalidate>
                    <div class="mb-5">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input id="track-email" type="email" class="input-field" placeholder="john@example.com">
                    </div>
                    <div class="flex items-center gap-3 mb-5">
                        <div class="flex-1 h-px bg-gray-200"></div>
                        <span class="text-xs text-gray-400 font-medium">OR</span>
                        <div class="flex-1 h-px bg-gray-200"></div>
                    </div>
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Application ID</label>
                        <input id="track-id" type="number" class="input-field" placeholder="e.g. 1042">
                    </div>
                    <button type="submit" id="track-btn" class="btn-primary w-full text-base py-3">
                        🔍 Check Status
                    </button>
                </form>
                <div id="track-result" class="mt-6 hidden"></div>
            </div>
        </div>
    `;

    document.getElementById('track-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        const email = document.getElementById('track-email').value.trim();
        const id = document.getElementById('track-id').value.trim();
        const btn = document.getElementById('track-btn');
        const result = document.getElementById('track-result');

        if (!email && !id) {
            showToast('Please enter your email or application ID.', 'warning');
            return;
        }

        btn.disabled = true;
        btn.innerHTML = `<span class="inline-block animate-spin mr-2">⟳</span> Checking...`;

        try {
            const data = await trackApplication(email ? { email } : { id });
            const statusColors = {
                Pending:  { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳' },
                Approved: { bg: 'bg-green-100',  text: 'text-green-800',  icon: '✅' },
                Rejected: { bg: 'bg-red-100',    text: 'text-red-800',    icon: '❌' },
            };
            const sc = statusColors[data.status] || statusColors.Pending;
            result.classList.remove('hidden');
            result.innerHTML = `
                <div class="border border-gray-200 rounded-xl p-5 space-y-3">
                    <div class="flex items-center justify-between">
                        <h3 class="font-bold text-gray-900 text-lg">${data.full_name}</h3>
                        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${sc.bg} ${sc.text}">
                            ${sc.icon} ${data.status}
                        </span>
                    </div>
                    <div class="grid grid-cols-2 gap-3 text-sm">
                        <div><span class="text-gray-500">Application ID</span><div class="font-semibold text-gray-900">#${data.id}</div></div>
                        <div><span class="text-gray-500">Program</span><div class="font-semibold text-gray-900">${data.program}</div></div>
                        <div><span class="text-gray-500">Email</span><div class="font-semibold text-gray-900">${data.email}</div></div>
                        <div><span class="text-gray-500">Applied On</span><div class="font-semibold text-gray-900">${data.created_at ? new Date(data.created_at).toLocaleDateString() : '–'}</div></div>
                    </div>
                    ${data.status === 'Pending' ? `<p class="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg p-3">⏳ Your application is under review. You will be notified via email once a decision is made.</p>` : ''}
                    ${data.status === 'Approved' ? `<p class="text-xs text-green-700 mt-2 bg-green-50 rounded-lg p-3">🎉 Congratulations! Your application has been approved. Please check your email for next steps.</p>` : ''}
                    ${data.status === 'Rejected' ? `<p class="text-xs text-red-700 mt-2 bg-red-50 rounded-lg p-3">We regret to inform you that your application was not successful this time. Contact admissions@greenfield.edu for feedback.</p>` : ''}
                </div>
            `;
        } catch (err) {
            result.classList.remove('hidden');
            result.innerHTML = `
                <div class="border border-red-200 bg-red-50 rounded-xl p-5 text-center">
                    <p class="text-2xl mb-2">🔍</p>
                    <p class="font-semibold text-red-700">No application found</p>
                    <p class="text-xs text-red-500 mt-1">${err.message || 'Please check your email or application ID and try again.'}</p>
                </div>
            `;
        } finally {
            btn.disabled = false;
            btn.innerHTML = '🔍 Check Status';
        }
    });
}

// ─── Application Page ─────────────────────────────────────────────────────────
function loadApplicationPage(container) {
    container.innerHTML = `
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Application Form</h1>
            <p class="text-gray-500 mb-8">Fill in the details below to submit your admission application to Greenfield University.</p>
            <div class="card shadow-lg">
                <form id="admission-form" novalidate>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                            <input id="field-full_name" type="text" name="full_name" required class="input-field" placeholder="John Doe">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                            <input id="field-email" type="email" name="email" required class="input-field" placeholder="john@example.com">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                            <input id="field-phone" type="tel" name="phone" required class="input-field" placeholder="+1 (555) 000-0000">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                            <input id="field-date_of_birth" type="date" name="date_of_birth" required class="input-field">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                            <select id="field-gender" name="gender" required class="input-field">
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Program *</label>
                            <select id="field-program" name="program" required class="input-field">
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
                        <textarea id="field-address" name="address" required class="input-field" rows="3" placeholder="Your full address..."></textarea>
                    </div>
                    <div class="mt-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Previous Institution *</label>
                        <input id="field-previous_institution" type="text" name="previous_institution" required class="input-field" placeholder="Name of your previous school/college">
                    </div>
                    <div class="mt-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">GPA (0–4.0)</label>
                        <input id="field-gpa" type="number" name="gpa" step="0.01" min="0" max="4" class="input-field" placeholder="e.g. 3.75">
                    </div>
                    <div class="mt-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Personal Statement</label>
                        <textarea id="field-personal_statement" name="personal_statement" class="input-field" rows="5" placeholder="Tell us about yourself, your goals, and why you want to join Greenfield University..."></textarea>
                    </div>
                    <div class="mt-8">
                        <button type="submit" id="submit-btn" class="btn-primary w-full text-base py-3">
                            Submit Application
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
let adminCurrentPage = 1;
const ADMIN_PAGE_SIZE = 10;
let adminAllAdmissions = [];

async function loadAdminPage(container) {
    container.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p class="text-gray-500 mt-1">Manage and review all submitted applications.</p>
                </div>
                <div class="flex items-center gap-3 flex-wrap">
                    <input id="admin-search" type="text" placeholder="Search by name, email, program..." class="input-field w-72 text-sm">
                    <select id="admin-filter" class="input-field w-36 text-sm">
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                    <button id="export-csv-btn" class="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition">
                        ⬇️ Export CSV
                    </button>
                </div>
            </div>
            <div id="admin-stats" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"></div>
            <div id="admin-table-container">
                <div class="card animate-pulse h-40"></div>
            </div>
            <div id="admin-pagination" class="flex justify-center gap-2 mt-6"></div>
        </div>
    `;

    try {
        adminAllAdmissions = await getAdmissions();
        adminCurrentPage = 1;
        renderAdminStats(adminAllAdmissions);
        renderFilteredTable();

        document.getElementById('admin-search').addEventListener('input', () => {
            adminCurrentPage = 1;
            renderFilteredTable();
        });
        document.getElementById('admin-filter').addEventListener('change', () => {
            adminCurrentPage = 1;
            renderFilteredTable();
        });
        document.getElementById('export-csv-btn').addEventListener('click', () => exportCSV(adminAllAdmissions));
    } catch (e) {
        document.getElementById('admin-table-container').innerHTML = `
            <div class="card text-center py-16 text-gray-500">
                <p class="text-4xl mb-4">⚠️</p>
                <p class="font-medium">Could not load admissions. Make sure the Flask backend is running.</p>
            </div>
        `;
    }
}

function renderFilteredTable() {
    const search = document.getElementById('admin-search').value.toLowerCase();
    const filter = document.getElementById('admin-filter').value;

    const filtered = adminAllAdmissions.filter(a => {
        const matchesSearch = !search
            || a.full_name.toLowerCase().includes(search)
            || a.email.toLowerCase().includes(search)
            || a.program.toLowerCase().includes(search);
        const matchesStatus = filter === 'All' || a.status === filter;
        return matchesSearch && matchesStatus;
    });

    renderAdminTable(filtered);
    renderPagination(filtered);
}

function renderAdminStats(admissions) {
    const total = admissions.length;
    const pending = admissions.filter(a => a.status === 'Pending').length;
    const approved = admissions.filter(a => a.status === 'Approved').length;
    const rejected = admissions.filter(a => a.status === 'Rejected').length;

    document.getElementById('admin-stats').innerHTML = `
        <div class="card text-center border-t-4 border-blue-500">
            <div class="text-3xl font-extrabold text-blue-600">${total}</div>
            <div class="text-sm text-gray-500 mt-1">Total Applications</div>
        </div>
        <div class="card text-center border-t-4 border-yellow-400">
            <div class="text-3xl font-extrabold text-yellow-500">${pending}</div>
            <div class="text-sm text-gray-500 mt-1">Pending</div>
        </div>
        <div class="card text-center border-t-4 border-green-500">
            <div class="text-3xl font-extrabold text-green-600">${approved}</div>
            <div class="text-sm text-gray-500 mt-1">Approved</div>
        </div>
        <div class="card text-center border-t-4 border-red-500">
            <div class="text-3xl font-extrabold text-red-600">${rejected}</div>
            <div class="text-sm text-gray-500 mt-1">Rejected</div>
        </div>
    `;
}

function renderAdminTable(admissions) {
    const statusBadge = {
        Pending:  'bg-yellow-100 text-yellow-800',
        Approved: 'bg-green-100 text-green-800',
        Rejected: 'bg-red-100 text-red-800',
    };

    if (admissions.length === 0) {
        document.getElementById('admin-table-container').innerHTML = `
            <div class="card text-center py-16 text-gray-400">
                <p class="text-4xl mb-4">📭</p>
                <p class="font-medium">No applications found.</p>
            </div>
        `;
        return;
    }

    // Paginate
    const start = (adminCurrentPage - 1) * ADMIN_PAGE_SIZE;
    const pageItems = admissions.slice(start, start + ADMIN_PAGE_SIZE);

    document.getElementById('admin-table-container').innerHTML = `
        <div class="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
            <table class="w-full text-sm">
                <thead>
                    <tr class="bg-gray-50 text-gray-500 font-semibold text-left text-xs uppercase tracking-wider">
                        <th class="px-5 py-3">Applicant</th>
                        <th class="px-5 py-3">Program</th>
                        <th class="px-5 py-3">GPA</th>
                        <th class="px-5 py-3">Date</th>
                        <th class="px-5 py-3">Status</th>
                        <th class="px-5 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 bg-white">
                    ${pageItems.map(a => `
                        <tr id="row-${a.id}" class="hover:bg-gray-50 transition">
                            <td class="px-5 py-4">
                                <div class="font-semibold text-gray-900">${a.full_name}</div>
                                <div class="text-xs text-gray-400">${a.email}</div>
                            </td>
                            <td class="px-5 py-4 text-gray-700">${a.program}</td>
                            <td class="px-5 py-4 text-gray-700">${a.gpa !== null ? a.gpa : '–'}</td>
                            <td class="px-5 py-4 text-gray-400 text-xs">${a.created_at ? new Date(a.created_at).toLocaleDateString() : '–'}</td>
                            <td class="px-5 py-4">
                                <span id="badge-${a.id}" class="inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge[a.status] || statusBadge.Pending}">
                                    ${a.status}
                                </span>
                            </td>
                            <td class="px-5 py-4">
                                <div class="flex gap-2">
                                    <button onclick="changeStatus(${a.id}, 'Approved')" class="text-xs bg-green-100 hover:bg-green-200 text-green-700 font-semibold px-3 py-1.5 rounded-lg transition">✓ Approve</button>
                                    <button onclick="changeStatus(${a.id}, 'Rejected')" class="text-xs bg-red-100 hover:bg-red-200 text-red-700 font-semibold px-3 py-1.5 rounded-lg transition">✕ Reject</button>
                                    <button onclick="changeStatus(${a.id}, 'Pending')" class="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-semibold px-3 py-1.5 rounded-lg transition">⟳ Reset</button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <p class="text-xs text-gray-400 mt-3 text-right">
            Showing ${start + 1}–${Math.min(start + ADMIN_PAGE_SIZE, admissions.length)} of ${admissions.length} applications
        </p>
    `;
}

function renderPagination(admissions) {
    const totalPages = Math.ceil(admissions.length / ADMIN_PAGE_SIZE);
    const paginationEl = document.getElementById('admin-pagination');

    if (totalPages <= 1) {
        paginationEl.innerHTML = '';
        return;
    }

    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `
            <button
                onclick="goToAdminPage(${i})"
                class="w-9 h-9 rounded-lg text-sm font-semibold transition
                    ${i === adminCurrentPage
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}"
            >${i}</button>
        `;
    }
    paginationEl.innerHTML = html;
}

function goToAdminPage(page) {
    adminCurrentPage = page;
    renderFilteredTable();
    document.getElementById('admin-table-container').scrollIntoView({ behavior: 'smooth' });
}

async function changeStatus(id, status) {
    try {
        await updateAdmissionStatus(id, status);

        // Update local data
        const record = adminAllAdmissions.find(a => a.id === id);
        if (record) record.status = status;

        const badge = document.getElementById(`badge-${id}`);
        const statusBadge = {
            Pending:  'bg-yellow-100 text-yellow-800',
            Approved: 'bg-green-100 text-green-800',
            Rejected: 'bg-red-100 text-red-800',
        };
        if (badge) {
            badge.textContent = status;
            badge.className = `inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge[status]}`;
        }
        renderAdminStats(adminAllAdmissions);
        showToast(`Application ${status.toLowerCase()} successfully!`, status === 'Approved' ? 'success' : status === 'Rejected' ? 'error' : 'info');
    } catch (e) {
        showToast('Failed to update status. Is the backend running?', 'error');
    }
}

// ─── CSV Export ───────────────────────────────────────────────────────────────
function exportCSV(admissions) {
    if (!admissions || admissions.length === 0) {
        showToast('No data to export.', 'warning');
        return;
    }

    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Gender', 'Program', 'Previous Institution', 'GPA', 'Status', 'Applied On'];
    const rows = admissions.map(a => [
        a.id,
        `"${a.full_name}"`,
        a.email,
        a.phone,
        a.gender,
        `"${a.program}"`,
        `"${a.previous_institution || ''}"`,
        a.gpa !== null ? a.gpa : '',
        a.status,
        a.created_at ? new Date(a.created_at).toLocaleDateString() : ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `greenfield_admissions_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('CSV exported successfully!', 'success');
}

// ─── Form Submission ──────────────────────────────────────────────────────────
document.addEventListener('submit', function (e) {
    if (e.target.id === 'admission-form') {
        e.preventDefault();
        handleFormSubmit(e.target);
    }
});

async function handleFormSubmit(form) {
    const btn = document.getElementById('submit-btn');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // ── Required field validation ──────────────────────────────────────────────
    const requiredFields = [
        { name: 'full_name',             label: 'Full Name' },
        { name: 'email',                 label: 'Email' },
        { name: 'phone',                 label: 'Phone' },
        { name: 'date_of_birth',         label: 'Date of Birth' },
        { name: 'gender',                label: 'Gender' },
        { name: 'program',               label: 'Program' },
        { name: 'address',               label: 'Address' },
        { name: 'previous_institution',  label: 'Previous Institution' },
    ];

    for (const field of requiredFields) {
        if (!data[field.name] || !data[field.name].trim()) {
            showToast(`${field.label} is required.`, 'warning');
            document.getElementById(`field-${field.name}`)?.focus();
            return;
        }
    }

    // ── Email format validation ────────────────────────────────────────────────
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        showToast('Please enter a valid email address.', 'warning');
        document.getElementById('field-email')?.focus();
        return;
    }

    // ── Phone validation ──────────────────────────────────────────────────────
    const phone = data.phone || '';
    if (!/^\+?[\d\s\-().]{7,20}$/.test(phone)) {
        showToast('Please enter a valid phone number.', 'warning');
        return;
    }

    // ── GPA validation ─────────────────────────────────────────────────────────
    if (data.gpa && (parseFloat(data.gpa) < 0 || parseFloat(data.gpa) > 4)) {
        showToast('GPA must be between 0.00 and 4.00.', 'warning');
        return;
    }

    // ── Submit ─────────────────────────────────────────────────────────────────
    btn.disabled = true;
    btn.innerHTML = `<span class="inline-block animate-spin mr-2">⟳</span> Submitting...`;

    try {
        await submitAdmission(data);
        showToast('Application submitted successfully! We will contact you soon.', 'success');
        form.reset();
    } catch (error) {
        const msg = error.message || 'Error submitting application.';
        showToast(msg.includes('already exists') ? '⚠️ An application with this email already exists.' : msg, 'error');
        console.error(error);
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Submit Application';
    }
}

// Chatbot home toggle
document.addEventListener('click', function (e) {
    if (e.target.id === 'chatbot-home-toggle') toggleChatbot();
});