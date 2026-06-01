const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
// Using port 3000 to match your .env file
const PORT = process.env.PORT || 3000; 

// Middleware
app.use(cors()); 
app.use(express.json());

// Main API Route
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
            })
        });

        const data = await response.json();
        
        // Error handling if Gemini rejects the key or request
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