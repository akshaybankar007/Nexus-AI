document.addEventListener('DOMContentLoaded', () => {
    const mainInput = document.getElementById('mainInput');
    const sendBtn = document.getElementById('sendBtn');
    const landingView = document.getElementById('landingView');
    const messageStream = document.getElementById('messageStream');
    const chatContainer = document.getElementById('chatContainer');
    const suggestionCards = document.querySelectorAll('.suggestion-card');
    const newChatBtn = document.getElementById('newChatBtn');

    let isChatActive = false;

    // SPA State Transition
    function activateChat() {
        if (!isChatActive) {
            landingView.style.display = 'none';
            messageStream.style.display = 'flex';
            isChatActive = true;
        }
    }

    function resetChat() {
        landingView.style.display = 'flex';
        messageStream.style.display = 'none';
        messageStream.innerHTML = '';
        isChatActive = false;
    }

    // DOM Injection
    function appendMessage(role, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${role}-message`;
        
        // Utilizing marked.js from your index.html dependencies to parse Gemini's markdown
        if (role === 'bot' && typeof marked !== 'undefined') {
            msgDiv.innerHTML = marked.parse(text);
        } else {
            msgDiv.textContent = text;
        }
        
        messageStream.appendChild(msgDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight; // Auto-scroll
    }

    // Fetch API implementation
    async function handleSend(query) {
        if (!query) return;
        
        mainInput.value = '';
        activateChat();
        appendMessage('user', query);

        try {
            // Proxies through your Express server, not directly to Gemini
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: query }] }]
                })
            });
            
            const data = await response.json();
            
            if (data.candidates && data.candidates[0].content) {
                appendMessage('bot', data.candidates[0].content.parts[0].text);
            } else if (data.error) {
                appendMessage('bot', `API Error: ${data.error.message || 'Unknown error'}`);
            }
        } catch (err) {
            appendMessage('bot', 'Network failure. Check if the Node server is running.');
        }
    }

    // Event Delegation
    sendBtn.addEventListener('click', () => handleSend(mainInput.value.trim()));
    
    mainInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSend(mainInput.value.trim());
    });

    suggestionCards.forEach(card => {
        card.addEventListener('click', () => {
            const query = card.getAttribute('data-query');
            handleSend(query);
        });
    });

    newChatBtn.addEventListener('click', resetChat);
});