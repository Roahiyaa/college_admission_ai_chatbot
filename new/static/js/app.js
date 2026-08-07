// app.js - Amrita Vishwa Vidyapeetham Admissions Portal
document.addEventListener('DOMContentLoaded', function () {
    loadHeader();
    loadFooter();
    loadPage('home');

    // Scroll-reveal observer
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    // Re-apply observer after each page load
    window._revealObserver = revealObserver;

    // Delegate navigation clicks
    document.addEventListener('click', function (e) {
        if (e.target.matches('[data-page]') || e.target.closest('[data-page]')) {
            const el = e.target.matches('[data-page]') ? e.target : e.target.closest('[data-page]');
            e.preventDefault();
            const page = el.getAttribute('data-page');
            loadPage(page);
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu) mobileMenu.classList.add('hidden');
        }
    });
});

function applyReveal() {
    setTimeout(() => {
        document.querySelectorAll('.reveal').forEach(el => {
            window._revealObserver && window._revealObserver.observe(el);
        });
    }, 50);
}

// ─── Admin PIN ─────────────────────────────────────────────────────────────────
const ADMIN_PIN = 'admin123';
let adminUnlocked = false;

function promptAdminPin(onSuccess) {
    if (adminUnlocked) { onSuccess(); return; }

    const overlay = document.createElement('div');
    overlay.id = 'pin-overlay';
    overlay.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] flex items-center justify-center';
    overlay.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4">
            <div class="text-center mb-6">
                <div class="w-16 h-16 bg-crimson-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span class="text-3xl">🔐</span>
                </div>
                <h2 class="text-xl font-bold text-gray-900" style="font-family:'Playfair Display',serif;">Admin Access</h2>
                <p class="text-sm text-gray-500 mt-1">Enter the admin PIN to continue</p>
            </div>
            <input
                id="pin-input"
                type="password"
                placeholder="Enter PIN"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-crimson-500 focus:border-transparent text-center tracking-widest mb-4"
                maxlength="20"
                autocomplete="off"
            >
            <p id="pin-error" class="text-red-500 text-xs text-center mb-3 hidden">Incorrect PIN. Please try again.</p>
            <div class="flex gap-3">
                <button id="pin-cancel" class="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition text-sm">Cancel</button>
                <button id="pin-submit" class="flex-1 py-2.5 bg-crimson-600 hover:bg-crimson-700 text-white font-semibold rounded-xl transition text-sm">Unlock</button>
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
        success: 'bg-emerald-600',
        error:   'bg-crimson-600',
        info:    'bg-blue-600',
        warning: 'bg-amber-500',
    };

    const icons = {
        success: '✓',
        error:   '✕',
        info:    'ℹ',
        warning: '⚠',
    };

    const toast = document.createElement('div');
    toast.className = `flex items-center gap-3 ${colors[type] || colors.info} text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium transition-all duration-300 translate-x-20 opacity-0 max-w-xs`;
    toast.innerHTML = `<span class="text-base font-bold">${icons[type]}</span><span>${message}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.classList.remove('translate-x-20', 'opacity-0');
        });
    });

    setTimeout(() => {
        toast.classList.add('translate-x-20', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ─── Header ───────────────────────────────────────────────────────────────────
function loadHeader() {
    const header = document.getElementById('header');
    header.innerHTML = `
        <div class="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center py-3">
                    <div class="flex items-center gap-3 cursor-pointer" data-page="home">
                        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-crimson-700 to-crimson-900 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            <span style="font-family:'Playfair Display',serif; font-size:16px;">A</span>
                        </div>
                        <div>
                            <div class="text-base font-bold text-crimson-800 leading-tight" style="font-family:'Playfair Display',serif;">Amrita Vishwa Vidyapeetham</div>
                            <div class="text-xs text-gray-500 leading-tight">Coimbatore Campus · Admissions Portal</div>
                        </div>
                    </div>
                    <nav class="hidden md:flex items-center space-x-1">
                        <a href="#" data-page="home" class="nav-link">Home</a>
                        <a href="#" data-page="about" class="nav-link">About</a>
                        <a href="#" data-page="courses" class="nav-link">Courses</a>
                        <a href="#" data-page="fees" class="nav-link">Fees</a>
                        <a href="#" data-page="dates" class="nav-link">Dates</a>
                        <a href="#" data-page="track" class="nav-link">Track</a>
                        <a href="#" data-page="application" class="nav-link">Apply</a>
                        <a href="#" data-page="admin" class="nav-link">Admin</a>
                        <button id="chatbot-toggle" class="ml-2 bg-crimson-600 hover:bg-crimson-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200 shadow-sm">
                            💬 Ask AI
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
                    <a href="#" data-page="about" class="block nav-link">About Amrita</a>
                    <a href="#" data-page="courses" class="block nav-link">Courses</a>
                    <a href="#" data-page="fees" class="block nav-link">Fees</a>
                    <a href="#" data-page="dates" class="block nav-link">Important Dates</a>
                    <a href="#" data-page="track" class="block nav-link">Track Application</a>
                    <a href="#" data-page="application" class="block nav-link">Apply Now</a>
                    <a href="#" data-page="admin" class="block nav-link">Admin Dashboard</a>
                    <button id="chatbot-toggle-mobile" class="w-full mt-2 bg-crimson-600 hover:bg-crimson-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200">
                        💬 Open AI Chatbot
                    </button>
                </div>
            </div>
        </div>
        <!-- NAAC Topbar -->
        <div class="bg-crimson-700 text-white text-xs py-1.5 px-4 text-center">
            🏆 NAAC A++ Accredited &nbsp;|&nbsp; 🌏 NIRF Top 10 Engineering &nbsp;|&nbsp; ✨ AEEE 2026 Applications Open — <a href="#" data-page="application" class="underline font-semibold">Apply Now</a>
        </div>
    `;

    document.getElementById('mobile-menu-button').addEventListener('click', function () {
        const menu = document.getElementById('mobile-menu');
        menu.classList.toggle('hidden');
    });

    document.getElementById('chatbot-toggle').addEventListener('click', toggleChatbot);

    document.addEventListener('click', function (e) {
        if (e.target.id === 'chatbot-toggle-mobile') toggleChatbot();
    });
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function loadFooter() {
    const footer = document.getElementById('footer');
    footer.innerHTML = `
        <div class="bg-amrita-navy text-white py-14 mt-20">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
                    <div class="md:col-span-2">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-crimson-600 to-crimson-900 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                <span style="font-family:'Playfair Display',serif;">A</span>
                            </div>
                            <div>
                                <div class="font-bold text-lg leading-tight" style="font-family:'Playfair Display',serif;">Amrita Vishwa Vidyapeetham</div>
                                <div class="text-gray-400 text-xs">Coimbatore Campus</div>
                            </div>
                        </div>
                        <p class="text-gray-400 text-sm leading-relaxed max-w-xs">NAAC A++ accredited deemed university. Shaping future leaders through excellence in education, research, and values since 1994.</p>
                        <div class="flex gap-3 mt-5">
                            <span class="badge bg-crimson-800 text-crimson-200 text-xs px-2 py-1 rounded-full">NAAC A++</span>
                            <span class="badge bg-gold-800 text-gold-200 text-xs px-2 py-1 rounded-full">NIRF Top 10</span>
                            <span class="badge bg-gray-700 text-gray-200 text-xs px-2 py-1 rounded-full">14 Campuses</span>
                        </div>
                    </div>
                    <div>
                        <h3 class="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Quick Links</h3>
                        <ul class="space-y-2">
                            <li><a href="#" data-page="courses" class="text-gray-400 hover:text-white text-sm transition">Courses & Programs</a></li>
                            <li><a href="#" data-page="fees" class="text-gray-400 hover:text-white text-sm transition">Fees & Scholarships</a></li>
                            <li><a href="#" data-page="application" class="text-gray-400 hover:text-white text-sm transition">Apply Online</a></li>
                            <li><a href="#" data-page="dates" class="text-gray-400 hover:text-white text-sm transition">Important Dates</a></li>
                            <li><a href="#" data-page="track" class="text-gray-400 hover:text-white text-sm transition">Track Application</a></li>
                            <li><a href="#" data-page="about" class="text-gray-400 hover:text-white text-sm transition">About Amrita</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Contact Us</h3>
                        <ul class="space-y-3 text-gray-400 text-sm">
                            <li class="flex items-start gap-2"><span>📧</span><span>admissions@amrita.edu</span></li>
                            <li class="flex items-start gap-2"><span>📞</span><span>0422-2685000</span></li>
                            <li class="flex items-start gap-2"><span>🕑</span><span>Mon–Sat, 9 AM – 5 PM</span></li>
                            <li class="flex items-start gap-2"><span>📍</span><span>Amritanagar, Coimbatore – 641112, Tamil Nadu</span></li>
                            <li class="flex items-start gap-2"><span>🌐</span><a href="https://www.amrita.edu" target="_blank" class="hover:text-white transition">www.amrita.edu</a></li>
                        </ul>
                    </div>
                </div>
                <div class="pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
                    &copy; 2026 Amrita Vishwa Vidyapeetham – All rights reserved. | Admissions AI Portal
                </div>
            </div>
        </div>
    `;
}

// ─── Page Router ──────────────────────────────────────────────────────────────
function loadPage(page) {
    const mainContent = document.getElementById('main-content');

    document.querySelectorAll('[data-page]').forEach(link => link.classList.remove('active'));
    document.querySelectorAll(`[data-page="${page}"]`).forEach(el => el.classList.add('active'));

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (page === 'admin') {
        promptAdminPin(() => _renderPage(page, mainContent));
    } else {
        _renderPage(page, mainContent);
    }
}

function _renderPage(page, mainContent) {
    switch (page) {
        case 'home':        loadHomePage(mainContent);        break;
        case 'about':       loadAboutPage(mainContent);       break;
        case 'courses':     loadCoursesPage(mainContent);     break;
        case 'fees':        loadFeesPage(mainContent);        break;
        case 'dates':       mainContent.innerHTML = getDatesContent(); applyReveal(); break;
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
            <div class="hero-gradient hero-pattern text-white py-28 px-4 relative overflow-hidden">
                <div class="absolute inset-0 opacity-10"
                    style="background-image: radial-gradient(circle at 20% 50%, white 1px, transparent 1px),
                    radial-gradient(circle at 80% 20%, white 1px, transparent 1px);
                    background-size: 60px 60px;">
                </div>
                <div class="max-w-6xl mx-auto relative z-10">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <span class="inline-block bg-white/20 backdrop-blur text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wider uppercase">
                                🎓 AEEE 2026 Applications Open
                            </span>
                            <h1 class="text-4xl md:text-5xl xl:text-6xl font-bold mb-6 leading-tight" style="font-family:'Playfair Display',serif;">
                                Welcome to<br><span class="text-gold-300">Amrita Vishwa</span><br>Vidyapeetham
                            </h1>
                            <p class="text-lg text-red-100 max-w-xl mb-8 leading-relaxed">
                                NAAC A++ | India's top deemed university. World-class B.Tech, MBA, and MBBS programs at our Coimbatore flagship campus.
                            </p>
                            <div class="flex flex-col sm:flex-row gap-4">
                                <button data-page="application" class="bg-white text-crimson-700 font-bold px-8 py-3.5 rounded-xl hover:bg-red-50 transition shadow-lg text-base">
                                    Apply Now →
                                </button>
                                <button id="chatbot-home-toggle" class="border-2 border-white/50 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-white/10 transition text-base">
                                    💬 Ask AI Chatbot
                                </button>
                            </div>
                            <div class="flex flex-wrap gap-3 mt-8">
                                <span class="bg-white/15 text-white text-xs px-3 py-1.5 rounded-full border border-white/20">NAAC A++ Accredited</span>
                                <span class="bg-white/15 text-white text-xs px-3 py-1.5 rounded-full border border-white/20">NIRF Top 10</span>
                                <span class="bg-white/15 text-white text-xs px-3 py-1.5 rounded-full border border-white/20">35,000+ Students</span>
                                <span class="bg-white/15 text-white text-xs px-3 py-1.5 rounded-full border border-white/20">14 Campuses</span>
                            </div>
                        </div>
                        <div class="hidden lg:block">
                            <div class="relative">
                                <img src="images/campus_hero.png" alt="Amrita Campus Coimbatore"
                                    class="rounded-2xl shadow-2xl w-full object-cover border-4 border-white/20"
                                    style="height: 360px; object-fit: cover;">
                                <div class="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                                    <div class="w-10 h-10 bg-crimson-100 rounded-xl flex items-center justify-center text-xl">🏆</div>
                                    <div>
                                        <div class="text-xs text-gray-500">Ranked</div>
                                        <div class="font-bold text-gray-900 text-sm">NIRF Top 10 Engineering</div>
                                    </div>
                                </div>
                                <div class="absolute -top-4 -right-4 bg-gold-500 text-white rounded-2xl shadow-xl p-4 text-center">
                                    <div class="text-2xl font-bold" style="font-family:'Playfair Display',serif;">A++</div>
                                    <div class="text-xs font-semibold">NAAC Grade</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Stats Banner -->
            <div class="bg-white border-b shadow-sm">
                <div class="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div class="reveal">
                        <div class="text-3xl font-extrabold text-crimson-700" style="font-family:'Playfair Display',serif;">5000+</div>
                        <div class="text-sm text-gray-500 mt-1">Annual Placements</div>
                    </div>
                    <div class="reveal" style="transition-delay: 0.1s;">
                        <div class="text-3xl font-extrabold text-crimson-700" style="font-family:'Playfair Display',serif;">500+</div>
                        <div class="text-sm text-gray-500 mt-1">Recruiting Companies</div>
                    </div>
                    <div class="reveal" style="transition-delay: 0.2s;">
                        <div class="text-3xl font-extrabold text-crimson-700" style="font-family:'Playfair Display',serif;">35,000+</div>
                        <div class="text-sm text-gray-500 mt-1">Students Enrolled</div>
                    </div>
                    <div class="reveal" style="transition-delay: 0.3s;">
                        <div class="text-3xl font-extrabold text-crimson-700" style="font-family:'Playfair Display',serif;">100%</div>
                        <div class="text-sm text-gray-500 mt-1">Vidyamritam Scholarship</div>
                    </div>
                </div>
            </div>

            <!-- Feature Cards -->
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div class="text-center mb-14 reveal">
                    <h2 class="section-title mb-3">Everything You Need, In One Place</h2>
                    <p class="section-subtitle">Your complete guide to Amrita admissions</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="card-hover text-center cursor-pointer reveal" data-page="courses">
                        <div class="w-14 h-14 bg-crimson-100 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-crimson-600 transition">
                            <span class="text-2xl">🎓</span>
                        </div>
                        <h3 class="text-lg font-semibold mb-2" style="font-family:'Playfair Display',serif;">Explore Courses</h3>
                        <p class="text-gray-500 text-sm mb-5">B.Tech, M.Tech, MBA, MBBS and more from Amrita's world-class schools.</p>
                        <span class="text-crimson-600 text-sm font-semibold">View Courses →</span>
                    </div>
                    <div class="card-hover text-center cursor-pointer reveal" style="transition-delay:0.1s;" data-page="fees">
                        <div class="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5 transition">
                            <span class="text-2xl">💰</span>
                        </div>
                        <h3 class="text-lg font-semibold mb-2" style="font-family:'Playfair Display',serif;">Fees & Scholarships</h3>
                        <p class="text-gray-500 text-sm mb-5">Transparent INR fee structures and the Vidyamritam Scholarship (up to 100%).</p>
                        <span class="text-emerald-600 text-sm font-semibold">View Fee Structure →</span>
                    </div>
                    <div class="card-hover text-center cursor-pointer reveal" style="transition-delay:0.2s;" data-page="application">
                        <div class="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-5 transition">
                            <span class="text-2xl">📋</span>
                        </div>
                        <h3 class="text-lg font-semibold mb-2" style="font-family:'Playfair Display',serif;">Apply Online</h3>
                        <p class="text-gray-500 text-sm mb-5">Fill out the admission form and track your application status instantly.</p>
                        <span class="text-purple-600 text-sm font-semibold">Start Application →</span>
                    </div>
                    <div class="card-hover text-center cursor-pointer reveal" style="transition-delay:0.3s;" data-page="track">
                        <div class="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-5 transition">
                            <span class="text-2xl">🔍</span>
                        </div>
                        <h3 class="text-lg font-semibold mb-2" style="font-family:'Playfair Display',serif;">Track Application</h3>
                        <p class="text-gray-500 text-sm mb-5">Already applied? Check your admission status using your email or ID.</p>
                        <span class="text-orange-600 text-sm font-semibold">Track Status →</span>
                    </div>
                </div>
            </div>

            <!-- Campus Gallery -->
            <div class="bg-amrita-cream py-20 px-4">
                <div class="max-w-7xl mx-auto">
                    <div class="text-center mb-14 reveal">
                        <h2 class="section-title mb-3">Campus Life at Amrita</h2>
                        <p class="section-subtitle">400+ acres of world-class facilities in Coimbatore</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="gallery-img reveal">
                            <img src="images/campus_hero.png" alt="Amrita Campus" class="w-full h-56 object-cover rounded-2xl">
                            <div class="mt-3 px-1">
                                <div class="font-semibold text-gray-900 text-sm">Main Campus</div>
                                <div class="text-gray-500 text-xs">400+ acres, Coimbatore</div>
                            </div>
                        </div>
                        <div class="gallery-img reveal" style="transition-delay:0.15s;">
                            <img src="images/campus_library.png" alt="Amrita Library" class="w-full h-56 object-cover rounded-2xl">
                            <div class="mt-3 px-1">
                                <div class="font-semibold text-gray-900 text-sm">Central Library</div>
                                <div class="text-gray-500 text-xs">1 lakh+ books, digital resources</div>
                            </div>
                        </div>
                        <div class="gallery-img reveal" style="transition-delay:0.3s;">
                            <img src="images/campus_lab.png" alt="Amrita Labs" class="w-full h-56 object-cover rounded-2xl">
                            <div class="mt-3 px-1">
                                <div class="font-semibold text-gray-900 text-sm">High-Tech Labs</div>
                                <div class="text-gray-500 text-xs">AI, Robotics, and Research Centers</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Testimonials -->
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div class="text-center mb-14 reveal">
                    <h2 class="section-title mb-3">What Our Students Say</h2>
                    <p class="section-subtitle">Hear from the Amrita community</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="testimonial-card reveal">
                        <p class="text-gray-600 text-sm leading-relaxed mb-5">Amrita gave me the foundation to land a role at Amazon. The faculty, labs, and placement support are truly world-class. I'm proud to be an Amritian!</p>
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-crimson-100 flex items-center justify-center text-crimson-700 font-bold text-sm">RK</div>
                            <div>
                                <div class="font-semibold text-gray-900 text-sm">Rahul Kumar</div>
                                <div class="text-xs text-gray-500">B.Tech CSE, 2023 · Amazon SDE</div>
                            </div>
                        </div>
                    </div>
                    <div class="testimonial-card reveal" style="transition-delay:0.15s;">
                        <p class="text-gray-600 text-sm leading-relaxed mb-5">The research environment at Amrita is outstanding. I published two papers in international journals during my M.Tech — something I never imagined possible.</p>
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">PS</div>
                            <div>
                                <div class="font-semibold text-gray-900 text-sm">Priya Subramanian</div>
                                <div class="text-xs text-gray-500">M.Tech AI, 2024 · Google Researcher</div>
                            </div>
                        </div>
                    </div>
                    <div class="testimonial-card reveal" style="transition-delay:0.3s;">
                        <p class="text-gray-600 text-sm leading-relaxed mb-5">The Vidyamritam Scholarship made Amrita accessible for me. I received 80% fee waiver based on my AEEE rank, and the ROI has been incredible.</p>
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">AN</div>
                            <div>
                                <div class="font-semibold text-gray-900 text-sm">Aravind Nair</div>
                                <div class="text-xs text-gray-500">B.Tech ECE, 2024 · Microsoft</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- CTA Banner -->
            <div class="hero-gradient py-16 px-4 text-center">
                <div class="max-w-3xl mx-auto">
                    <h2 class="text-3xl md:text-4xl font-bold text-white mb-4" style="font-family:'Playfair Display',serif;">Ready to Begin Your Journey?</h2>
                    <p class="text-red-100 mb-8 text-lg">Apply for AEEE 2026 and take your first step towards a world-class education.</p>
                    <div class="flex flex-col sm:flex-row gap-4 justify-center">
                        <button data-page="application" class="bg-white text-crimson-700 font-bold px-8 py-3.5 rounded-xl hover:bg-red-50 transition shadow-lg">
                            Apply Now →
                        </button>
                        <button data-page="courses" class="border-2 border-white/50 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-white/10 transition">
                            Explore Programs
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    applyReveal();
    document.getElementById('chatbot-home-toggle')?.addEventListener('click', toggleChatbot);
}

// ─── About Page ───────────────────────────────────────────────────────────────
function loadAboutPage(container) {
    container.innerHTML = `
        <div>
            <!-- Hero -->
            <div class="hero-gradient hero-pattern text-white py-20 px-4">
                <div class="max-w-4xl mx-auto text-center">
                    <h1 class="text-4xl md:text-5xl font-bold mb-4" style="font-family:'Playfair Display',serif;">About Amrita Vishwa Vidyapeetham</h1>
                    <p class="text-red-100 text-lg">India's top-ranked deemed university — a legacy of excellence since 1994</p>
                </div>
            </div>

            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

                <!-- Key Facts -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                    ${[
                        ['🏛️', '1994', 'Established'],
                        ['🎓', '35,000+', 'Students'],
                        ['🏫', '14', 'Campuses'],
                        ['👩‍🏫', '4,000+', 'Faculty Members'],
                    ].map(([icon, stat, label]) => `
                        <div class="card text-center border-t-4 border-crimson-600 reveal">
                            <div class="text-3xl mb-2">${icon}</div>
                            <div class="text-3xl font-bold text-crimson-700 mb-1" style="font-family:'Playfair Display',serif;">${stat}</div>
                            <div class="text-sm text-gray-500">${label}</div>
                        </div>
                    `).join('')}
                </div>

                <!-- About Content -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
                    <div class="reveal">
                        <h2 class="section-title mb-4">A Legacy of Excellence</h2>
                        <p class="text-gray-600 leading-relaxed mb-4">Amrita Vishwa Vidyapeetham, founded in 1994 under the guidance of Sri Mata Amritanandamayi Devi (Amma), is one of India's highest-ranked deemed universities. The Coimbatore campus is the flagship campus, home to the renowned School of Engineering.</p>
                        <p class="text-gray-600 leading-relaxed mb-6">Amrita is rated <strong class="text-crimson-700">NAAC A++</strong> — the highest accreditation in India — and consistently ranks in the <strong class="text-crimson-700">NIRF Top 10</strong> engineering colleges. With 14 campuses across India and global research collaborations, Amrita prepares students for a borderless world.</p>
                        <div class="flex flex-wrap gap-2">
                            <span class="badge-crimson">NAAC A++</span>
                            <span class="badge-gold">NIRF Top 10 Engineering</span>
                            <span class="badge bg-purple-100 text-purple-700">QS World Rankings</span>
                            <span class="badge bg-blue-100 text-blue-700">14 Campuses</span>
                        </div>
                    </div>
                    <div class="reveal" style="transition-delay:0.2s;">
                        <img src="images/campus_graduation.png" alt="Amrita Graduation" class="rounded-2xl shadow-xl w-full object-cover" style="height:320px; object-fit:cover;">
                    </div>
                </div>

                <!-- Schools / Departments -->
                <div class="reveal mb-16">
                    <h2 class="section-title text-center mb-10">Schools & Departments</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${[
                            ['🔬', 'School of Engineering', 'B.Tech, M.Tech in CSE, ECE, Mechanical, Civil & more', 'bg-crimson-50 border-crimson-200'],
                            ['🏥', 'Amrita Institute of Medical Sciences', 'MBBS, MD, MS — top-10 hospital in India', 'bg-rose-50 border-rose-200'],
                            ['💼', 'Amrita School of Business', 'MBA with specialisations in Finance, Marketing, HR, Analytics', 'bg-blue-50 border-blue-200'],
                            ['🧬', 'School of Biotechnology', 'Bioinformatics, Genetic Engineering, Life Sciences', 'bg-emerald-50 border-emerald-200'],
                            ['🎨', 'School of Arts & Sciences', 'Physics, Chemistry, Mathematics, Literature', 'bg-purple-50 border-purple-200'],
                            ['🌐', 'Centre for Cybersecurity', 'AI-driven Cybersecurity, Digital Forensics, Ethical Hacking', 'bg-orange-50 border-orange-200'],
                        ].map(([icon, name, desc, bg]) => `
                            <div class="card border ${bg} reveal">
                                <div class="text-2xl mb-3">${icon}</div>
                                <h3 class="font-semibold text-gray-900 mb-2 text-sm" style="font-family:'Playfair Display',serif;">${name}</h3>
                                <p class="text-gray-500 text-xs leading-relaxed">${desc}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Highlights -->
                <div class="bg-amrita-cream rounded-3xl p-8 md:p-12 reveal">
                    <h2 class="section-title text-center mb-10">Why Choose Amrita?</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        ${[
                            ['🏆', 'Accreditations', 'NAAC A++ rated, NIRF Top 10 Engineering, QS World Rankings.'],
                            ['🔭', 'Research Excellence', '2000+ research publications/year, collaborative projects with NASA, MIT, and IITs.'],
                            ['💡', 'Innovation Ecosystem', '25+ research centers, startup incubators, and innovation hubs on campus.'],
                            ['🌍', 'Global Exposure', 'Study abroad programs, international internships, and global faculty collaborations.'],
                            ['🏥', 'Integrated Hospital', 'Amrita Hospitals — India\'s top-ranked multi-speciality hospital on campus.'],
                            ['💛', 'Values-Based Education', 'Founded by Amma — holistic education integrating academics with human values.'],
                        ].map(([icon, title, desc]) => `
                            <div class="flex gap-4 items-start">
                                <div class="w-12 h-12 bg-crimson-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">${icon}</div>
                                <div>
                                    <div class="font-semibold text-gray-900 mb-1" style="font-family:'Playfair Display',serif;">${title}</div>
                                    <p class="text-gray-500 text-sm leading-relaxed">${desc}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    applyReveal();
}

// ─── Courses Page (Dynamic) ───────────────────────────────────────────────────
async function loadCoursesPage(container) {
    container.innerHTML = `
        <div>
            <div class="hero-gradient hero-pattern text-white py-16 px-4">
                <div class="max-w-4xl mx-auto text-center">
                    <h1 class="text-4xl md:text-5xl font-bold mb-3" style="font-family:'Playfair Display',serif;">Our Programs</h1>
                    <p class="text-red-100 text-lg">Explore Amrita's diverse portfolio of undergraduate and postgraduate programs</p>
                </div>
            </div>
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
        </div>
    `;

    const courseIcons = {
        'Computer Science': '💻',
        'Artificial Intelligence': '🤖',
        'Cybersecurity': '🔐',
        'Electronics': '📡',
        'Mechanical': '⚙️',
        'Civil': '🏗️',
        'M.Tech': '🔬',
        'MBA': '💼',
        'MBBS': '🏥',
    };

    function getCourseIcon(title) {
        for (const [key, icon] of Object.entries(courseIcons)) {
            if (title.includes(key)) return icon;
        }
        return '🎓';
    }

    const courseColors = [
        'from-crimson-50 to-crimson-100 border-crimson-200',
        'from-blue-50 to-indigo-100 border-blue-200',
        'from-emerald-50 to-emerald-100 border-emerald-200',
        'from-purple-50 to-purple-100 border-purple-200',
        'from-orange-50 to-orange-100 border-orange-200',
        'from-rose-50 to-rose-100 border-rose-200',
        'from-cyan-50 to-cyan-100 border-cyan-200',
        'from-amber-50 to-amber-100 border-amber-200',
        'from-pink-50 to-pink-100 border-pink-200',
    ];

    try {
        const courses = await getCourses();
        document.getElementById('courses-grid').innerHTML = courses.map((c, i) => `
            <div class="card hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1 border bg-gradient-to-br ${courseColors[i % courseColors.length]}">
                <div class="flex items-start justify-between mb-4">
                    <div class="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl">${getCourseIcon(c.title)}</div>
                    <span class="badge-crimson">${c.duration}</span>
                </div>
                <h3 class="text-base font-bold text-gray-900 mb-1" style="font-family:'Playfair Display',serif;">${c.title}</h3>
                <p class="text-xs text-crimson-700 font-medium mb-3">${c.department}</p>
                <p class="text-gray-500 text-sm flex-1 mb-4 leading-relaxed">${c.description}</p>
                <div class="flex items-center justify-between border-t pt-4 mt-auto">
                    <span class="text-emerald-700 font-bold text-sm">${c.tuition_fee}</span>
                    <button data-page="application" class="text-crimson-600 text-xs font-semibold hover:underline">Apply →</button>
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
        <div>
            <div class="hero-gradient hero-pattern text-white py-16 px-4">
                <div class="max-w-4xl mx-auto text-center">
                    <h1 class="text-4xl md:text-5xl font-bold mb-3" style="font-family:'Playfair Display',serif;">Fee Structure</h1>
                    <p class="text-red-100 text-lg">Transparent pricing with generous scholarship opportunities</p>
                </div>
            </div>
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div id="fees-content">
                    <div class="card animate-pulse h-64"></div>
                </div>
            </div>
        </div>
    `;

    try {
        const fees = await getFees();
        document.getElementById('fees-content').innerHTML = `
            <div class="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm mb-10">
                <table class="w-full text-sm min-w-[700px]">
                    <thead>
                        <tr class="bg-crimson-700 text-white font-semibold text-left">
                            <th class="px-6 py-4">Program</th>
                            <th class="px-6 py-4">Tuition / Year</th>
                            <th class="px-6 py-4">Hostel Fee</th>
                            <th class="px-6 py-4">Other Fees</th>
                            <th class="px-6 py-4">Scholarships</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        ${fees.map((f, i) => `
                            <tr class="${i % 2 === 0 ? 'bg-white' : 'bg-crimson-50/30'} hover:bg-crimson-50 transition">
                                <td class="px-6 py-4 font-semibold text-gray-900">${f.program}</td>
                                <td class="px-6 py-4 text-emerald-700 font-bold">${f.tuition_per_year}</td>
                                <td class="px-6 py-4 text-gray-600">${f.hostel_fee}</td>
                                <td class="px-6 py-4 text-gray-600">${f.other_fees}</td>
                                <td class="px-6 py-4 text-crimson-700 text-xs">${f.scholarship_info}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="card bg-gradient-to-br from-crimson-50 to-crimson-100 border border-crimson-200">
                    <div class="text-2xl mb-3">🏆</div>
                    <h3 class="font-bold text-crimson-800 mb-2" style="font-family:'Playfair Display',serif;">Vidyamritam Scholarship</h3>
                    <p class="text-sm text-crimson-700 leading-relaxed">Up to <strong>100% tuition fee waiver</strong> for eligible students based on AEEE or JEE Main rank. India's most generous merit scholarship.</p>
                </div>
                <div class="card bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
                    <div class="text-2xl mb-3">🤝</div>
                    <h3 class="font-bold text-emerald-800 mb-2" style="font-family:'Playfair Display',serif;">Need-Based Aid</h3>
                    <p class="text-sm text-emerald-700 leading-relaxed">Financial assistance available for students from economically weaker sections. Contact <a href="mailto:admissions@amrita.edu" class="underline">admissions@amrita.edu</a>.</p>
                </div>
                <div class="card bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                    <div class="text-2xl mb-3">🎓</div>
                    <h3 class="font-bold text-blue-800 mb-2" style="font-family:'Playfair Display',serif;">GATE Stipend (M.Tech)</h3>
                    <p class="text-sm text-blue-700 leading-relaxed">GATE-qualified M.Tech students receive <strong>₹12,400/month</strong> AICTE stipend throughout the program duration.</p>
                </div>
            </div>

            <div class="bg-amrita-cream border border-gray-200 rounded-2xl p-6">
                <h3 class="font-bold text-gray-900 mb-3" style="font-family:'Playfair Display',serif;">📌 Important Notes</h3>
                <ul class="text-sm text-gray-600 space-y-2">
                    <li>• Fee amounts are indicative. Actual fees may vary by batch/year. Verify at <strong>amrita.edu</strong>.</li>
                    <li>• Hostel fees include accommodation only. Mess/food charges are separate (approx. ₹3,000–₹4,000/month).</li>
                    <li>• A one-time refundable caution deposit of ₹10,000 is collected at admission.</li>
                    <li>• EMI / instalment payment options are available for tuition fees.</li>
                </ul>
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
        <div>
            <div class="hero-gradient hero-pattern text-white py-16 px-4">
                <div class="max-w-4xl mx-auto text-center">
                    <h1 class="text-4xl md:text-5xl font-bold mb-3" style="font-family:'Playfair Display',serif;">Important Dates</h1>
                    <p class="text-red-100 text-lg">AEEE 2026 and admission calendar for Amrita Coimbatore</p>
                </div>
            </div>
            <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div class="card border-l-4 border-crimson-600 reveal">
                        <h2 class="text-xl font-bold mb-6 text-crimson-700" style="font-family:'Playfair Display',serif;">🎓 AEEE 2026 – B.Tech Admissions</h2>
                        <ul class="space-y-4">
                            ${[
                                ['AEEE Registration Opens', 'November 1, 2025'],
                                ['AEEE Phase 1 Exam', 'January–February 2026'],
                                ['AEEE Phase 2 Exam', 'April 2026'],
                                ['JEE Main-Based Admissions', 'June–July 2026'],
                                ['Counselling Begins', 'June 15, 2026'],
                                ['Admission Deadline', 'July 31, 2026'],
                                ['Classes Begin', 'August 2026'],
                            ].map(([label, date]) => `
                                <li class="timeline-item">
                                    <div class="timeline-dot"></div>
                                    <div class="flex items-center justify-between">
                                        <span class="text-gray-600 text-sm">${label}</span>
                                        <span class="font-semibold text-gray-900 text-sm ml-4">${date}</span>
                                    </div>
                                </li>
                            `).join('')}
                        </ul>
                    </div>

                    <div class="card border-l-4 border-gold-500 reveal" style="transition-delay:0.15s;">
                        <h2 class="text-xl font-bold mb-6 text-gold-700" style="font-family:'Playfair Display',serif;">🏥 MBBS / NEET Admissions</h2>
                        <ul class="space-y-4">
                            ${[
                                ['NEET 2026 Exam', 'May 2026'],
                                ['NEET Result Declaration', 'June 2026'],
                                ['Amrita MBBS Counselling', 'July–August 2026'],
                                ['Admission Confirmation', 'August 2026'],
                                ['MBBS Classes Begin', 'September 2026'],
                            ].map(([label, date]) => `
                                <li class="timeline-item" style="border-color: #D4AF37;">
                                    <div class="timeline-dot" style="background:#D4AF37;"></div>
                                    <div class="flex items-center justify-between">
                                        <span class="text-gray-600 text-sm">${label}</span>
                                        <span class="font-semibold text-gray-900 text-sm ml-4">${date}</span>
                                    </div>
                                </li>
                            `).join('')}
                        </ul>
                    </div>

                    <div class="card border-l-4 border-blue-500 reveal">
                        <h2 class="text-xl font-bold mb-6 text-blue-700" style="font-family:'Playfair Display',serif;">💼 MBA Admissions 2026</h2>
                        <ul class="space-y-4">
                            ${[
                                ['CAT / MAT / XAT Scores Accepted', 'Ongoing'],
                                ['Applications Open', 'January 2026'],
                                ['Group Discussion & Interview', 'March–April 2026'],
                                ['Offer Letters Issued', 'April–May 2026'],
                                ['MBA Classes Begin', 'July 2026'],
                            ].map(([label, date]) => `
                                <li class="timeline-item" style="border-color: #3B82F6;">
                                    <div class="timeline-dot" style="background:#3B82F6;"></div>
                                    <div class="flex items-center justify-between">
                                        <span class="text-gray-600 text-sm">${label}</span>
                                        <span class="font-semibold text-gray-900 text-sm ml-4">${date}</span>
                                    </div>
                                </li>
                            `).join('')}
                        </ul>
                    </div>

                    <div class="card border-l-4 border-purple-500 reveal" style="transition-delay:0.15s;">
                        <h2 class="text-xl font-bold mb-6 text-purple-700" style="font-family:'Playfair Display',serif;">🔬 M.Tech Admissions 2026</h2>
                        <ul class="space-y-4">
                            ${[
                                ['GATE 2026 Exam', 'February 2026'],
                                ['M.Tech Applications Open', 'March 2026'],
                                ['Shortlisting & Interviews', 'May 2026'],
                                ['Admission Offers', 'June 2026'],
                                ['M.Tech Classes Begin', 'July 2026'],
                            ].map(([label, date]) => `
                                <li class="timeline-item" style="border-color: #8B5CF6;">
                                    <div class="timeline-dot" style="background:#8B5CF6;"></div>
                                    <div class="flex items-center justify-between">
                                        <span class="text-gray-600 text-sm">${label}</span>
                                        <span class="font-semibold text-gray-900 text-sm ml-4">${date}</span>
                                    </div>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>

                <div class="mt-12 bg-crimson-50 border border-crimson-200 rounded-2xl p-6 text-center reveal">
                    <p class="text-crimson-700 font-semibold mb-2">⚠️ Dates are indicative and subject to change</p>
                    <p class="text-crimson-600 text-sm">Please verify the exact schedule at <a href="https://www.amrita.edu" target="_blank" class="underline font-semibold">www.amrita.edu</a> or contact the admissions office at <strong>0422-2685000</strong></p>
                </div>
            </div>
        </div>
    `;
}

// ─── Track Application Page ───────────────────────────────────────────────────
function loadTrackPage(container) {
    container.innerHTML = `
        <div>
            <div class="hero-gradient hero-pattern text-white py-16 px-4">
                <div class="max-w-4xl mx-auto text-center">
                    <h1 class="text-4xl md:text-5xl font-bold mb-3" style="font-family:'Playfair Display',serif;">Track Your Application</h1>
                    <p class="text-red-100 text-lg">Check your Amrita admission application status instantly</p>
                </div>
            </div>
            <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div class="card shadow-xl">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="w-12 h-12 bg-crimson-100 rounded-xl flex items-center justify-center text-2xl">🔍</div>
                        <div>
                            <h2 class="font-bold text-gray-900" style="font-family:'Playfair Display',serif;">Application Status Lookup</h2>
                            <p class="text-gray-500 text-sm">Enter your registered email or application ID</p>
                        </div>
                    </div>
                    <form id="track-form" novalidate>
                        <div class="mb-5">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <input id="track-email" type="email" class="input-field" placeholder="yourname@example.com">
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
                Pending:  { bg: 'bg-amber-100', text: 'text-amber-800',  icon: '⏳' },
                Approved: { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: '✅' },
                Rejected: { bg: 'bg-red-100',    text: 'text-red-800',    icon: '❌' },
            };
            const sc = statusColors[data.status] || statusColors.Pending;
            result.classList.remove('hidden');
            result.innerHTML = `
                <div class="border border-gray-200 rounded-xl p-5 space-y-3">
                    <div class="flex items-center justify-between">
                        <h3 class="font-bold text-gray-900 text-lg" style="font-family:'Playfair Display',serif;">${data.full_name}</h3>
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
                    ${data.status === 'Approved' ? `<p class="text-xs text-emerald-700 mt-2 bg-emerald-50 rounded-lg p-3">🎉 Congratulations! Your application has been approved. Please check your email for further instructions.</p>` : ''}
                    ${data.status === 'Rejected' ? `<p class="text-xs text-red-700 mt-2 bg-red-50 rounded-lg p-3">We regret that your application was not successful. Contact admissions@amrita.edu for feedback.</p>` : ''}
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
        <div>
            <div class="hero-gradient hero-pattern text-white py-16 px-4">
                <div class="max-w-4xl mx-auto text-center">
                    <h1 class="text-4xl md:text-5xl font-bold mb-3" style="font-family:'Playfair Display',serif;">Apply Now</h1>
                    <p class="text-red-100 text-lg">Submit your admission application to Amrita Vishwa Vidyapeetham, Coimbatore</p>
                </div>
            </div>
            <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div class="card shadow-xl">
                    <div class="flex items-center gap-3 mb-8 pb-6 border-b">
                        <div class="w-12 h-12 bg-crimson-100 rounded-xl flex items-center justify-center text-2xl">📋</div>
                        <div>
                            <h2 class="font-bold text-gray-900 text-lg" style="font-family:'Playfair Display',serif;">Admission Application Form</h2>
                            <p class="text-gray-500 text-sm">All fields marked * are required</p>
                        </div>
                    </div>
                    <form id="admission-form" novalidate>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                                <input id="field-full_name" type="text" name="full_name" required class="input-field" placeholder="Your full name">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                <input id="field-email" type="email" name="email" required class="input-field" placeholder="yourname@example.com">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                                <input id="field-phone" type="tel" name="phone" required class="input-field" placeholder="+91 98765 43210">
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
                                    <option value="B.Tech Computer Science & Engineering">B.Tech CSE</option>
                                    <option value="B.Tech CSE – Artificial Intelligence & Machine Learning">B.Tech CSE – AI & ML</option>
                                    <option value="B.Tech CSE – Cybersecurity">B.Tech CSE – Cybersecurity</option>
                                    <option value="B.Tech Electronics & Communication Engineering">B.Tech ECE</option>
                                    <option value="B.Tech Mechanical Engineering">B.Tech Mechanical</option>
                                    <option value="B.Tech Civil Engineering">B.Tech Civil</option>
                                    <option value="M.Tech (Various Specialisations)">M.Tech</option>
                                    <option value="MBA">MBA</option>
                                    <option value="MBBS">MBBS</option>
                                </select>
                            </div>
                        </div>
                        <div class="mt-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                            <textarea id="field-address" name="address" required class="input-field" rows="3" placeholder="Your full address including city, state, pincode..."></textarea>
                        </div>
                        <div class="mt-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Previous Institution *</label>
                            <input id="field-previous_institution" type="text" name="previous_institution" required class="input-field" placeholder="Name of your school / college">
                        </div>
                        <div class="mt-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">AEEE / JEE Rank / Percentage (12th)</label>
                            <input id="field-gpa" type="number" name="gpa" step="0.01" min="0" max="4" class="input-field" placeholder="e.g. 3.8 (enter as GPA out of 4.0)">
                        </div>
                        <div class="mt-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Personal Statement</label>
                            <textarea id="field-personal_statement" name="personal_statement" class="input-field" rows="5" placeholder="Tell us about yourself, your academic interests, and why you want to study at Amrita Vishwa Vidyapeetham..."></textarea>
                        </div>
                        <div class="mt-8">
                            <button type="submit" id="submit-btn" class="btn-primary w-full text-base py-4">
                                Submit Application →
                            </button>
                            <p class="text-xs text-gray-400 text-center mt-3">By submitting, you agree to Amrita's terms and conditions. An acknowledgement email will be sent to you.</p>
                        </div>
                    </form>
                </div>
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
                    <h1 class="text-3xl font-bold text-gray-900" style="font-family:'Playfair Display',serif;">Admin Dashboard</h1>
                    <p class="text-gray-500 mt-1">Amrita Admissions – Coimbatore Campus</p>
                </div>
                <div class="flex items-center gap-3 flex-wrap">
                    <input id="admin-search" type="text" placeholder="Search by name, email, program..." class="input-field w-72 text-sm">
                    <select id="admin-filter" class="input-field w-36 text-sm">
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                    <button id="export-csv-btn" class="flex items-center gap-2 bg-amrita-navy hover:bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition">
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
    const total    = admissions.length;
    const pending  = admissions.filter(a => a.status === 'Pending').length;
    const approved = admissions.filter(a => a.status === 'Approved').length;
    const rejected = admissions.filter(a => a.status === 'Rejected').length;

    document.getElementById('admin-stats').innerHTML = `
        <div class="card text-center border-t-4 border-crimson-600">
            <div class="text-3xl font-extrabold text-crimson-700" style="font-family:'Playfair Display',serif;">${total}</div>
            <div class="text-sm text-gray-500 mt-1">Total Applications</div>
        </div>
        <div class="card text-center border-t-4 border-amber-400">
            <div class="text-3xl font-extrabold text-amber-500" style="font-family:'Playfair Display',serif;">${pending}</div>
            <div class="text-sm text-gray-500 mt-1">Pending</div>
        </div>
        <div class="card text-center border-t-4 border-emerald-500">
            <div class="text-3xl font-extrabold text-emerald-600" style="font-family:'Playfair Display',serif;">${approved}</div>
            <div class="text-sm text-gray-500 mt-1">Approved</div>
        </div>
        <div class="card text-center border-t-4 border-red-500">
            <div class="text-3xl font-extrabold text-red-600" style="font-family:'Playfair Display',serif;">${rejected}</div>
            <div class="text-sm text-gray-500 mt-1">Rejected</div>
        </div>
    `;
}

function renderAdminTable(admissions) {
    const statusBadge = {
        Pending:  'bg-amber-100 text-amber-800',
        Approved: 'bg-emerald-100 text-emerald-800',
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

    const start = (adminCurrentPage - 1) * ADMIN_PAGE_SIZE;
    const pageItems = admissions.slice(start, start + ADMIN_PAGE_SIZE);

    document.getElementById('admin-table-container').innerHTML = `
        <div class="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table class="w-full text-sm min-w-[700px]">
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
                        <tr id="row-${a.id}" class="hover:bg-crimson-50/30 transition">
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
                                    <button onclick="changeStatus(${a.id}, 'Approved')" class="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-semibold px-3 py-1.5 rounded-lg transition">✓ Approve</button>
                                    <button onclick="changeStatus(${a.id}, 'Rejected')" class="text-xs bg-red-100 hover:bg-red-200 text-red-700 font-semibold px-3 py-1.5 rounded-lg transition">✕ Reject</button>
                                    <button onclick="changeStatus(${a.id}, 'Pending')" class="text-xs bg-amber-100 hover:bg-amber-200 text-amber-700 font-semibold px-3 py-1.5 rounded-lg transition">⟳ Reset</button>
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

    if (totalPages <= 1) { paginationEl.innerHTML = ''; return; }

    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `
            <button
                onclick="goToAdminPage(${i})"
                class="w-9 h-9 rounded-lg text-sm font-semibold transition
                    ${i === adminCurrentPage
                        ? 'bg-crimson-600 text-white'
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

        const record = adminAllAdmissions.find(a => a.id === id);
        if (record) record.status = status;

        const badge = document.getElementById(`badge-${id}`);
        const statusBadge = {
            Pending:  'bg-amber-100 text-amber-800',
            Approved: 'bg-emerald-100 text-emerald-800',
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
    link.download = `amrita_admissions_coimbatore_${new Date().toISOString().slice(0, 10)}.csv`;
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

    const requiredFields = [
        { name: 'full_name',            label: 'Full Name' },
        { name: 'email',                label: 'Email' },
        { name: 'phone',                label: 'Phone' },
        { name: 'date_of_birth',        label: 'Date of Birth' },
        { name: 'gender',               label: 'Gender' },
        { name: 'program',              label: 'Program' },
        { name: 'address',              label: 'Address' },
        { name: 'previous_institution', label: 'Previous Institution' },
    ];

    for (const field of requiredFields) {
        if (!data[field.name] || !data[field.name].trim()) {
            showToast(`${field.label} is required.`, 'warning');
            document.getElementById(`field-${field.name}`)?.focus();
            return;
        }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        showToast('Please enter a valid email address.', 'warning');
        document.getElementById('field-email')?.focus();
        return;
    }

    const phone = data.phone || '';
    if (!/^\+?[\d\s\-().]{7,20}$/.test(phone)) {
        showToast('Please enter a valid phone number.', 'warning');
        return;
    }

    if (data.gpa && (parseFloat(data.gpa) < 0 || parseFloat(data.gpa) > 4)) {
        showToast('GPA must be between 0.00 and 4.00.', 'warning');
        return;
    }

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
        btn.innerHTML = 'Submit Application →';
    }
}

// Chatbot home toggle
document.addEventListener('click', function (e) {
    if (e.target.id === 'chatbot-home-toggle') toggleChatbot();
});