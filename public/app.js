document.addEventListener('DOMContentLoaded', () => {

    let isChatActive = false;

    const mainInput = document.querySelector('#mainInput');
    const sendBtn = document.querySelector('#sendBtn');
    const chatContainer = document.querySelector('#chatContainer');
    const messageStream = document.querySelector('#messageStream');
    const landingView = document.querySelector('#landingView');
    const newChatBtn = document.querySelector('#newChatBtn');


    function activateChat() {
        landingView.style.display = 'none';
        messageStream.style.display = 'flex';
        isChatActive = true;
    }

    function handleSend(){
    const userInput = mainInput.value;
    activateChat();
    const div = document.createElement('div');
    div.textContent = userInput;
    div.classList.add('message');
    div.classList.add('user-message');
    messageStream.appendChild(div);

    mainInput.value = '';   
 }
    sendBtn.addEventListener('click', handleSend);
});