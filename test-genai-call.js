const { GoogleGenAI } = require("@google/genai");

async function test() {
  const ai = new GoogleGenAI({ apiKey: "FAKE_KEY" });
  try {
    await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [
            "What is this?",
            { inlineData: { data: "base64==", mimeType: "application/pdf" } }
        ]
    });
  } catch (e) {
    console.log("Error generated:", e.message);
  }
}

test();
