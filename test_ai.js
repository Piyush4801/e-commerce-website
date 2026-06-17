require('dotenv').config();
const { getConversationalProductsStream } = require('./services/aiService');
const { connectDB } = require('./services/dbService');

async function test() {
  await connectDB();
  console.log("Testing stream...");
  await getConversationalProductsStream("Find me a coding laptop", [], (chunk) => {
    console.log("CHUNK:", chunk);
  });
  console.log("Done.");
  process.exit(0);
}

test();
