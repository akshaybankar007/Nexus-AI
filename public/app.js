document.addEventListener('DOMContentLoaded', () => {

    let isChatActive = false;

    let chatHistory = [];

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
    chatHistory.push(userInput);

    activateChat();

    const div = document.createElement('div');
    div.textContent = userInput;
    div.classList.add('message', 'user-message');
    messageStream.appendChild(div);

    mainInput.value = '';   
 }
    sendBtn.addEventListener('click', handleSend);

    mainInput.addEventListener('keydown', (event) =>{
    if(event.key === 'Enter'){
        handleSend();
    }
})
});

