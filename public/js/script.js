document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('landingInput');
    const btn = document.getElementById('landingBtn');
    const cards = document.querySelectorAll('.suggestion-card');

    // Redirect to the chat window with the user's query
    function goChat(query) {
        if(query) {
            window.location.href = `window.html?query=${encodeURIComponent(query)}`;
        }
    }

    // Event Listeners
    btn.addEventListener('click', () => goChat(input.value.trim()));
    
    input.addEventListener('keydown', (e) => {
        if(e.key === 'Enter') {
            goChat(input.value.trim());
        }
    });

    cards.forEach(card => {
        card.addEventListener('click', () => goChat(card.textContent.trim()));
    });
});