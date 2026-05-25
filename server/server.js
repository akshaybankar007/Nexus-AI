const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Load FAQ data
let faqData = [];
try {
    const rawData = fs.readFileSync(path.join(__dirname, 'faq.json'), 'utf-8');
    faqData = JSON.parse(rawData);
} catch (err) {
    console.error("Error loading FAQ data:", err.message);
}

function getLocalAnswer(query) {
    if (!query) return null;
    const lowerQuery = query.toLowerCase();
    for (const faq of faqData) {
        if (faq.question.toLowerCase().includes(lowerQuery)) {
            return faq.answer;
        }
    }
    return null;
}

app.post('/api/generate', async (req, res) => {
    try {
        const userQuery = req.body.contents?.[0]?.parts?.[0]?.text;
        if (!userQuery) {
            return res.status(400).json({ error: 'Invalid request format' });
        }

        // 1. Check Local FAQ
        const localAnswer = getLocalAnswer(userQuery);
        if (localAnswer) {
            return res.json({
                candidates: [{
                    content: { parts: [{ text: localAnswer }] }
                }]
            });
        }

        // 2. Fallback to Gemini
        const geminiPayload = req.body;
        const geminiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        
        const geminiResponse = await axios.post(
            geminiEndpoint,
            geminiPayload,
            {
                params: { key: process.env.GEMINI_API_KEY },
                headers: { 'Content-Type': 'application/json' }
            }
        );
        res.json(geminiResponse.data);

    } catch (error) {
        console.error('API Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ 
            candidates: [{ 
                content: { parts: [{ text: "I'm having trouble connecting to the server right now." }] } 
            }] 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));