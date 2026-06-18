const OpenAI = require('openai');
const Product = require('../models/Product');

// A list of stop words and helpers to find clean categories
const CATEGORIES = ['Electronics', 'Fashion', 'Books', 'Grocery', 'Beauty', 'Sports', 'Home & Kitchen'];

const keywordToCategoryMap = {
  laptop: 'Electronics',
  phone: 'Electronics',
  headphone: 'Electronics',
  earbud: 'Electronics',
  tv: 'Electronics',
  television: 'Electronics',
  camera: 'Electronics',
  shoe: 'Fashion',
  shirt: 'Fashion',
  tshirt: 'Fashion',
  jeans: 'Fashion',
  dress: 'Fashion',
  jacket: 'Fashion',
  book: 'Books',
  novel: 'Books',
  read: 'Books',
  apple: 'Grocery',
  milk: 'Grocery',
  tea: 'Grocery',
  coffee: 'Grocery',
  shampoo: 'Beauty',
  cream: 'Beauty',
  perfume: 'Beauty',
  lipstick: 'Beauty',
  football: 'Sports',
  running: 'Sports',
  cricket: 'Sports',
  bat: 'Sports',
  yoga: 'Sports',
  pan: 'Home & Kitchen',
  knife: 'Home & Kitchen',
  blender: 'Home & Kitchen',
  chair: 'Home & Kitchen',
  sofa: 'Home & Kitchen'
};

const parseConversation = (text) => {
  const normalizedText = text.toLowerCase();
  
  // 1. Extract Budget
  let budget = null;
  // Patterns like: under 60000, under rs. 60,000, under ₹60,000, below 3000, less than 50000
  const budgetRegex = /(?:under|below|less than|rs\.?|₹)\s*([\d,]+)/i;
  const match = normalizedText.match(budgetRegex);
  if (match) {
    budget = parseFloat(match[1].replace(/,/g, ''));
  }

  // 2. Identify Category
  let category = null;
  for (let cat of CATEGORIES) {
    if (normalizedText.includes(cat.toLowerCase())) {
      category = cat;
      break;
    }
  }

  // If category wasn't explicit, map keywords
  if (!category) {
    for (let key in keywordToCategoryMap) {
      if (normalizedText.includes(key)) {
        category = keywordToCategoryMap[key];
        break;
      }
    }
  }

  // 3. Extract search query (remove budget mentions and standard helper words)
  let cleanQuery = normalizedText
    .replace(/(?:under|below|less than|rs\.?|₹)\s*[\d,]+/g, '')
    .trim();

  // Remove trailing punctuations
  cleanQuery = cleanQuery.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();

  return {
    query: cleanQuery,
    category,
    budget
  };
};

