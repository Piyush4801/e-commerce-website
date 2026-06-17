require('dotenv').config();
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Product = require('../models/Product');

async function embedProducts() {
  if (!process.env.MONGO_URI || !process.env.GEMINI_API_KEY) {
    console.error("Missing MONGO_URI or GEMINI_API_KEY in .env");
    process.exit(1);
  }

  try {
    const { connectDB } = require('../services/dbService');
    await connectDB();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" });

    const products = await Product.find({});
    console.log(`Found ${products.length} products to embed.`);

    let successCount = 0;
    for (const product of products) {
      const textToEmbed = `${product.name} ${product.description} ${product.category}`;
      try {
        const result = await model.embedContent(textToEmbed);
        product.embedding = result.embedding.values;
        await Product.findByIdAndUpdate(product._id || product.id, { $set: { embedding: result.embedding.values } });
        successCount++;
        console.log(`✅ Embedded: ${product.name}`);
      } catch (err) {
        console.error(`❌ Failed to embed: ${product.name}`, err.message);
      }
      
      // Delay to avoid hitting rate limits on the free tier
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n🎉 Successfully embedded ${successCount}/${products.length} products!`);
    process.exit(0);
  } catch (error) {
    console.error("Script failed:", error);
    process.exit(1);
  }
}

embedProducts();
