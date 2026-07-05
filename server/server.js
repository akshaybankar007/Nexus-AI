const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./User'); 

const app = express();
const PORT = process.env.PORT || 3000; 

app.use(cors()); 
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB error:', err));

app.post('/api/chat', async (req, res) => {
    const { message } = req.body; // Removed 'persona'
    const API_KEY = process.env.GEMINI_API_KEY;
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    try {
        const userData = await User.findOne({ name: "Akshay Yogeshwar Bankar" });
        const contextString = userData ? `Context about me: ${JSON.stringify(userData)}. ` : "";
        const finalPrompt = contextString + message;

        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                systemInstruction: { 
                    // Fixed, straightforward system instruction
                    parts: [{ text: "You are Nexus, a personal AI assistant. Provide short, strictly concise responses straight to the point." }] 
                },
                contents: [{ parts: [{ text: finalPrompt }] }]
            })
        });

        const data = await response.json();
        
        if (data.error) return res.status(500).json({ error: data.error.message });

        res.json({ reply: data.candidates[0].content.parts[0].text });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server failed to reach Gemini." });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));