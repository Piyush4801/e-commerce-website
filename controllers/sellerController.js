const Order = require('../models/Order');
const Product = require('../models/Product');

const getDashboardAnalytics = async (req, res) => {
  try {
    const sellerId = req.user._id;

    // 1. Fetch all seller products
    const products = await Product.find({ sellerId });
    const productIds = products.map(p => p._id.toString());

    // 2. Fetch all orders
    const allOrders = await Order.find({});
    
    // Filter orders containing this seller's products
    const sellerOrders = allOrders.filter(order => 
      order.items.some(item => productIds.includes(item.productId.toString()))
    );

    // 3. Compute Revenue & Order Stats
    let totalRevenue = 0;
    let salesCount = 0;
    const productSalesCount = {}; // Maps productId -> quantity sold

    sellerOrders.forEach(order => {
      // Only count paid/confirmed orders towards revenue
      if (order.paymentStatus === 'paid') {
        order.items.forEach(item => {
          if (productIds.includes(item.productId.toString())) {
            const itemRevenue = item.price * item.quantity;
            totalRevenue += itemRevenue;
            salesCount += item.quantity;

            productSalesCount[item.productId] = (productSalesCount[item.productId] || 0) + item.quantity;
          }
        });
      }
    });

    // 4. Find Top Performing Products
    const sortedProductSales = Object.entries(productSalesCount)
      .map(([id, qty]) => {
        const prod = products.find(p => p._id.toString() === id);
        return {
          id,
          name: prod ? prod.name : 'Unknown Product',
          price: prod ? prod.price : 0,
          quantitySold: qty,
          revenue: qty * (prod ? prod.price : 0)
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // 5. Build Past 7 Days Sales Trend (Charts Data)
    const salesTrend = [];
    const forecastTrend = [];
    
    // Initialize past 7 days (including today)
    for (let d = 6; d >= 0; d--) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      let dayRevenue = 0;
      let daySales = 0;

      sellerOrders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        if (orderDate.toDateString() === date.toDateString() && order.paymentStatus === 'paid') {
          order.items.forEach(item => {
            if (productIds.includes(item.productId.toString())) {
              dayRevenue += item.price * item.quantity;
              daySales += item.quantity;
            }
          });
        }
      });

      salesTrend.push({
        date: dateString,
        revenue: dayRevenue,
        sales: daySales
      });
    }

    // 6. AI-Powered Demand & Inventory Forecasting (7-Day Projection)
    // Simple linear regression / moving average to project trend
    const averageDailyRevenue = salesTrend.reduce((sum, day) => sum + day.revenue, 0) / 7;
    const averageDailySales = salesTrend.reduce((sum, day) => sum + day.sales, 0) / 7;
    
    // Compute simple slope based on first half vs second half of the week
    const firstHalfAvg = (salesTrend[0].revenue + salesTrend[1].revenue + salesTrend[2].revenue) / 3;
    const secondHalfAvg = (salesTrend[4].revenue + salesTrend[5].revenue + salesTrend[6].revenue) / 3;
    const trendMultiplier = firstHalfAvg > 0 ? (secondHalfAvg - firstHalfAvg) / firstHalfAvg : 0.05; // 5% growth if zero initial

    // Predict next 7 days
    for (let f = 1; f <= 7; f++) {
      const date = new Date();
      date.setDate(date.getDate() + f);
      const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Forecast = Base Daily Avg * (1 + Trend factor * compound intervals)
      const projectedRevenue = Math.max(0, Math.round(averageDailyRevenue * (1 + (trendMultiplier * (f / 7)))));
      const projectedSales = Math.max(0, Math.round(averageDailySales * (1 + (trendMultiplier * (f / 7)))));

      forecastTrend.push({
        date: dateString,
        projectedRevenue,
        projectedSales
      });
    }

    // 7. Low Stock Alerts list
    const lowStockAlerts = products
      .filter(p => p.stock <= 5)
      .map(p => ({
        id: p._id,
        name: p.name,
        stock: p.stock,
        category: p.category
      }));

    return res.json({
      success: true,
      analytics: {
        totalProducts: products.length,
        totalOrdersCount: sellerOrders.length,
        totalRevenue,
        salesCount,
        topProducts: sortedProductSales,
        salesTrend,
        forecastTrend, // AI forecast for charts
        lowStockAlerts
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

module.exports = {
  getDashboardAnalytics
};
