// chatbot.js — Chatbot with Gemini backend, localStorage persistence, formatted replies
const STORAGE_KEY = 'amrita_chat_history';

let chatMessages = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

const localFallback = {
    admission:     "AEEE 2026 applications are open! Apply via AEEE or JEE Main scores. Visit amrita.edu or our Apply Now page.",
    courses:       "Amrita Coimbatore offers B.Tech in CSE, AI & ML, Cybersecurity, ECE, Mechanical, Civil; plus M.Tech, MBA, and MBBS.",
    fees:          "Tuition: B.Tech CSE ₹2,10,000/yr | ECE/Mech ₹1,85,000/yr | MBA ₹2,50,000/yr | MBBS ₹12,00,000/yr. Vidyamritam Scholarship covers up to 100%!",
    scholarship:   "Amrita's Vidyamritam Scholarship offers up to 100% fee waiver based on AEEE or JEE Main rank. Need-based aid also available.",
    deadline:      "AEEE Phase 1: Jan–Feb 2026, Phase 2: April 2026. JEE Main-based counselling: June–July 2026. Classes begin August 2026.",
    documents:     "Required: 10th & 12th marksheets, AEEE/JEE rank card, transfer certificate, character certificate, Aadhaar, and passport photos.",
    contact:       "Reach us at admissions@amrita.edu or 0422-2685000. Office hours: Mon–Sat, 9 AM – 5 PM.",
    hostel:        "Fully residential AC and non-AC hostels available. Fees: ₹80,000–₹1,20,000/year including mess. Contact housing@cb.amrita.edu.",
    placement:     "5000+ annual placement offers, avg. package ₹7–8 LPA. Top recruiters: Amazon, Google, Microsoft, TCS, Infosys, Wipro.",
    eligibility:   "B.Tech: 10+2 with min. 60% in PCM + AEEE/JEE rank. MBBS: NEET qualified. MBA: CAT/MAT/XAT score required.",
    transfer:      "Lateral entry to B.Tech (3rd semester) available for diploma holders with min. 60% aggregate. Contact admissions office.",
    international: "NRI/OCI seats available. Need valid passport, transcripts, TOEFL (min 80) or IELTS (min 6.5). Contact nri.admissions@amrita.edu.",
    aeee:          "AEEE (Amrita Engineering Entrance Exam) is Amrita's own entrance test for B.Tech admissions. JEE Main scores are also accepted.",
};

const suggestedQuestions = [
    "What B.Tech courses are available?",
    "What is the fee structure in INR?",
    "How do I apply through AEEE?",
    "What is the Vidyamritam Scholarship?",
    "What is the AEEE 2026 deadline?",
    "What documents are required?",
    "Is hostel facility available?",
    "What are the placement statistics?",
    "What is the eligibility for B.Tech?",
    "Is lateral entry available?",
    "How to apply as NRI/international student?",
    "How can I contact admissions office?",
];

// ── Toggle open/close ─────────────────────────────────────────────────────────
function toggleChatbot() {
    const modal = document.getElementById('chatbot-modal');
    modal.classList.toggle('hidden');

    if (!modal.classList.contains('hidden')) {
        if (chatMessages.length === 0) {
            addMessage(
                "Hello! I'm the Amrita AI Assistant. How can I help you with admissions at Amrita Vishwa Vidyapeetham, Coimbatore? Ask me about AEEE, courses, fees, scholarships, or hostel!",
                'bot'
            );
        } else {
            renderMessages();
        }
        document.getElementById('chat-input').focus();
    }
}

// ── Add message + persist ─────────────────────────────────────────────────────
function addMessage(text, sender) {
    chatMessages.push({ text, sender });
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(chatMessages)); } catch (_) {}
    renderMessages();
}

