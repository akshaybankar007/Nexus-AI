require('dotenv').config();
const fs = require('fs');
const { PDFParse } = require('pdf-parse'); // Updated for v2 syntax
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Pinecone } = require('@pinecone-database/pinecone');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index(process.env.PINECONE_INDEX_NAME); 

async function extractTextFromPDF(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    // Use the v2 constructor parameter mapping
    const parser = new PDFParse({ data: dataBuffer });
    const result = await parser.getText();
    await parser.destroy(); // Release parsed resources safely
    return result.text;
}

function chunkText(text, chunkSize = 1000, overlap = 200) {
    const chunks = [];
    for (let i = 0; i < text.length; i += (chunkSize - overlap)) {
        chunks.push(text.substring(i, i + chunkSize));
    }
    return chunks;
}

async function getEmbedding(text) {
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const result = await model.embedContent(text);
    return result.embedding.values;
}

async function ingest() {
    console.log("Reading PDF...");
    const text = await extractTextFromPDF('./Personal Knowledge Base.pdf');
    
    console.log("Chunking text...");
    const chunks = chunkText(text);

    console.log(`Processing ${chunks.length} chunks...`);
    const vectors = [];
    
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        if (!chunk.trim()) continue;
        
        try {
            const embedding = await getEmbedding(chunk);
            vectors.push({
                id: `chunk_${i}`,
                values: embedding,
                metadata: { text: chunk }
            });
        } catch (error) {
            console.error(`Error on chunk ${i}:`, error.message);
        }
    }

    if (vectors.length === 0) {
        return console.error("No valid vectors to upsert.");
    }

    console.log("Upserting to Pinecone...");
    await index.upsert({ records: vectors });
    console.log("Ingestion complete!");
}

ingest().catch(console.error);