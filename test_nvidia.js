require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY
});

async function main() {
  console.log("Testing tool calling with meta/llama-3.1-70b-instruct...");
  
  const searchProductsTool = {
    type: "function",
    function: {
      name: "search_products",
      description: "Search products based on user needs.",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string" },
          budget: { type: "number" }
        }
      }
    }
  };

  try {
    const completion = await openai.chat.completions.create({
      model: "meta/llama-3.1-70b-instruct",
      messages: [{"role":"user","content":"I need a cheap laptop under 500 dollars."}],
      tools: [searchProductsTool],
      temperature: 0.1,
      top_p: 0.95,
      max_tokens: 1024,
    });
    
    const msg = completion.choices[0].message;
    console.log("Message Output:", JSON.stringify(msg, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
