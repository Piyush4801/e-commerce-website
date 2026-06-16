const bcrypt = require('bcryptjs');

// Helper to hash passwords consistently
const hashPassword = (pwd) => bcrypt.hashSync(pwd, 10);

const categories = ['Electronics', 'Fashion', 'Books', 'Grocery', 'Beauty', 'Sports', 'Home & Kitchen'];

const generateDummyData = () => {
  const users = [];
  const products = [];
  const orders = [];
  const coupons = [];
  const reviews = [];
  const notifications = [];
  const fraudReports = [];

  // 1. Generate Admin
  users.push({
    _id: 'admin_id',
    name: 'System Admin',
    email: 'admin@smartcart.com',
    password: hashPassword('Admin@123'),
    phone: '+15550100',
    role: 'admin',
    status: 'active',
    addresses: [],
    rewardPoints: 0,
    tier: 'Platinum',
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
  });

  // 2. Generate 10 Sellers
  for (let i = 1; i <= 10; i++) {
    users.push({
      _id: `seller_${i}`,
      name: `Vendor Elite ${i}`,
      email: i === 1 ? 'seller@smartcart.com' : `seller${i}@smartcart.com`,
      password: hashPassword('Seller@123'),
      phone: `+9198765432${i-1}`,
      role: 'seller',
      status: i === 10 ? 'pending_verification' : 'active', // 1 pending for approval demo
      addresses: [{
        street: `${i * 12} Industrial Estate`,
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India',
        isDefault: true
      }],
      rewardPoints: 100 * i,
      tier: i > 7 ? 'Gold' : 'Silver',
      createdAt: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString()
    });
  }

  // 3. Generate 20 Customers
  for (let i = 1; i <= 20; i++) {
    const points = i * 150;
    let tier = 'Bronze';
    if (points > 1500) tier = 'Gold';
    else if (points > 500) tier = 'Silver';

    users.push({
      _id: `customer_${i}`,
      name: `Shopper Name ${i}`,
      email: i === 1 ? 'customer@smartcart.com' : `customer${i}@smartcart.com`,
      password: hashPassword('Customer@123'),
      phone: `+9199988877${String(i).padStart(2, '0')}`,
      role: 'customer',
      status: 'active',
      addresses: [
        {
          street: `${i}01 Park Avenue`,
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
          country: 'India',
          isDefault: true
        },
        {
          street: `Flat ${i}B, Sky Towers`,
          city: 'Delhi',
          state: 'NCR',
          zipCode: '110001',
          country: 'India',
          isDefault: false
        }
      ],
      paymentMethods: [
        {
          cardType: i % 2 === 0 ? 'Visa' : 'Mastercard',
          lastFour: String(4321 + i),
          expiryDate: '12/28',
          cardHolder: `Shopper Name ${i}`
        }
      ],
      rewardPoints: points,
      tier: tier,
      referralCode: `SMART_REF_${i}`,
      createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString()
    });
  }

  // 4. Generate 105 Products
  const productTemplates = {
    'Electronics': [
      { name: 'SmartCart Quantum Laptop', price: 74999, desc: 'High performance gaming and coding laptop with 16GB RAM, 1TB SSD.', eco: 'C', ecoRating: 3.5, footprint: 85.4, img: 'https://images.unsplash.com/photo-1496181130204-7552cc14ac1a?w=400' },
      { name: 'EcoBook Air Ultra Slim', price: 58999, desc: 'Environmentally-friendly coding notebook built from recycled plastics.', eco: 'A', ecoRating: 4.8, footprint: 22.1, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400' },
      { name: 'Titan Phone 5G', price: 29999, desc: '6.5-inch OLED display, dual camera, 5000mAh battery.', eco: 'B', ecoRating: 4.0, footprint: 35.6, img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400' },
      { name: 'SoundAura Noise Cancelling Headphones', price: 9999, desc: 'Active noise cancelling headphones with deep bass.', eco: 'C', ecoRating: 3.2, footprint: 12.5, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' },
      { name: 'EcoSound Solar Earbuds', price: 4999, desc: 'Wireless earbuds with a solar-powered case charging.', eco: 'A', ecoRating: 4.9, footprint: 3.8, img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400' }
    ],
    'Fashion': [
      { name: 'Recycled Fiber Denim Jeans', price: 2499, desc: 'Comfortable denim made from 100% recycled cotton.', eco: 'A', ecoRating: 4.7, footprint: 4.2, img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400' },
      { name: 'Premium Leather Smart Watch', price: 12999, desc: 'Elegant time piece with fitness trackers and brown leather strap.', eco: 'D', ecoRating: 2.5, footprint: 18.2, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' },
      { name: 'EcoLoop Organic Cotton Hoodie', price: 1999, desc: 'Soft organic hoodie dyed with natural plant extracts.', eco: 'A', ecoRating: 4.6, footprint: 2.1, img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400' },
      { name: 'Velocity Running Sneakers', price: 4500, desc: 'Lightweight breathable sneakers for training.', eco: 'C', ecoRating: 3.8, footprint: 9.4, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
      { name: 'Bamboo Rayon Crew Socks (5-Pack)', price: 799, desc: 'Super soft bamboo material socks, biodegradable.', eco: 'A', ecoRating: 4.8, footprint: 0.8, img: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?w=400' }
    ],
    'Books': [
      { name: 'Mastering JavaScript & Node.js', price: 899, desc: 'Comprehensive guide for backend web development.', eco: 'A', ecoRating: 4.9, footprint: 0.5, img: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400' },
      { name: 'Green Growth: Building the Future', price: 599, desc: 'A handbook on sustainable startup practices.', eco: 'A', ecoRating: 4.8, footprint: 0.4, img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400' },
      { name: 'The Silent Code: Sci-Fi Novel', price: 499, desc: 'Bestselling space opera thriller.', eco: 'A', ecoRating: 4.2, footprint: 0.5, img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400' }
    ],
    'Grocery': [
      { name: 'Organic Honey Raw Wildflower', price: 450, desc: 'Unprocessed honey gathered from high-altitude meadows.', eco: 'A', ecoRating: 4.9, footprint: 0.2, img: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400' },
      { name: 'Gluten-Free Almond Oats', price: 320, desc: 'Perfect breakfast cereal rich in fibers.', eco: 'A', ecoRating: 4.7, footprint: 0.6, img: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400' },
      { name: 'Single Origin Dark Roast Coffee Beans', price: 750, desc: 'Fairtrade certified organic arabica coffee beans.', eco: 'A', ecoRating: 4.8, footprint: 0.9, img: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400' }
    ],
    'Beauty': [
      { name: 'Hydrating Aloe Face Wash', price: 350, desc: 'Gentle facial wash infused with natural aloe gel.', eco: 'B', ecoRating: 4.3, footprint: 1.1, img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400' },
      { name: 'Mineral Sunscreen SPF 50', price: 650, desc: 'Reef-safe biodegradable physical sunscreen block.', eco: 'A', ecoRating: 4.7, footprint: 0.8, img: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400' },
      { name: 'Shea Butter Moisture Balm', price: 420, desc: 'Intense hydration for dry lips and elbows.', eco: 'B', ecoRating: 4.5, footprint: 0.7, img: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400' }
    ],
    'Sports': [
      { name: 'High-Density Yoga Mat', price: 1599, desc: 'TPE biodegradable yoga cushion with alignment lines.', eco: 'A', ecoRating: 4.8, footprint: 1.5, img: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=400' },
      { name: 'Iron Dumbbells (Set of 2 - 10kg)', price: 2499, desc: 'Hexagonal non-slip vinyl dumbbells.', eco: 'D', ecoRating: 3.0, footprint: 28.5, img: 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=400' },
      { name: 'Ergonomic Sports Water Bottle', price: 899, desc: 'Insulated stainless steel travel flask.', eco: 'A', ecoRating: 4.9, footprint: 1.1, img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400' }
    ],
    'Home & Kitchen': [
      { name: 'EcoShield Cast Iron Skillet', price: 1899, desc: 'Pre-seasoned durable pan that lasts a lifetime.', eco: 'B', ecoRating: 4.7, footprint: 14.8, img: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=400' },
      { name: 'Automatic Smart Air Fryer', price: 6999, desc: 'High speed convection oven utilizing 80% less oil.', eco: 'C', ecoRating: 4.4, footprint: 24.2, img: 'https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=400' },
      { name: 'Bamboo Fiber Dinnerware (16pc)', price: 2999, desc: 'Eco-friendly plates and bowls made from crop waste.', eco: 'A', ecoRating: 4.9, footprint: 1.9, img: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400' }
    ]
  };

  // Generate 105 products total by looping templates and modifying variables
  let pidCount = 1;
  while (pidCount <= 105) {
    for (let cat of categories) {
      if (pidCount > 105) break;
      const templates = productTemplates[cat];
      const template = templates[(pidCount - 1) % templates.length];
      
      // Select seller (1-10)
      const sellerIdx = (pidCount % 9) + 1; // avoid verification pending seller (seller 10) for active products
      
      // Stock values: some low stock to trigger warnings
      let stock = 20 + (pidCount % 40);
      if (pidCount % 12 === 0) stock = 3; // Low stock alert!

      products.push({
        _id: `prod_${pidCount}`,
        name: pidCount > templates.length ? `${template.name} Plus v${Math.ceil(pidCount / templates.length)}` : template.name,
        description: `${template.desc} Perfect for home or office setups. Highly certified design.`,
        price: template.price + ((pidCount % 7) * 200) - ((pidCount % 3) * 100),
        category: cat,
        stock: stock,
        sellerId: `seller_${sellerIdx}`,
        sellerName: `Vendor Elite ${sellerIdx}`,
        images: [template.img, template.img.replace('w=400', 'w=500')],
        rating: +(4.0 + (pidCount % 11) * 0.1).toFixed(1) > 5 ? 5.0 : +(4.0 + (pidCount % 11) * 0.1).toFixed(1),
        reviewCount: 10 + (pidCount % 45),
        sustainability: {
          ecoScore: template.eco,
          ecoRating: template.ecoRating,
          carbonFootprint: +(template.footprint + (pidCount % 5) * 0.2).toFixed(1)
        },
        createdAt: new Date(Date.now() - (pidCount % 15) * 24 * 3600 * 1000).toISOString()
      });

      // Seeding reviews for each product
      reviews.push({
        _id: `rev_${pidCount}`,
        productId: `prod_${pidCount}`,
        customerId: `customer_${(pidCount % 20) + 1}`,
        customerName: `Shopper Name ${(pidCount % 20) + 1}`,
        rating: Math.floor(template.ecoRating),
        comment: `Highly recommended! Excellent build quality and matches the descriptions perfectly.`,
        images: [],
        createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
      });

      pidCount++;
    }
  }

  // 5. Generate 5 Coupons
  coupons.push(
    { code: 'WELCOME100', type: 'flat', value: 100, minPurchase: 500, isActive: true, expiryDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString() },
    { code: 'FESTIVAL20', type: 'percentage', value: 20, minPurchase: 1500, isActive: true, expiryDate: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString() },
    { code: 'GREENSAVE', type: 'flat', value: 150, minPurchase: 1000, isActive: true, expiryDate: new Date(Date.now() + 45 * 24 * 3600 * 1000).toISOString() },
    { code: 'SUPER50', type: 'percentage', value: 50, minPurchase: 10000, isActive: true, expiryDate: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString() },
    { code: 'EXPIRED10', type: 'percentage', value: 10, minPurchase: 100, isActive: false, expiryDate: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() }
  );

  // 6. Generate 55 Orders
  // Mix of statuses, amounts, dates, and fraud triggers
  for (let i = 1; i <= 55; i++) {
    const custId = `customer_${(i % 20) + 1}`;
    const cust = users.find(u => u._id === custId);
    
    // Choose items (1 to 3 items)
    const itemsCount = (i % 3) + 1;
    const items = [];
    let total = 0;
    
    for (let k = 0; k < itemsCount; k++) {
      const prodId = `prod_${((i * 3 + k) % 105) + 1}`;
      const prod = products.find(p => p._id === prodId);
      items.push({
        productId: prod._id,
        name: prod.name,
        price: prod.price,
        quantity: (i % 2) + 1,
        sellerId: prod.sellerId,
        ecoScore: prod.sustainability.ecoScore
      });
      total += prod.price * ((i % 2) + 1);
    }

    const discount = i % 5 === 0 ? 100 : 0;
    const carbonOffset = i % 2 === 0 ? 15 : 0;
    const net = total - discount + carbonOffset;

    let payStatus = 'paid';
    if (i === 1) payStatus = 'failed';
    else if (i === 12) payStatus = 'pending';

    let orderStatus = 'delivered';
    if (i <= 5) orderStatus = 'pending';
    else if (i <= 10) orderStatus = 'processing';
    else if (i <= 15) orderStatus = 'shipped';
    else if (i <= 20) orderStatus = 'out_for_delivery';

    // Timeline setup
    const trackingTimeline = [
      { status: 'pending', description: 'Order submitted and awaits approval', timestamp: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString() }
    ];
    if (orderStatus !== 'pending') {
      trackingTimeline.push({ status: 'confirmed', description: 'Payment verified and order confirmed', timestamp: new Date(Date.now() - 3.5 * 24 * 3600 * 1000).toISOString() });
    }
    if (['processing', 'shipped', 'out_for_delivery', 'delivered'].includes(orderStatus)) {
      trackingTimeline.push({ status: 'processing', description: 'Seller packed the items', timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() });
    }
    if (['shipped', 'out_for_delivery', 'delivered'].includes(orderStatus)) {
      trackingTimeline.push({ status: 'shipped', description: 'In transit to logistics hub', timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() });
    }
    if (['out_for_delivery', 'delivered'].includes(orderStatus)) {
      trackingTimeline.push({ status: 'out_for_delivery', description: 'Out for delivery by local courier', timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString() });
    }
    if (orderStatus === 'delivered') {
      trackingTimeline.push({ status: 'delivered', description: 'Successfully delivered to customer', timestamp: new Date(Date.now() - 0.5 * 24 * 3600 * 1000).toISOString() });
    }

    // Fraud score (simulate a few high risk orders)
    let fraudRiskScore = 0;
    let isFlagged = false;
    let fraudTriggers = [];

    // Trigger fraud checks programmatically for items over ₹50,000
    if (net > 50000 || i === 15) {
      fraudRiskScore = net > 80000 ? 85 : 55;
      isFlagged = true;
      fraudTriggers = net > 80000 ? ['HIGH_VALUE_TRANSACTION', 'CRITICAL_LIMIT_EXCEEDED'] : ['HIGH_VALUE_TRANSACTION'];

      fraudReports.push({
        _id: `fraud_${i}`,
        orderId: `order_${i}`,
        customerId: custId,
        customerEmail: cust.email,
        totalAmount: net,
        riskScore: fraudRiskScore,
        triggers: fraudTriggers,
        status: i === 15 ? 'reviewed' : 'pending',
        actionTaken: i === 15 ? 'approved' : 'none',
        createdAt: new Date(Date.now() - (i % 5) * 24 * 3600 * 1000).toISOString()
      });
    }

    orders.push({
      _id: `order_${i}`,
      customerId: custId,
      customerName: cust.name,
      customerEmail: cust.email,
      items: items,
      totalAmount: total,
      discountAmount: discount,
      carbonOffsetFee: carbonOffset,
      netAmount: net,
      couponCode: discount > 0 ? 'WELCOME100' : '',
      paymentMethod: i % 4 === 0 ? 'card' : (i % 4 === 1 ? 'upi' : (i % 4 === 2 ? 'wallet' : 'netbanking')),
      paymentStatus: payStatus,
      orderStatus: orderStatus,
      shippingAddress: cust.addresses[0],
      trackingTimeline: trackingTimeline,
      fraudRiskScore: fraudRiskScore,
      isFlagged: isFlagged,
      fraudTriggers: fraudTriggers,
      createdAt: new Date(Date.now() - (i % 10) * 24 * 3600 * 1000).toISOString()
    });
  }

  // 7. Seed initial notifications
  notifications.push(
    { _id: 'notif_1', userId: 'admin_id', title: 'System Setup Complete', message: 'SmartCart AI initialized with 100+ items.', type: 'success', isRead: true },
    { _id: 'notif_2', userId: 'seller_1', title: 'Low Stock Alert', message: 'SmartCart Quantum Laptop is running low (3 left).', type: 'warning', isRead: false },
    { _id: 'notif_3', userId: 'all', title: 'Carbon Offset Launch', message: 'You can now offset your delivery footprint during checkout.', type: 'info', isRead: false }
  );

  return {
    users,
    products,
    orders,
    coupons,
    reviews,
    notifications,
    fraudReports
  };
};

module.exports = {
  generateDummyData
};
