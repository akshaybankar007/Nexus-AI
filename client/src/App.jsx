import { useState } from 'react';

function App() {
  const [inputText, setInputText] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatActive, setIsChatActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [persona, setPersona] = useState('General');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        body: JSON.stringify({ message: userPrompt, persona }),
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
      {/* Mobile Overlay */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} 
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
        <div className="sidebar-top">
          <button onClick={() => setIsSidebarOpen(false)} className="icon-btn mobile-close-btn">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>

        <button onClick={() => { setChatHistory([]); setIsChatActive(false); setIsSidebarOpen(false); }} className="new-chat-btn rounded-pill">
          <span className="material-symbols-outlined">add</span>
          <span className="btn-text">New chat</span>
        </button>

        <div className="recent-chats">
          <p className="section-title">Recent Prompts</p>
          <div className="history-list">
            {chatHistory.filter(m => m.sender === 'user').map((msg, i) => (
              <div key={i} className="history-item">
                <span className="material-symbols-outlined chat-icon">chat_bubble</span>
                <span className="history-text">{msg.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-footer">
          <button className="footer-btn rounded-pill">
            <span className="material-symbols-outlined">help</span>
            <span className="btn-text">Help</span>
          </button>
          <button className="footer-btn rounded-pill">
            <span className="material-symbols-outlined">history</span>
            <span className="btn-text">Activity</span>
          </button>
          <button className="footer-btn rounded-pill">
            <span className="material-symbols-outlined">settings</span>
            <span className="btn-text">Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="main-view">
        <header className="top-nav">
          <div className="nav-left">
            <button className="icon-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <span className="material-symbols-outlined">menu</span>
            </button>
            <span className="brand-logo">Nexus</span>
          </div>
          <div className="user-avatar rounded-pill">A</div>
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
                <div className="message bot-message loading-text">
                  Nexus is thinking...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="input-section">
          <div className="input-wrapper rounded-pill">
            <select 
              className="role-selector rounded-pill"
              value={persona} 
              onChange={(e) => setPersona(e.target.value)}
            >
              <option value="General">General</option>
              <option value="Mentor">Mentor</option>
              <option value="Interviewer">Interviewer</option>
            </select>
            
            <input 
              className="chat-input"
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Enter a prompt here"
            />
            
            <div className="input-actions">
              <button onClick={handleSend} className="send-btn rounded-pill" disabled={isLoading}>
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