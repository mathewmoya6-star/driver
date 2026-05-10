const fetch = require("node-fetch");

async function askGemini(message) {
    const API_KEY = process.env.GEMINI_API_KEY;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `
You are a professional Kenyan driving instructor AI tutor.

Rules:
- Explain simply
- Use Kenya Highway Code context
- Be clear and practical

User: ${message}
                        `
                    }]
                }]
            })
        }
    );

    const data = await response.json();

    return data?.candidates?.[0]?.content?.parts?.[0]?.text 
        || "I couldn't generate a response.";
}

module.exports = { askGemini };
