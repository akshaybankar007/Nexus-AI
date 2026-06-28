const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000; 

app.use(cors()); 
app.use(express.json());

const getSystemInstruction = (persona) => {
    switch(persona) {
        case 'Interviewer':
            return "You are a strict technical interviewer. Conduct mock interviews focused on Data Structures (Java) and JavaScript/MERN stack. Ask one question at a time and critically evaluate the user's answers.";
        case 'Mentor':
            return "You are an expert coding mentor. Provide extremely concise, direct code solutions and brief explanations for JavaScript, HTML, CSS, and Java. Go straight to the point.";
        default:
            return "You are Nexus, a helpful AI assistant. Provide short, strictly concise responses.";
    }
};

app.post('/api/chat', async (req, res) => {
    const { message, persona } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{ text: getSystemInstruction(persona) }]
                },
                contents: [{ parts: [{ text: message }] }]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            console.error("Gemini API Error:", data.error.message);
            return res.status(500).json({ error: "API Key or request format invalid." });
        }

        const botReply = data.candidates[0].content.parts[0].text;
        res.json({ reply: botReply });

    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ error: "Server failed to reach Gemini." });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running securely on http://localhost:${PORT}`);
});