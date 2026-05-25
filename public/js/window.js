document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chatContainer');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');

    // Configure Marked (Markdown Parser) and Highlight.js
    marked.setOptions({
        highlight: function(code, lang) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        },
        langPrefix: 'hljs language-',
    });

    function appendMessage(text, sender, isHtml = false) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender);

        const avatar = document.createElement('div');
        avatar.classList.add('avatar', sender);
        avatar.innerText = sender === 'user' ? 'U' : 'N';

        const bubble = document.createElement('div');
        bubble.classList.add('bubble');

        if (isHtml) {
            bubble.innerHTML = text;
        } else {
            bubble.innerText = text;
        }

        if (sender === 'user') {
            msgDiv.appendChild(bubble);
        } else {
            msgDiv.appendChild(avatar);
            msgDiv.appendChild(bubble);
        }

        chatContainer.appendChild(msgDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        return bubble; 
    }

    function showTypingIndicator() {
        const id = 'typing-' + Date.now();
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', 'bot');
        msgDiv.id = id;
        msgDiv.innerHTML = `
            <div class="avatar bot">N</div>
            <div class="bubble" style="color: #94a3b8; font-style: italic;">Thinking...</div>
        `;
        chatContainer.appendChild(msgDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        return id;
    }

    function removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    async function callGeminiAPI(message) {
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: message }] }]
                })
            });
            
            if (!response.ok) throw new Error("Server response wasn't OK");
            
            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";
        } catch (error) {
            console.error(error);
            return "Error: Unable to reach the server. Please check your connection or try again later.";
        }
    }

    function renderMarkdown(element, text) {
        element.innerHTML = marked.parse(text);
    }

    async function handleSend() {
        const text = chatInput.value.trim();
        if (!text) return;

        // 1. Add User Message
        appendMessage(text, 'user');
        chatInput.value = '';

        // 2. Show Indicator
        const loadingId = showTypingIndicator();

        // 3. Fetch Data from Backend
        const answer = await callGeminiAPI(text);

        // 4. Remove Indicator and Show Bot Message
        removeTypingIndicator(loadingId);
        const botBubble = appendMessage("", 'bot', true);
        
        // 5. Render Markdown safely
        renderMarkdown(botBubble, answer);
    }

    sendBtn.addEventListener('click', handleSend);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    // Handle initial query passed from the landing page
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('query');
    
    if (initialQuery) {
        // Clear the URL parameter so it doesn't trigger again on refresh
        window.history.replaceState({}, document.title, window.location.pathname);
        
        setTimeout(() => {
            appendMessage(initialQuery, 'user');
            (async () => {
                const loadingId = showTypingIndicator();
                const answer = await callGeminiAPI(initialQuery);
                removeTypingIndicator(loadingId);
                const botBubble = appendMessage("", 'bot', true);
                renderMarkdown(botBubble, answer);
            })();
        }, 500);
    }
});