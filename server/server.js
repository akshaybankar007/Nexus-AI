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
    const { message } = req.body;
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


// Temporary route to inject your data
app.get('/api/seed', async (req, res) => {
    try {
        const exists = await User.findOne({ name: "Akshay Yogeshwar Bankar" });
        if (exists) return res.json({ message: "Data already exists!" });

        const myData = new User({
            name: "Akshay Yogeshwar Bankar",
            goals: ["Secure a Software Engineer role ASAP", "Master the MERN stack"],
            skills: ["HTML", "CSS", "JavaScript", "Java (DSA)"],
            personalNotes: "Currently located in Nagpur. Next technologies to learn: TypeScript and Tailwind CSS."
        });

        await myData.save();
        res.json({ message: "Profile successfully created in MongoDB!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));