const getConversationalProducts = async (text, history = []) => {
  const normalizedText = text.toLowerCase().trim();
  const greetingPatterns = [
    /^(hi|hello|hey|greetings)(?:\s.*)?$/,
    /^what can you do\??$/,
    /^who are you\??$/,
    /^help\??$/
  ];

  if (history.length === 0 && greetingPatterns.some(pattern => pattern.test(normalizedText))) {
    return {
      parsed: { query: text },
      products: [],
      explanation: "Hello! I am SmartCart AI, your personal shopping assistant. I can help you find products, suggest items based on your budget (e.g., 'running shoes under ₹3000'), and provide smart recommendations. What are you looking for today?"
    };
  }

  // --- NVIDIA LLM INTEGRATION (Phase 1: Memory & Function Calling) ---
  console.log("KEY IS:", process.env.NVIDIA_API_KEY);
  if (process.env.NVIDIA_API_KEY) {
    try {
      const openai = new OpenAI({
        baseURL: "https://integrate.api.nvidia.com/v1",
        apiKey: process.env.NVIDIA_API_KEY
      });
      
      const searchProductsTool = {
        type: "function",
        function: {
          name: "search_products",
          description: "Search the e-commerce product catalog based on user criteria.",
          parameters: {
            type: "object",
            properties: {
              category: {
                type: "string",
                description: "The product category. Must be exactly one of: Electronics, Fashion, Books, Grocery, Beauty & Personal Care, Sports, Home & Kitchen"
              },
              budget: {
                type: "number",
                description: "The maximum price the user is willing to pay in INR."
              },
              keywords: {
                type: "array",
                items: { type: "string" },
                description: "Key search terms to look for in product titles or descriptions."
              }
            }
          }
        }
      };

      const chatHistory = [{
        role: "system",
        content: "You are SmartCart AI, a friendly and helpful e-commerce shopping assistant. Use the search_products tool when the user asks for recommendations. Remember their previous messages for context."
      }];

      history.forEach(msg => {
        chatHistory.push({
          role: msg.role === 'model' ? 'assistant' : 'user',
          content: msg.parts[0].text
        });
      });
      chatHistory.push({ role: 'user', content: text });

      const completion = await openai.chat.completions.create({
        model: "meta/llama-3.1-8b-instruct",
        messages: chatHistory,
        tools: [searchProductsTool],
        temperature: 1,
        top_p: 0.95,
        max_tokens: 1024,
      });

      let productsFound = [];
      let parsedParams = {};

      const message = completion.choices[0].message;
      let functionCall = null;

      if (message.tool_calls && message.tool_calls.length > 0) {
        functionCall = message.tool_calls[0].function;
      }

      let responseText = message.content || "";

      if (functionCall && functionCall.name === "search_products") {
        const args = JSON.parse(functionCall.arguments);
        parsedParams = args;
        
        let filter = {};
        if (args.category) {
          filter.category = { $regex: new RegExp(args.category, 'i') };
        }
        
        let products = await Product.find(filter);
        
        if (args.budget) {
          products = products.filter(p => p.price <= args.budget);
        }
        
        if (args.keywords && args.keywords.length > 0) {
          // No NVIDIA embedding model specified, using text matching fallback
          products = products.filter(p => {
            return args.keywords.every(k => {
              const term = k.toLowerCase();
              const textToSearch = (p.name + ' ' + p.description + ' ' + p.category).toLowerCase();
              return textToSearch.includes(term);
            });
          });
        }

        productsFound = products.slice(0, 5);

        // Send the function response back to the model
        chatHistory.push(message);
        chatHistory.push({
          role: "tool",
          tool_call_id: message.tool_calls[0].id,
          name: "search_products",
          content: JSON.stringify({
            products: productsFound.map(p => ({
              name: p.name,
              price: p.price,
              rating: p.rating,
              ecoScore: p.sustainability?.ecoScore
            }))
          })
        });

        const secondCompletion = await openai.chat.completions.create({
          model: "meta/llama-3.1-8b-instruct",
          messages: chatHistory,
          temperature: 1,
          top_p: 0.95,
          max_tokens: 1024,
        });
        
        responseText = secondCompletion.choices[0].message.content || "";
      }
      
      return {
        parsed: { query: text, ...parsedParams },
        products: productsFound,
        explanation: responseText
      };
      
    } catch (err) {
      console.error("Gemini API Error, falling back to legacy algorithm:", err);
      // Fallback to legacy logic below
    }
  }

  // --- LEGACY ALGORITHM FALLBACK ---
  const parsed = parseConversation(text);
  let filter = {};
  
  if (parsed.category) {
    filter.category = parsed.category;
  }

  let products = await Product.find(filter);

  // Filter by budget
  if (parsed.budget) {
    products = products.filter(p => p.price <= parsed.budget);
  }

  // Filter by text search query keywords
  if (parsed.query && parsed.query.length > 1) {
    const stopWords = new Set(['tell', 'me', 'about', 'this', 'product', 'my', 'budget', 'is', 'of', 'rs', 'the', 'a', 'an', 'and', 'or', 'for', 'to', 'in', 'with', 'on', 'can', 'you', 'i', 'need', 'want', 'show', 'suggest', 'find', 'looking', 'good', 'best', 'sleek', 'cheap', 'premium', 'under', 'below', 'less', 'than', 'rupees', 'more', 'some', 'any', 'other', 'another', 'mote', 'all']);
    const keywords = parsed.query.split(/\s+/).filter(k => k.length > 2 && !stopWords.has(k.toLowerCase()));
    
    if (keywords.length > 0) {
      products = products.filter(p => {
        return keywords.every(k => {
          const term = k.toLowerCase();
          const stem1 = term.replace(/s$/, '');
          const stem2 = term.replace(/es$/, '');
          const textToSearch = (p.name + ' ' + p.description + ' ' + p.category).toLowerCase();
          return textToSearch.includes(term) || textToSearch.includes(stem1) || textToSearch.includes(stem2);
        });
      });
    }
  }

  // Generate explanation
  let explanation = '';
  if (products.length > 0) {
    const bestChoice = [...products].sort((a, b) => b.rating - a.rating)[0];
    explanation = `Based on your request, I scanned our inventory${parsed.category ? ` in ${parsed.category}` : ''}${parsed.budget ? ` with a budget under ₹${parsed.budget.toLocaleString()}` : ''}. I found ${products.length} options.\n\nThe top recommendation is **${bestChoice.name}** (Rating: ${bestChoice.rating}⭐, ₹${bestChoice.price.toLocaleString()}) because it offers the highest rating and includes premium specifications matching your query. It also boasts a sustainability eco-score of "${bestChoice.sustainability.ecoScore}".`;
  } else {
    explanation = `I analyzed your request for "${parsed.query}"${parsed.budget ? ` under ₹${parsed.budget.toLocaleString()}` : ''}, but we don't have matching products${parsed.budget ? ' in that budget range' : ''} at the moment. Try adjusting your query.`;
  }

  return {
    parsed,
    products: products.slice(0, 5), // Limit to top 5 recommendations
    explanation
  };
};

