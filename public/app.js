document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const mainInput = document.getElementById('mainInput');
    const sendBtn = document.getElementById('sendBtn');
    const landingView = document.getElementById('landingView');
    const messageStream = document.getElementById('messageStream');
    const chatContainer = document.getElementById('chatContainer');
    const suggestionCards = document.querySelectorAll('.suggestion-card');
    const newChatBtn = document.getElementById('newChatBtn');
    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    let isChatActive = false;

    // --- Layout & State Management ---
    function toggleSidebar() {
        sidebar.classList.toggle('active');
        sidebarOverlay.classList.toggle('active');
    }

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
        
        // Auto-close sidebar on mobile devices
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        }
    }

    // --- DOM Manipulation ---
    function appendMessage(role, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${role}-message`;
        
        if (role === 'bot') {
            // Parse Markdown and apply Syntax Highlighting
            if (typeof marked !== 'undefined') {
                // Configure marked to break lines correctly
                marked.setOptions({ breaks: true });
                msgDiv.innerHTML = marked.parse(text);
                
                // Initialize highlight.js on the injected code blocks
                if (typeof hljs !== 'undefined') {
                    msgDiv.querySelectorAll('pre code').forEach((block) => {
                        hljs.highlightElement(block);
                    });
                }
            } else {
                msgDiv.textContent = text;
            }
        } else {
            // User input must be appended as textContent to mitigate XSS
            msgDiv.textContent = text;
        }
        
        messageStream.appendChild(msgDiv);
        scrollToBottom();
    }

    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function setInputLoading(isLoading) {
        mainInput.disabled = isLoading;
        sendBtn.disabled = isLoading;
        sendBtn.style.opacity = isLoading ? '0.5' : '1';
        if (!isLoading) mainInput.focus();
    }

    // --- API Communication ---
    async function handleSend(query) {
        if (!query) return;
        
        mainInput.value = '';
        activateChat();
        appendMessage('user', query);
        setInputLoading(true);

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: query }] }]
                })
            });
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            
            if (data.candidates && data.candidates[0].content) {
                appendMessage('bot', data.candidates[0].content.parts[0].text);
            } else if (data.error) {
                appendMessage('bot', `**API Error:** ${data.error.message || 'Unknown error'}`);
            } else {
                appendMessage('bot', 'Received an unexpected response format from the server.');
            }
        } catch (err) {
            console.error("Fetch error:", err);
            appendMessage('bot', '**Connection Failure:** Verify the Node.js server is running and accessible.');
        } finally {
            setInputLoading(false);
        }
    }

    // --- Event Listeners ---
    
    // Sidebar Controls
    menuBtn.addEventListener('click', toggleSidebar);
    sidebarOverlay.addEventListener('click', toggleSidebar);
    newChatBtn.addEventListener('click', resetChat);

    // Input Execution
    sendBtn.addEventListener('click', () => handleSend(mainInput.value.trim()));
    mainInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); 
            handleSend(mainInput.value.trim());
        }
    });

    // Delegation for dynamic/static suggestion cards
    suggestionCards.forEach(card => {
        card.addEventListener('click', () => {
            const query = card.getAttribute('data-query');
            handleSend(query);
        });
    });
});