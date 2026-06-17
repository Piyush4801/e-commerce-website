const Product = require('../models/Product');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const aiService = require('../services/aiService');
const Order = require('../models/Order');

// Query, Search, Filters, Pagination
const getProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, minRating, sort, limit = 20, page = 1 } = req.query;

    let filter = {};

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let products = await Product.find(filter);

    // Filter by price
    if (minPrice) {
      products = products.filter(p => p.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      products = products.filter(p => p.price <= parseFloat(maxPrice));
    }

    // Filter by rating bracket (e.g. 4 means 4.0 to 4.9)
    if (minRating) {
      const ratingVal = parseInt(minRating);
      if (ratingVal === 5) {
        products = products.filter(p => p.rating === 5.0);
      } else {
        products = products.filter(p => Math.floor(p.rating) === ratingVal);
      }
    }

    // Sort
    if (sort === 'price_asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      products.sort((a, b) => b.rating - a.rating);
    } else {
      // Newest
      products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Pagination
    const total = products.length;
    const startIndex = (page - 1) * limit;
    const paginatedProducts = products.slice(startIndex, startIndex + parseInt(limit));

    return res.json({
      success: true,
      products: paginatedProducts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    req.error = error;
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    return res.json({ success: true, product });
  } catch (error) {
    req.error = error;
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, images, sustainability } = req.body;

    const productImages = images || ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'];
    const firstImage = productImages[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';

    const newProduct = await Product.create({
      name,
      description,
      price: parseFloat(price),
      category,
      stock: parseInt(stock),
      sellerId: req.user._id,
      sellerName: req.user.name,
      images: productImages,
      image: firstImage,
      imageUrl: firstImage,
      thumbnail: firstImage,
      sustainability: sustainability || { ecoScore: 'C', ecoRating: 3.0, carbonFootprint: 5.0 }
    });

    // Alert if stock is low immediately on create
    if (newProduct.stock <= 5) {
      await Notification.create({
        userId: req.user._id,
        title: '⚠️ Low Stock Warning',
        message: `Product "${name}" was created with low stock (${stock} remaining).`,
        type: 'warning'
      });
    }

    return res.status(201).json({ success: true, message: 'Product created successfully.', product: newProduct });
  } catch (error) {
    req.error = error;
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, images, sustainability } = req.body;
    const prodId = req.params.id;

    const product = await Product.findById(prodId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Auth check: Admin or the matching Seller
    if (req.user.role !== 'admin' && product.sellerId !== req.user._id) {
      return res.status(403).json({ success: false, message: 'Unauthorized. You do not own this product.' });
    }

    const updatedImages = images || product.images;
    const firstImage = (updatedImages && updatedImages[0]) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';

    const updated = await Product.findByIdAndUpdate(prodId, {
      name,
      description,
      price: price ? parseFloat(price) : product.price,
      category: category || product.category,
      stock: stock !== undefined ? parseInt(stock) : product.stock,
      images: updatedImages,
      image: firstImage,
      imageUrl: firstImage,
      thumbnail: firstImage,
      sustainability: sustainability || product.sustainability,
      updatedAt: new Date().toISOString()
    }, { new: true });

    // Stock alert checks
    if (updated.stock <= 5 && updated.stock < product.stock) {
      await Notification.create({
        userId: product.sellerId,
        title: '⚠️ Low Stock Alert',
        message: `Product "${updated.name}" is running low on stock (${updated.stock} left).`,
        type: 'warning'
      });
    }

    return res.json({ success: true, message: 'Product updated successfully.', product: updated });
  } catch (error) {
    req.error = error;
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const prodId = req.params.id;
    const product = await Product.findById(prodId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (req.user.role !== 'admin' && product.sellerId !== req.user._id) {
      return res.status(403).json({ success: false, message: 'Unauthorized action.' });
    }

    await Product.deleteOne({ _id: prodId });
    return res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    req.error = error;
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// Reviews
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId });
    return res.json({ success: true, reviews });
  } catch (error) {
    req.error = error;
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

const addReview = async (req, res) => {
  try {
    const { rating, comment, title, images } = req.body;
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    // 1. Verify buyer purchase and delivery status
    const userOrders = await Order.find({ customerId: req.user._id, orderStatus: 'delivered' });
    const hasPurchased = userOrders.some(order => 
      order.items.some(item => item.productId === productId)
    );

    if (!hasPurchased) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only verified buyers who have received this product can write a review.' 
      });
    }

    // 2. Check if user already reviewed this product
    const existingReview = await Review.findOne({ productId, customerId: req.user._id });
    if (existingReview) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already submitted a review for this product.' 
      });
    }

    const newReview = await Review.create({
      productId,
      customerId: req.user._id,
      customerName: req.user.name,
      rating: parseInt(rating),
      title: title || '',
      comment,
      images: images || []
    });

    // Recalculate average rating
    const reviews = await Review.find({ productId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(productId, {
      rating: parseFloat(avgRating.toFixed(1)),
      reviewCount: reviews.length
    });

    // Notify seller of new review
    const io = req.app.get('socketio');
    if (io && product.sellerId) {
      io.to(product.sellerId).emit('notification', {
        title: '🔔 Product Review Added',
        message: `Your product "${product.name}" received a ${rating}-star review.`,
        type: 'info'
      });
      await Notification.create({
        userId: product.sellerId,
        title: '🔔 Product Review Added',
        message: `Your product "${product.name}" received a ${rating}-star review.`,
        type: 'info'
      });
    }

    return res.status(201).json({ success: true, message: 'Review added successfully.', review: newReview });
  } catch (error) {
    req.error = error;
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// Conversational AI Search Endpoint (Streaming)
const searchConversational = async (req, res) => {
  try {
    const { text, history } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Text prompt query is required.' });
    }

    // Set headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    await aiService.getConversationalProductsStream(text, history || [], (chunk) => {
      res.write(`data: ${chunk}`);
    });
    
    res.end();
  } catch (error) {
    req.error = error;
    console.error("Streaming error:", error);
    // If headers are already sent, we can't send a JSON 500 response, just end the stream
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
    res.end();
  }
};

// AI Recommendations Endpoints
const getRecommendations = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : 'guest';
    const products = await aiService.getPersonalizedRecommendations(userId);
    return res.json({ success: true, products });
  } catch (error) {
    req.error = error;
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

const getSimilar = async (req, res) => {
  try {
    const products = await aiService.getSimilarProducts(req.params.productId);
    return res.json({ success: true, products });
  } catch (error) {
    req.error = error;
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

const getBoughtTogether = async (req, res) => {
  try {
    const products = await aiService.getFrequentlyBoughtTogether(req.params.productId);
    return res.json({ success: true, products });
  } catch (error) {
    req.error = error;
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getReviews,
  addReview,
  searchConversational,
  getRecommendations,
  getSimilar,
  getBoughtTogether
};