// Phase 2: Streaming (SSE) Version
const getConversationalProductsStream = async (text, history = [], onChunk) => {
  const normalizedText = text.toLowerCase().trim();
  const greetingPatterns = [
    /^(hi|hello|hey|greetings)(?:\s.*)?$/,
    /^what can you do\??$/,
    /^who are you\??$/,
    /^help\??$/
  ];

  if (history.length === 0 && greetingPatterns.some(pattern => pattern.test(normalizedText))) {
    onChunk(JSON.stringify({ type: 'text', text: "Hello! I am SmartCart AI, your personal shopping assistant. I can help you find products, suggest items based on your budget (e.g., 'running shoes under ₹3000'), and provide smart recommendations. What are you looking for today?" }) + '\n\n');
    onChunk(JSON.stringify({ type: 'done' }) + '\n\n');
    return;
  }

  console.log("KEY IS:", process.env.NVIDIA_API_KEY);
  if (process.env.NVIDIA_API_KEY) {
    try {
      const openai = new OpenAI({
        baseURL: "https://integrate.api.nvidia.com/v1",
        apiKey: process.env.NVIDIA_API_KEY
      });

      // Local fallback parsing since Nemotron tool calling hangs
      const parsed = parseConversation(text);
      let filter = {};
      if (parsed.category) filter.category = parsed.category;
      let products = await Product.find(filter);
      
      if (parsed.budget) {
        products = products.filter(p => p.price <= parsed.budget);
      }

      if (parsed.query && parsed.query.length > 1) {
        const stopWords = ['just', 'give', 'me', 'all', 'the', 'that', 'are', 'available', 'show', 'suggest', 'find', 'looking', 'for', 'a', 'an', 'in', 'on', 'with', 'and', 'is', 'to', 'can', 'you', 'i', 'want', 'need', 'some', 'any', 'please', 'good', 'best', 'cheap', 'premium'];
        const keywords = parsed.query.split(/\s+/).filter(k => k.length > 2 && !stopWords.includes(k));
        
        if (keywords.length > 0) {
          products = products.map(p => {
            const text = (p.name + ' ' + p.description + ' ' + p.category).toLowerCase();
            let score = 0;
            for (let k of keywords) {
              const singular = k.endsWith('s') ? k.slice(0, -1) : k;
              if (text.includes(k) || text.includes(singular)) score += 1;
            }
            return { product: p, score };
          }).filter(p => p.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(p => p.product);
        }
      }

      const productsFound = products.slice(0, 5).map(p => {
        const obj = p.toObject ? p.toObject() : p;
        delete obj.embedding;
        return obj;
      });
      
      // Stream products to UI immediately
      onChunk(JSON.stringify({ type: 'products', products: productsFound }) + '\n\n');

      const systemPrompt = `You are SmartCart AI, a friendly e-commerce shopping assistant.
The user asked for: "${text}".
I searched the database and found these top matching products:
${JSON.stringify(productsFound.map(p => ({ name: p.name, price: p.price, rating: p.rating, ecoScore: p.sustainability?.ecoScore })), null, 2)}
If products were found, summarize them warmly and recommend the best one. If no products were found, apologize and suggest they try another search. Do not hallucinate products.`;

      const chatHistory = [{ role: "system", content: systemPrompt }];

      history.forEach(msg => {
        chatHistory.push({
          role: msg.role === 'model' ? 'assistant' : 'user',
          content: msg.parts[0].text
        });
      });
      chatHistory.push({ role: 'user', content: text });

      const stream = await openai.chat.completions.create({
        model: "meta/llama-3.1-8b-instruct",
        messages: chatHistory,
        temperature: 1,
        top_p: 0.95,
        max_tokens: 4000,
        stream: true
      });
      
      for await (const chunk of stream) {
        const reasoning = chunk.choices[0]?.delta?.reasoning_content;
        if (reasoning) {
          // Stream reasoning as italicized text if desired, or just normal text
          onChunk(JSON.stringify({ type: 'text', text: reasoning }) + '\n\n');
        }
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          onChunk(JSON.stringify({ type: 'text', text: content }) + '\n\n');
        }
      }
      
      onChunk(JSON.stringify({ type: 'done' }) + '\n\n');
      return;
    } catch (err) {
      console.error("Streaming error:", err);
      let errMsg = err.message || 'Unknown';
      if (errMsg.includes('429 Too Many Requests') || errMsg.includes('exceeded your current quota')) {
        errMsg = "I am receiving too many requests right now. Please wait a minute and try again.";
      } else {
        errMsg = "I encountered an internal error. Please try again later.";
      }
      onChunk(JSON.stringify({ type: 'text', text: errMsg }) + '\n\n');
      onChunk(JSON.stringify({ type: 'done' }) + '\n\n');
      return;
    }
  }

  // --- LEGACY ALGORITHM FALLBACK ---
  const parsed = parseConversation(text);
  let filter = {};
  if (parsed.category) filter.category = parsed.category;
  let products = await Product.find(filter);
  
  if (parsed.budget) {
    products = products.filter(p => p.price <= parsed.budget);
  }

  if (parsed.query && parsed.query.length > 1) {
    const stopWords = new Set(['tell', 'me', 'about', 'this', 'product', 'my', 'budget', 'is', 'of', 'rs', 'the', 'a', 'an', 'and', 'or', 'for', 'to', 'in', 'with', 'on', 'can', 'you', 'i', 'need', 'want', 'show', 'suggest', 'find', 'looking', 'good', 'best', 'sleek', 'cheap', 'premium', 'under', 'below', 'less', 'than', 'rupees', 'more', 'some', 'any', 'other', 'another', 'mote', 'all']);
    const keywords = parsed.query.split(/\s+/).filter(k => k.length > 2 && !stopWords.has(k.toLowerCase()));
    
    if (keywords.length > 0) {
      products = products.filter(p => {
        return keywords.every(k => {
          const term = k.toLowerCase();
          const stem1 = term.replace(/s$/, '');
          const stem2 = term.replace(/es$/, '');
          const textToSearch = (p.name + ' ' + p.description + ' ' + p.category).toLowerCase();
          return textToSearch.includes(term) || textToSearch.includes(stem1) || textToSearch.includes(stem2);
        });
      });
    }
  }

  const productsFound = products.slice(0, 5).map(p => {
    const obj = p.toObject ? p.toObject() : p;
    delete obj.embedding;
    return obj;
  });

  onChunk(JSON.stringify({ type: 'products', products: productsFound }) + '\\n\\n');

  let explanation = '';
  if (productsFound.length > 0) {
    const bestChoice = [...productsFound].sort((a, b) => b.rating - a.rating)[0];
    explanation = `Based on your request, I scanned our inventory${parsed.category ? ` in ${parsed.category}` : ''}${parsed.budget ? ` with a budget under ₹${parsed.budget.toLocaleString()}` : ''}. I found ${productsFound.length} options.\\n\\nThe top recommendation is **${bestChoice.name}** (Rating: ${bestChoice.rating}⭐, ₹${bestChoice.price.toLocaleString()}) because it offers the highest rating and matches your query.`;
  } else {
    explanation = `I analyzed your request for "${parsed.query}"${parsed.budget ? ` under ₹${parsed.budget.toLocaleString()}` : ''}, but we don't have matching products${parsed.budget ? ' in that budget range' : ''} at the moment. Try adjusting your query.`;
  }

  // Stream the explanation text
  const words = explanation.split(' ');
  for (let i = 0; i < words.length; i++) {
    onChunk(JSON.stringify({ type: 'text', text: words[i] + (i === words.length - 1 ? '' : ' ') }) + '\\n\\n');
    await new Promise(r => setTimeout(r, 30)); // Fake streaming delay
  }

  onChunk(JSON.stringify({ type: 'done' }) + '\\n\\n');
};