// ── Format bot reply text ─────────────────────────────────────────────────────
function formatBotText(text) {
    // Escape HTML entities first
    const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    return escaped
        // Bold **text** or *text*
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Linkify email addresses
        .replace(
            /([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/g,
            '<a href="mailto:$1" class="underline text-crimson-600 hover:text-crimson-800">$1</a>'
        )
        // Newlines → line breaks
        .replace(/\n/g, '<br>');
}

// ── Render all messages ───────────────────────────────────────────────────────
function renderMessages() {
    const container = document.getElementById('chat-messages');
    container.innerHTML = '';

    chatMessages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${message.sender}`;

        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = `chat-bubble ${message.sender}`;

        if (message.sender === 'bot') {
            bubbleDiv.innerHTML = formatBotText(message.text);
        } else {
            bubbleDiv.textContent = message.text;
        }

        messageDiv.appendChild(bubbleDiv);
        container.appendChild(messageDiv);
    });

    container.scrollTop = container.scrollHeight;
}

// ── Suggestions chip bar ──────────────────────────────────────────────────────
function renderSuggestions() {
    const bar = document.getElementById('chat-suggestions');
    if (!bar) return;
    bar.innerHTML = '';

    suggestedQuestions.forEach(question => {
        const btn = document.createElement('button');
        btn.className = 'suggestion-chip';
        btn.textContent = question;
        btn.addEventListener('click', () => {
            document.getElementById('chat-input').value = question;
            sendMessage();
        });
        bar.appendChild(btn);
    });
}

// ── Clear chat ────────────────────────────────────────────────────────────────
function clearChat() {
    chatMessages = [];
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    document.getElementById('chat-messages').innerHTML = '';
    addMessage(
        "Chat cleared! Ask me anything about admissions at Amrita Vishwa Vidyapeetham, Coimbatore.",
        'bot'
    );
}

// ── Local fallback ────────────────────────────────────────────────────────────
function getLocalFallbackResponse(input) {
    const lower = input.toLowerCase();
    for (const [key, value] of Object.entries(localFallback)) {
        if (lower.includes(key)) return value;
    }
    return "Thank you for your question! For specific inquiries contact admissions@amrita.edu or call 0422-2685000. You can also ask me about AEEE, courses, fees, Vidyamritam Scholarship, hostel, or placement!";
}

// ── Typing indicator (staggered dots) ────────────────────────────────────────
function showTypingIndicator() {
    const container = document.getElementById('chat-messages');
    const indicator = document.createElement('div');
    indicator.id        = 'typing-indicator';
    indicator.className = 'chat-message bot';
    indicator.innerHTML = `
        <div class="chat-bubble bot">
            <span class="typing-dot" style="animation-delay:0s">●</span>
            <span class="typing-dot" style="animation-delay:0.2s">●</span>
            <span class="typing-dot" style="animation-delay:0.4s">●</span>
        </div>`;
    container.appendChild(indicator);
    container.scrollTop = container.scrollHeight;
}

function removeTypingIndicator() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
}

// ── Send message ──────────────────────────────────────────────────────────────
async function sendMessage() {
    const input   = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-button');
    const message = input.value.trim();

    if (!message) return;

    addMessage(message, 'user');
    input.value = '';

    // Disable input while waiting
    input.disabled   = true;
    sendBtn.disabled = true;

    showTypingIndicator();

    try {
        const result = await sendChatMessage(message);
        removeTypingIndicator();
        addMessage(result.reply, 'bot');
    } catch (error) {
        removeTypingIndicator();
        addMessage(getLocalFallbackResponse(message), 'bot');
    } finally {
        input.disabled   = false;
        sendBtn.disabled = false;
        input.focus();
    }
}

// ── Event listeners ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    const sendButton = document.getElementById('send-button');
    const chatInput  = document.getElementById('chat-input');
    const clearBtn   = document.getElementById('chat-clear-btn');

    sendButton.addEventListener('click', sendMessage);

    chatInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') sendMessage();
    });

    document.getElementById('chatbot-modal').addEventListener('click', function (e) {
        if (e.target.id === 'chatbot-modal') toggleChatbot();
    });

    if (clearBtn) clearBtn.addEventListener('click', clearChat);

    // Populate suggestions chip bar on load
    renderSuggestions();
});