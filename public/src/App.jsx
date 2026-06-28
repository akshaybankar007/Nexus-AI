import { useState } from 'react';

function App() {
  const [inputText, setInputText] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatActive, setIsChatActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [persona, setPersona] = useState('General');

  const handleSend = async () => {
    if (inputText.trim() === '') return;

    const userPrompt = inputText;
    setChatHistory((prev) => [...prev, { sender: 'user', text: userPrompt }]);
    setInputText('');
    setIsChatActive(true);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userPrompt, persona: persona }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setChatHistory((prev) => [...prev, { sender: 'bot', text: data.reply }]);
      } else {
        throw new Error(data.error);
      }
      
    } catch (error) {
      console.error('Frontend Fetch Error:', error);
      setChatHistory((prev) => [
        ...prev, 
        { sender: 'bot', text: 'Connection failed. Is the server running on port 3000?' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="gemini-layout">
      <aside className="sidebar">
        <button onClick={() => { setChatHistory([]); setIsChatActive(false); }} className="new-chat-btn">
          <span className="material-symbols-outlined">add</span>
          <span className="btn-text">New chat</span>
        </button>

        <div className="persona-selector" style={{ marginTop: '2rem' }}>
          <p className="section-title">AI Role</p>
          <select 
            value={persona} 
            onChange={(e) => setPersona(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', backgroundColor: '#131314', color: '#e3e3e3', border: '1px solid #333537', marginTop: '0.5rem', outline: 'none', cursor: 'pointer' }}
          >
            <option value="General">Nexus (Standard)</option>
            <option value="Mentor">Code Mentor</option>
            <option value="Interviewer">Mock Interviewer</option>
          </select>
        </div>

        <div className="recent-chats">
          <p className="section-title">Recent Prompts</p>
          <div className="history-list">
            {chatHistory.filter(m => m.sender === 'user').map((msg, i) => (
              <div key={i} className="history-item" style={{padding: '0.5rem', fontSize: '0.85rem', color: '#c4c7c5', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}>
                {msg.text}
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="main-view">
        <header className="top-nav">
          <span className="brand-logo">Nexus</span>
          <div className="user-avatar">A</div>
        </header>

        <div id="chatContainer" className="chat-container">
          {!isChatActive ? (
            <div className="greeting-screen">
              <h1 className="greeting-text">
                <span className="gradient-text">Hello, Akshay.</span><br />
                <span className="sub-greeting">What can I help you with?</span>
              </h1>
            </div>
          ) : (
            <div className="message-stream">
              {chatHistory.map((msg, index) => (
                <div key={index} className={`message ${msg.sender}-message`}>
                  {msg.text}
                </div>
              ))}
              {isLoading && (
                <div className="message bot-message" style={{color: '#a8abae', fontStyle: 'italic'}}>
                  Nexus is thinking...
                </div>
              )}
            </div>
          )}
        </div>

        <div className="input-section">
          <div className="input-wrapper">
            <input 
              className="chat-input"
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Enter a prompt here"
            />
            <div className="input-actions">
              <button onClick={handleSend} className="send-btn" disabled={isLoading}>
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
          <p className="disclaimer">Nexus can make mistakes. Verify important information.</p>
        </div>
      </main>
    </div>
  );
}

export default App;