// Recommendation Algorithms
const getPersonalizedRecommendations = async (userId) => {
  // Simple logic: return top-rated green products and popular items
  const products = await Product.find({});
  return products
    .sort((a, b) => (b.rating * 10 + (a.sustainability.ecoScore === 'A' ? 20 : 0)) - (a.rating * 10 + (b.sustainability.ecoScore === 'A' ? 20 : 0)))
    .slice(0, 6);
};

const getSimilarProducts = async (productId) => {
  const current = await Product.findById(productId);
  if (!current) return [];
  const allInCat = await Product.find({ category: current.category });
  return allInCat
    .filter(p => p._id.toString() !== productId.toString())
    .sort((a, b) => Math.abs(a.price - current.price) - Math.abs(b.price - current.price))
    .slice(0, 4);
};

const getFrequentlyBoughtTogether = async (productId) => {
  const current = await Product.findById(productId);
  if (!current) return [];

  // Association rules:
  // Electronics -> charger, case, mouse, screen protector
  // Fashion -> belt, socks, shoes
  // Home & Kitchen -> cleaning brush, kitchen towel
  // Sports -> water bottle, wrist band
  const crossSellMap = {
    'Electronics': { query: 'mouse', defaultName: 'SmartCart Wireless Mouse' },
    'Fashion': { query: 'belt', defaultName: 'Premium Leather Belt' },
    'Books': { query: 'bookmark', defaultName: 'Eco Bookmark Set' },
    'Grocery': { query: 'bag', defaultName: 'Reusable Grocery Bag' },
    'Beauty': { query: 'mirror', defaultName: 'LED Travel Mirror' },
    'Sports': { query: 'bottle', defaultName: 'Stainless Steel Water Bottle' },
    'Home & Kitchen': { query: 'apron', defaultName: 'Organic Cotton Apron' }
  };

  const map = crossSellMap[current.category];
  if (map) {
    const items = await Product.find({ 
      $or: [
        { name: { $regex: map.query, $options: 'i' } },
        { category: current.category }
      ]
    });
    return items.filter(p => p._id.toString() !== productId.toString()).slice(0, 2);
  }

  const defaultProducts = await Product.find({});
  return defaultProducts.filter(p => p._id.toString() !== productId.toString()).slice(0, 2);
};

module.exports = {
  parseConversation,
  getConversationalProducts,
  getConversationalProductsStream,
  getPersonalizedRecommendations,
  getSimilarProducts,
  getFrequentlyBoughtTogether
};
