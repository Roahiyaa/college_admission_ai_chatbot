// chatbot.js - Chatbot functionality with backend API + local fallback
let chatMessages = [];

const localFallback = {
    admission: "AEEE 2026 applications are open! Apply via AEEE or JEE Main scores. Visit amrita.edu or our Apply Now page.",
    courses: "Amrita Coimbatore offers B.Tech in CSE, AI & ML, Cybersecurity, ECE, Mechanical, Civil; plus M.Tech, MBA, and MBBS.",
    fees: "Tuition: B.Tech CSE ₹2,10,000/yr | ECE/Mech ₹1,85,000/yr | MBA ₹2,50,000/yr | MBBS ₹12,00,000/yr. Vidyamritam Scholarship covers up to 100%!",
    scholarship: "Amrita's Vidyamritam Scholarship offers up to 100% fee waiver based on AEEE or JEE Main rank. Need-based aid also available.",
    deadline: "AEEE Phase 1: Jan–Feb 2026, Phase 2: April 2026. JEE Main-based counselling: June–July 2026. Classes begin August 2026.",
    documents: "Required: 10th & 12th marksheets, AEEE/JEE rank card, transfer certificate, character certificate, Aadhaar, and passport photos.",
    contact: "Reach us at admissions@amrita.edu or 0422-2685000. Office hours: Mon–Sat, 9 AM – 5 PM.",
    hostel: "Fully residential AC and non-AC hostels available. Fees: ₹80,000–₹1,20,000/year including mess. Contact housing@cb.amrita.edu.",
    placement: "5000+ annual placement offers, avg. package ₹7–8 LPA. Top recruiters: Amazon, Google, Microsoft, TCS, Infosys, Wipro.",
    eligibility: "B.Tech: 10+2 with min. 60% in PCM + AEEE/JEE rank. MBBS: NEET qualified. MBA: CAT/MAT/XAT score required.",
    transfer: "Lateral entry to B.Tech (3rd semester) available for diploma holders with min. 60% aggregate. Contact admissions office.",
    international: "NRI/OCI seats available. Need valid passport, transcripts, TOEFL (min 80) or IELTS (min 6.5). Contact nri.admissions@amrita.edu.",
    aeee: "AEEE (Amrita Engineering Entrance Exam) is Amrita's own entrance test for B.Tech admissions. JEE Main scores are also accepted.",
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

function toggleChatbot() {
    const modal = document.getElementById('chatbot-modal');
    modal.classList.toggle('hidden');

    if (!modal.classList.contains('hidden')) {
        if (chatMessages.length === 0) {
            addMessage("Hello! I'm the Amrita AI Assistant. How can I help you with admissions at Amrita Vishwa Vidyapeetham, Coimbatore? Ask me about AEEE, courses, fees, scholarships, or hostel! 🎓", 'bot');
            showSuggestions();
        }
        document.getElementById('chat-input').focus();
    }
}

function addMessage(text, sender) {
    chatMessages.push({ text, sender });
    renderMessages();
}

function renderMessages() {
    const messagesContainer = document.getElementById('chat-messages');
    messagesContainer.innerHTML = '';

    chatMessages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${message.sender}`;

        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = `chat-bubble ${message.sender}`;
        bubbleDiv.textContent = message.text;

        messageDiv.appendChild(bubbleDiv);
        messagesContainer.appendChild(messageDiv);
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showSuggestions() {
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.className = 'mt-4';
    suggestionsDiv.innerHTML = '<p class="text-sm text-gray-600 mb-2">Suggested questions:</p>';

    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'flex flex-wrap gap-2';

    suggestedQuestions.slice(0, 4).forEach(question => {
        const button = document.createElement('button');
        button.className = 'text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition duration-200';
        button.textContent = question;
        button.addEventListener('click', () => {
            document.getElementById('chat-input').value = question;
            sendMessage();
        });
        suggestionsContainer.appendChild(button);
    });

    suggestionsDiv.appendChild(suggestionsContainer);
    document.getElementById('chat-messages').appendChild(suggestionsDiv);
}

function getLocalFallbackResponse(input) {
    const lower = input.toLowerCase();
    for (const [key, value] of Object.entries(localFallback)) {
        if (lower.includes(key)) return value;
    }
    return "Thank you for your question! For specific inquiries contact admissions@amrita.edu or call 0422-2685000. You can also ask me about AEEE, courses, fees, Vidyamritam Scholarship, hostel, or placement!";
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('chat-messages');
    const indicator = document.createElement('div');
    indicator.id = 'typing-indicator';
    indicator.className = 'chat-message bot';
    indicator.innerHTML = '<div class="chat-bubble bot"><span class="typing-dots">●●●</span></div>';
    messagesContainer.appendChild(indicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();

    if (!message) return;

    addMessage(message, 'user');
    input.value = '';

    showTypingIndicator();

    try {
        const result = await sendChatMessage(message);
        removeTypingIndicator();
        addMessage(result.reply, 'bot');
    } catch (error) {
        removeTypingIndicator();
        // Fallback to local response if backend is unavailable
        const response = getLocalFallbackResponse(message);
        addMessage(response, 'bot');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function () {
    const sendButton = document.getElementById('send-button');
    const chatInput = document.getElementById('chat-input');

    sendButton.addEventListener('click', sendMessage);

    chatInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') sendMessage();
    });

    document.getElementById('chatbot-modal').addEventListener('click', function (e) {
        if (e.target === this) toggleChatbot();
    });
});