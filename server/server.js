const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./User'); 
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Pinecone } = require('@pinecone-database/pinecone');

const app = express();
const PORT = process.env.PORT || 3000; 

app.use(cors()); 
app.use(express.json());

// Initialize AI and Vector DB clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index(process.env.PINECONE_INDEX_NAME);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB error:', err));

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    try {
        // 1. Fetch static profile data from MongoDB
        const userData = await User.findOne({ name: "Akshay Yogeshwar Bankar" });
        let contextString = userData ? `Context about me: ${JSON.stringify(userData)}. ` : "";

        // 2. Fetch dynamic context from Pinecone (RAG)
        try {
            const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
            const embeddingResult = await embeddingModel.embedContent(message);
            const queryEmbedding = embeddingResult.embedding.values;

            const queryResponse = await index.query({
                vector: queryEmbedding,
                topK: 3,
                includeMetadata: true
            });

            const pdfChunks = queryResponse.matches.map(match => match.metadata.text).join("\n");
            if (pdfChunks) {
                contextString += `\nAdditional verified knowledge base facts:\n${pdfChunks}\n`;
            }
        } catch (ragError) {
            console.error("RAG Retrieval warning:", ragError.message);
        }

        // 3. Construct the augmented prompt
        const finalPrompt = contextString + `\nUser question: ${message}`;

        // 4. Send request to Gemini
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                systemInstruction: { 
                    parts: [{ text: "You are Nexus, a personal AI assistant. Provide short, strictly concise responses straight to the point. Use the provided context and knowledge base facts to answer accurately." }] 
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