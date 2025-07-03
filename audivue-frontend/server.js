require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 🔑 Gemini API key — use environment variable for security
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Health check endpoint for Render
app.get('/healthz', (req, res) => res.send('OK'));

// 🎯 Gemini-powered chatbot endpoint
app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  // System prompt for concise, healthcare-specific, and safe responses
  const systemPrompt = `
You are a helpful healthcare chatbot. 
Always answer in a short and concise manner (max 2-3 sentences).
If the prompt is explicit, inappropriate, or unrelated to healthcare, politely refuse to answer.
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    // Concatenate system prompt and user message for correct API usage
    const result = await model.generateContent([
      { text: systemPrompt + "\nUser: " + userMessage }
    ]);
    const response = result.response;
    const reply = response.text();

    res.json({ reply });
  } catch (err) {
    console.error("Gemini error:", err.message);
    res.json({ reply: "Dr. Strange: My connection to the Multiverse failed. Try again later!" });
  }
});

// 🏠 Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(port, () => {
  console.log(`✅ Dr. Strange running at http://localhost:${port}`);
});
