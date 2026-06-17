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
    .replace(/(?:i need|i want|show me|suggest|find|looking for|good|best|sleek|cheap|premium)/g, '')
    .trim();

  // Remove trailing punctuations
  cleanQuery = cleanQuery.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();

  return {
    query: cleanQuery,
    category,
    budget
  };
};

const getConversationalProducts = async (text) => {
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
    const stopWords = new Set(['tell', 'me', 'about', 'this', 'product', 'my', 'budget', 'is', 'of', 'rs', 'the', 'a', 'an', 'and', 'or', 'for', 'to', 'in', 'with', 'on', 'can', 'you', 'i', 'need', 'want', 'show', 'suggest', 'find', 'looking', 'good', 'best', 'sleek', 'cheap', 'premium', 'under', 'below', 'less', 'than', 'rupees']);
    const keywords = parsed.query.split(/\s+/).filter(k => k.length > 2 && !stopWords.has(k.toLowerCase()));
    
    if (keywords.length > 0) {
      products = products.filter(p => {
        return keywords.some(k => 
          p.name.toLowerCase().includes(k) || 
          p.description.toLowerCase().includes(k)
        );
      });
    }
  }

  // Generate explanation
  let explanation = '';
  if (products.length > 0) {
    const bestChoice = [...products].sort((a, b) => b.rating - a.rating)[0];
    explanation = `Based on your request, I scanned our inventory${parsed.category ? ` in ${parsed.category}` : ''}${parsed.budget ? ` with a budget under ₹${parsed.budget.toLocaleString()}` : ''}. I found ${products.length} options. 

The top recommendation is **${bestChoice.name}** (Rating: ${bestChoice.rating}⭐, ₹${bestChoice.price.toLocaleString()}) because it offers the highest rating and includes premium specifications matching your query. It also boasts a sustainability eco-score of "${bestChoice.sustainability.ecoScore}".`;
  } else {
    explanation = `I analyzed your request for "${parsed.query}"${parsed.budget ? ` under ₹${parsed.budget.toLocaleString()}` : ''}, but we don't have matching products${parsed.budget ? ' in that budget range' : ''} at the moment. Try adjusting your query.`;
  }

  return {
    parsed,
    products: products.slice(0, 5), // Limit to top 5 recommendations
    explanation
  };
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
  getPersonalizedRecommendations,
  getSimilarProducts,
  getFrequentlyBoughtTogether
};
