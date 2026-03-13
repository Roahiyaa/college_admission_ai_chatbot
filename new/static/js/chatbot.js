// chatbot.js - Chatbot functionality
let chatMessages = [];

const botResponses = {
    admission: "Admissions for Fall 2026 are open from March 15 to June 30. You can apply online through our Application Process section.",
    courses: "We offer programs in Engineering, Business Administration, Computer Science, Medicine, Law, and Liberal Arts. Check the Courses section for details.",
    fees: "Tuition varies by program. Engineering: $12,000/year, Business: $10,500/year, Medicine: $18,000/year. Scholarships are available for eligible students.",
    scholarship: "We offer merit-based and need-based scholarships. Merit scholarships cover up to 50% of tuition for students with a GPA above 3.7.",
    deadline: "Application deadline for Fall 2026 is June 30. Early decision deadline is April 15. Results are announced within 4-6 weeks.",
    documents: "Required documents: transcripts, standardized test scores, personal statement, two recommendation letters, and proof of identity.",
    contact: "You can reach us at admissions@greenfield.edu or call +1 (555) 123-4567. Office hours: Mon-Fri, 9 AM - 5 PM.",
    hostel: "On-campus housing is available for all admitted students. Rooms range from $3,000-$5,000/semester depending on type.",
    placement: "Our placement cell has partnerships with 200+ companies. 95% of graduates are placed within 6 months of graduation.",
    eligibility: "Eligibility varies by program. Generally, 10+2 or equivalent with minimum 50% aggregate is required. Check specific program pages for details.",
    transfer: "Transfer students are welcome. You need official transcripts from your current institution and a minimum GPA of 2.5.",
    international: "International students need TOEFL/IELTS scores, a valid passport, and may apply for student visa assistance through our office.",
};

const suggestedQuestions = [
    "What courses are available?",
    "What is the fee structure?",
    "How do I apply for admission?",
    "What scholarships are available?",
    "What is the application deadline?",
    "What documents are required?",
    "Is hostel facility available?",
    "What are the placement statistics?",
    "Am I eligible to apply?",
    "Can I transfer from another university?",
    "How to apply as an international student?",
    "How can I contact the admissions office?",
];

function toggleChatbot() {
    const modal = document.getElementById('chatbot-modal');
    modal.classList.toggle('hidden');
    
    if (!modal.classList.contains('hidden')) {
        // Initialize chatbot if not already done
        if (chatMessages.length === 0) {
            addMessage("Hello! I'm the Admiss Clarity Bot. How can I help you with your admission queries?", 'bot');
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

function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (message) {
        addMessage(message, 'user');
        input.value = '';
        
        // Simulate typing delay
        setTimeout(() => {
            const response = getResponse(message);
            addMessage(response, 'bot');
        }, 500);
    }
}

function getResponse(input) {
    const lower = input.toLowerCase();
    for (const [key, value] of Object.entries(botResponses)) {
        if (lower.includes(key)) return value;
    }
    return "Thank you for your question. For specific inquiries, please contact our admissions office at admissions@greenfield.edu or try asking about admissions, courses, fees, scholarships, deadlines, or required documents.";
}

function getFilteredSuggestions(input) {
    if (!input.trim()) return suggestedQuestions.slice(0, 5);
    const lower = input.toLowerCase();
    return suggestedQuestions.filter(q => q.toLowerCase().includes(lower)).slice(0, 5);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const sendButton = document.getElementById('send-button');
    const chatInput = document.getElementById('chat-input');
    
    sendButton.addEventListener('click', sendMessage);
    
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Close modal when clicking outside
    document.getElementById('chatbot-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            toggleChatbot();
        }
    });
});