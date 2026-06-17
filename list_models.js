require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key");
    return;
  }
  const req = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey);
  const res = await req.json();
  if (res.error) {
    console.error(res.error);
    return;
  }
  const embedModels = res.models.filter(m => m.name.includes("embed"));
  console.log("Embed models:");
  console.log(embedModels.map(m => m.name));
}

listModels();
