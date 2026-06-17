require('dotenv').config();

async function main() {
  const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`
    },
    body: JSON.stringify({
      model: "nvidia/nemotron-3-ultra-550b-a55b",
      messages: [{"role":"user","content":"Hello!"}],
      temperature: 1,
      top_p: 0.95,
      max_tokens: 1024,
      stream: false
    })
  });

  const data = await response.text();
  console.log("Response:", data);
}

main();
