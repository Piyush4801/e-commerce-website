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

  // 4. Generate 140 Products
  const productTemplates = {
    "Electronics": [
        {
            "name": "Premium Smart Laptop",
            "price": 5427,
            "desc": "High quality electronics product with excellent durability and eco-friendly manufacturing process.",
            "eco": "A",
            "ecoRating": 3.5,
            "footprint": 10.1,
            "img": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400"
        },
        {
            "name": "Eco Pro Phone",
            "price": 4468,
            "desc": "High quality electronics product with excellent durability and eco-friendly manufacturing process.",
            "eco": "B",
            "ecoRating": 3.6,
            "footprint": 10.1,
            "img": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"
        },
        {
            "name": "Smart Wireless Earbuds",
            "price": 4242,
            "desc": "High quality electronics product with excellent durability and eco-friendly manufacturing process.",
            "eco": "C",
            "ecoRating": 3.7,
            "footprint": 0.2,
            "img": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
        },
        {
            "name": "Elite 4K Monitor",
            "price": 1600,
            "desc": "High quality electronics product with excellent durability and eco-friendly manufacturing process.",
            "eco": "D",
            "ecoRating": 3.8,
            "footprint": 16.2,
            "img": "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=400"
        },
        {
            "name": "Pro Smartwatch",
            "price": 4114,
            "desc": "High quality electronics product with excellent durability and eco-friendly manufacturing process.",
            "eco": "A",
            "ecoRating": 3.9,
            "footprint": 12.6,
            "img": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400"
        },
        {
            "name": "Classic Mechanical Keyboard",
            "price": 1958,
            "desc": "High quality electronics product with excellent durability and eco-friendly manufacturing process.",
            "eco": "B",
            "ecoRating": 4,
            "footprint": 14.9,
            "img": "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400"
        },
        {
            "name": "Ultra Gaming Mouse",
            "price": 5379,
            "desc": "High quality electronics product with excellent durability and eco-friendly manufacturing process.",
            "eco": "C",
            "ecoRating": 4.1,
            "footprint": 7.5,
            "img": "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400"
        },
        {
            "name": "Premium Bluetooth Speaker",
            "price": 2538,
            "desc": "High quality electronics product with excellent durability and eco-friendly manufacturing process.",
            "eco": "D",
            "ecoRating": 4.2,
            "footprint": 19.8,
            "img": "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400"
        },
        {
            "name": "Eco Tablet Pro",
            "price": 3226,
            "desc": "High quality electronics product with excellent durability and eco-friendly manufacturing process.",
            "eco": "A",
            "ecoRating": 4.3,
            "footprint": 3.6,
            "img": "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400"
        },
        {
            "name": "Smart Action Camera",
            "price": 2571,
            "desc": "High quality electronics product with excellent durability and eco-friendly manufacturing process.",
            "eco": "B",
            "ecoRating": 4.4,
            "footprint": 17.9,
            "img": "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=400"
        },
        {
            "name": "Elite Smart Laptop v2",
            "price": 1547,
            "desc": "High quality electronics product with excellent durability and eco-friendly manufacturing process.",
            "eco": "C",
            "ecoRating": 4.5,
            "footprint": 17.5,
            "img": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400"
        },
        {
            "name": "Pro Pro Phone v2",
            "price": 2052,
            "desc": "High quality electronics product with excellent durability and eco-friendly manufacturing process.",
            "eco": "D",
            "ecoRating": 4.6,
            "footprint": 1.5,
            "img": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"
        },
        {
            "name": "Classic Wireless Earbuds v2",
            "price": 827,
            "desc": "High quality electronics product with excellent durability and eco-friendly manufacturing process.",
            "eco": "A",
            "ecoRating": 4.7,
            "footprint": 0.4,
            "img": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
        },
        {
            "name": "Ultra 4K Monitor v2",
            "price": 3482,
            "desc": "High quality electronics product with excellent durability and eco-friendly manufacturing process.",
            "eco": "B",
            "ecoRating": 4.8,
            "footprint": 17.7,
            "img": "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=400"
        },
        {
            "name": "Premium Smartwatch v2",
            "price": 1547,
            "desc": "High quality electronics product with excellent durability and eco-friendly manufacturing process.",
            "eco": "C",
            "ecoRating": 4.9,
            "footprint": 10.9,
            "img": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400"
        },
        {
            "name": "Eco Mechanical Keyboard v2",
            "price": 859,
            "desc": "High quality electronics product with excellent durability and eco-friendly manufacturing process.",
            "eco": "D",
            "ecoRating": 3.5,
            "footprint": 10.4,
            "img": "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400"
        },
        {
            "name": "Smart Gaming Mouse v2",
            "price": 4663,
            "desc": "High quality electronics product with excellent durability and eco-friendly manufacturing process.",
            "eco": "A",
            "ecoRating": 3.6,
            "footprint": 3.7,
            "img": "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400"
        },
        {
            "name": "Elite Bluetooth Speaker v2",
            "price": 3853,
            "desc": "High quality electronics product with excellent durability and eco-friendly manufacturing process.",
            "eco": "B",
            "ecoRating": 3.7,
            "footprint": 8.7,
            "img": "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400"
        },
        {
            "name": "Pro Tablet Pro v2",
            "price": 5496,
            "desc": "High quality electronics product with excellent durability and eco-friendly manufacturing process.",
            "eco": "C",
            "ecoRating": 3.8,
            "footprint": 6,
            "img": "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400"
        },
        {
            "name": "Classic Action Camera v2",
            "price": 5467,
            "desc": "High quality electronics product with excellent durability and eco-friendly manufacturing process.",
            "eco": "D",
            "ecoRating": 3.9,
            "footprint": 19,
            "img": "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=400"
        }
    ],
    "Fashion": [
        {
            "name": "Premium Denim Jeans",
            "price": 1603,
            "desc": "High quality fashion product with excellent durability and eco-friendly manufacturing process.",
            "eco": "A",
            "ecoRating": 3.5,
            "footprint": 7.5,
            "img": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400"
        },
        {
            "name": "Eco Leather Jacket",
            "price": 3570,
            "desc": "High quality fashion product with excellent durability and eco-friendly manufacturing process.",
            "eco": "B",
            "ecoRating": 3.6,
            "footprint": 12.6,
            "img": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400"
        },
        {
            "name": "Smart Cotton T-Shirt",
            "price": 1310,
            "desc": "High quality fashion product with excellent durability and eco-friendly manufacturing process.",
            "eco": "C",
            "ecoRating": 3.7,
            "footprint": 13.1,
            "img": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"
        },
        {
            "name": "Elite Running Sneakers",
            "price": 1547,
            "desc": "High quality fashion product with excellent durability and eco-friendly manufacturing process.",
            "eco": "D",
            "ecoRating": 3.8,
            "footprint": 0.5,
            "img": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400"
        },
        {
            "name": "Pro Wool Sweater",
            "price": 4862,
            "desc": "High quality fashion product with excellent durability and eco-friendly manufacturing process.",
            "eco": "A",
            "ecoRating": 3.9,
            "footprint": 3.2,
            "img": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400"
        },
        {
            "name": "Classic Sunglasses",
            "price": 1181,
            "desc": "High quality fashion product with excellent durability and eco-friendly manufacturing process.",
            "eco": "B",
            "ecoRating": 4,
            "footprint": 17,
            "img": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400"
        },
        {
            "name": "Ultra Casual Dress",
            "price": 3595,
            "desc": "High quality fashion product with excellent durability and eco-friendly manufacturing process.",
            "eco": "C",
            "ecoRating": 4.1,
            "footprint": 14.9,
            "img": "https://images.unsplash.com/photo-1434389678278-dfa4cb5c58ee?w=400"
        },
        {
            "name": "Premium Smart Watch",
            "price": 5421,
            "desc": "High quality fashion product with excellent durability and eco-friendly manufacturing process.",
            "eco": "D",
            "ecoRating": 4.2,
            "footprint": 8.1,
            "img": "https://images.unsplash.com/photo-1489987707023-af0825dad1c3?w=400"
        },
        {
            "name": "Eco Silk Tie",
            "price": 2194,
            "desc": "High quality fashion product with excellent durability and eco-friendly manufacturing process.",
            "eco": "A",
            "ecoRating": 4.3,
            "footprint": 11,
            "img": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400"
        },
        {
            "name": "Smart Canvas Backpack",
            "price": 2813,
            "desc": "High quality fashion product with excellent durability and eco-friendly manufacturing process.",
            "eco": "B",
            "ecoRating": 4.4,
            "footprint": 13.6,
            "img": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400"
        },
        {
            "name": "Elite Denim Jeans v2",
            "price": 3629,
            "desc": "High quality fashion product with excellent durability and eco-friendly manufacturing process.",
            "eco": "C",
            "ecoRating": 4.5,
            "footprint": 3.6,
            "img": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400"
        },
        {
            "name": "Pro Leather Jacket v2",
            "price": 3647,
            "desc": "High quality fashion product with excellent durability and eco-friendly manufacturing process.",
            "eco": "D",
            "ecoRating": 4.6,
            "footprint": 5.5,
            "img": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400"
        },
        {
            "name": "Classic Cotton T-Shirt v2",
            "price": 2085,
            "desc": "High quality fashion product with excellent durability and eco-friendly manufacturing process.",
            "eco": "A",
            "ecoRating": 4.7,
            "footprint": 19.6,
            "img": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"
        },
        {
            "name": "Ultra Running Sneakers v2",
            "price": 4580,
            "desc": "High quality fashion product with excellent durability and eco-friendly manufacturing process.",
            "eco": "B",
            "ecoRating": 4.8,
            "footprint": 3.2,
            "img": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400"
        },
        {
            "name": "Premium Wool Sweater v2",
            "price": 4295,
            "desc": "High quality fashion product with excellent durability and eco-friendly manufacturing process.",
            "eco": "C",
            "ecoRating": 4.9,
            "footprint": 17.4,
            "img": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400"
        },
        {
            "name": "Eco Sunglasses v2",
            "price": 2104,
            "desc": "High quality fashion product with excellent durability and eco-friendly manufacturing process.",
            "eco": "D",
            "ecoRating": 3.5,
            "footprint": 12.2,
            "img": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400"
        },
        {
            "name": "Smart Casual Dress v2",
            "price": 1670,
            "desc": "High quality fashion product with excellent durability and eco-friendly manufacturing process.",
            "eco": "A",
            "ecoRating": 3.6,
            "footprint": 13,
            "img": "https://images.unsplash.com/photo-1434389678278-dfa4cb5c58ee?w=400"
        },
        {
            "name": "Elite Smart Watch v2",
            "price": 4151,
            "desc": "High quality fashion product with excellent durability and eco-friendly manufacturing process.",
            "eco": "B",
            "ecoRating": 3.7,
            "footprint": 14.8,
            "img": "https://images.unsplash.com/photo-1489987707023-af0825dad1c3?w=400"
        },
        {
            "name": "Pro Silk Tie v2",
            "price": 1525,
            "desc": "High quality fashion product with excellent durability and eco-friendly manufacturing process.",
            "eco": "C",
            "ecoRating": 3.8,
            "footprint": 12.2,
            "img": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400"
        },
        {
            "name": "Classic Canvas Backpack v2",
            "price": 5263,
            "desc": "High quality fashion product with excellent durability and eco-friendly manufacturing process.",
            "eco": "D",
            "ecoRating": 3.9,
            "footprint": 8.7,
            "img": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400"
        }
    ],
    "Books": [
        {
            "name": "Premium JavaScript Handbook",
            "price": 4740,
            "desc": "High quality books product with excellent durability and eco-friendly manufacturing process.",
            "eco": "A",
            "ecoRating": 3.5,
            "footprint": 12.3,
            "img": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400"
        },
        {
            "name": "Eco Sci-Fi Novel",
            "price": 2012,
            "desc": "High quality books product with excellent durability and eco-friendly manufacturing process.",
            "eco": "B",
            "ecoRating": 3.6,
            "footprint": 3.7,
            "img": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400"
        },
        {
            "name": "Smart History of World",
            "price": 1990,
            "desc": "High quality books product with excellent durability and eco-friendly manufacturing process.",
            "eco": "C",
            "ecoRating": 3.7,
            "footprint": 9.3,
            "img": "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400"
        },
        {
            "name": "Elite Startup Guide",
            "price": 1284,
            "desc": "High quality books product with excellent durability and eco-friendly manufacturing process.",
            "eco": "D",
            "ecoRating": 3.8,
            "footprint": 6.4,
            "img": "https://images.unsplash.com/photo-1589998059171-9899ea8a5df4?w=400"
        },
        {
            "name": "Pro Cooking Recipes",
            "price": 519,
            "desc": "High quality books product with excellent durability and eco-friendly manufacturing process.",
            "eco": "A",
            "ecoRating": 3.9,
            "footprint": 1.9,
            "img": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400"
        },
        {
            "name": "Classic Poetry Collection",
            "price": 2412,
            "desc": "High quality books product with excellent durability and eco-friendly manufacturing process.",
            "eco": "B",
            "ecoRating": 4,
            "footprint": 2.2,
            "img": "https://images.unsplash.com/photo-1524578970427-96a84f3df9b5?w=400"
        },
        {
            "name": "Ultra Mystery Thriller",
            "price": 4541,
            "desc": "High quality books product with excellent durability and eco-friendly manufacturing process.",
            "eco": "C",
            "ecoRating": 4.1,
            "footprint": 5.8,
            "img": "https://images.unsplash.com/photo-1511108690759-009324a90311?w=400"
        },
        {
            "name": "Premium Design Patterns",
            "price": 5446,
            "desc": "High quality books product with excellent durability and eco-friendly manufacturing process.",
            "eco": "D",
            "ecoRating": 4.2,
            "footprint": 0,
            "img": "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400"
        },
        {
            "name": "Eco Art Album",
            "price": 2055,
            "desc": "High quality books product with excellent durability and eco-friendly manufacturing process.",
            "eco": "A",
            "ecoRating": 4.3,
            "footprint": 19.1,
            "img": "https://images.unsplash.com/photo-1521123845561-1229c30e6231?w=400"
        },
        {
            "name": "Smart Financial Freedom",
            "price": 517,
            "desc": "High quality books product with excellent durability and eco-friendly manufacturing process.",
            "eco": "B",
            "ecoRating": 4.4,
            "footprint": 16.2,
            "img": "https://images.unsplash.com/photo-1550399140-c4db5fb85c18?w=400"
        },
        {
            "name": "Elite JavaScript Handbook v2",
            "price": 4734,
            "desc": "High quality books product with excellent durability and eco-friendly manufacturing process.",
            "eco": "C",
            "ecoRating": 4.5,
            "footprint": 0.5,
            "img": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400"
        },
        {
            "name": "Pro Sci-Fi Novel v2",
            "price": 1031,
            "desc": "High quality books product with excellent durability and eco-friendly manufacturing process.",
            "eco": "D",
            "ecoRating": 4.6,
            "footprint": 4.7,
            "img": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400"
        },
        {
            "name": "Classic History of World v2",
            "price": 4434,
            "desc": "High quality books product with excellent durability and eco-friendly manufacturing process.",
            "eco": "A",
            "ecoRating": 4.7,
            "footprint": 5.3,
            "img": "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400"
        },
        {
            "name": "Ultra Startup Guide v2",
            "price": 3729,
            "desc": "High quality books product with excellent durability and eco-friendly manufacturing process.",
            "eco": "B",
            "ecoRating": 4.8,
            "footprint": 14,
            "img": "https://images.unsplash.com/photo-1589998059171-9899ea8a5df4?w=400"
        },
        {
            "name": "Premium Cooking Recipes v2",
            "price": 2655,
            "desc": "High quality books product with excellent durability and eco-friendly manufacturing process.",
            "eco": "C",
            "ecoRating": 4.9,
            "footprint": 3.1,
            "img": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400"
        },
        {
            "name": "Eco Poetry Collection v2",
            "price": 3793,
            "desc": "High quality books product with excellent durability and eco-friendly manufacturing process.",
            "eco": "D",
            "ecoRating": 3.5,
            "footprint": 0.2,
            "img": "https://images.unsplash.com/photo-1524578970427-96a84f3df9b5?w=400"
        },
        {
            "name": "Smart Mystery Thriller v2",
            "price": 3658,
            "desc": "High quality books product with excellent durability and eco-friendly manufacturing process.",
            "eco": "A",
            "ecoRating": 3.6,
            "footprint": 17.6,
            "img": "https://images.unsplash.com/photo-1511108690759-009324a90311?w=400"
        },
        {
            "name": "Elite Design Patterns v2",
            "price": 1801,
            "desc": "High quality books product with excellent durability and eco-friendly manufacturing process.",
            "eco": "B",
            "ecoRating": 3.7,
            "footprint": 8.9,
            "img": "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400"
        },
        {
            "name": "Pro Art Album v2",
            "price": 5241,
            "desc": "High quality books product with excellent durability and eco-friendly manufacturing process.",
            "eco": "C",
            "ecoRating": 3.8,
            "footprint": 1.9,
            "img": "https://images.unsplash.com/photo-1521123845561-1229c30e6231?w=400"
        },
        {
            "name": "Classic Financial Freedom v2",
            "price": 5394,
            "desc": "High quality books product with excellent durability and eco-friendly manufacturing process.",
            "eco": "D",
            "ecoRating": 3.9,
            "footprint": 12.4,
            "img": "https://images.unsplash.com/photo-1550399140-c4db5fb85c18?w=400"
        }
    ],
    "Grocery": [
        {
            "name": "Premium Organic Honey",
            "price": 4308,
            "desc": "High quality grocery product with excellent durability and eco-friendly manufacturing process.",
            "eco": "A",
            "ecoRating": 3.5,
            "footprint": 1,
            "img": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400"
        },
        {
            "name": "Eco Almond Milk",
            "price": 1968,
            "desc": "High quality grocery product with excellent durability and eco-friendly manufacturing process.",
            "eco": "B",
            "ecoRating": 3.6,
            "footprint": 9.1,
            "img": "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400"
        },
        {
            "name": "Smart Dark Roast Coffee",
            "price": 1313,
            "desc": "High quality grocery product with excellent durability and eco-friendly manufacturing process.",
            "eco": "C",
            "ecoRating": 3.7,
            "footprint": 10.5,
            "img": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400"
        },
        {
            "name": "Elite Olive Oil",
            "price": 1013,
            "desc": "High quality grocery product with excellent durability and eco-friendly manufacturing process.",
            "eco": "D",
            "ecoRating": 3.8,
            "footprint": 16.2,
            "img": "https://images.unsplash.com/photo-1615483555563-fcba6a5e0b65?w=400"
        },
        {
            "name": "Pro Quinoa",
            "price": 4700,
            "desc": "High quality grocery product with excellent durability and eco-friendly manufacturing process.",
            "eco": "A",
            "ecoRating": 3.9,
            "footprint": 3.5,
            "img": "https://images.unsplash.com/photo-1596647901403-90d56ee36611?w=400"
        },
        {
            "name": "Classic Sea Salt",
            "price": 4226,
            "desc": "High quality grocery product with excellent durability and eco-friendly manufacturing process.",
            "eco": "B",
            "ecoRating": 4,
            "footprint": 15.8,
            "img": "https://images.unsplash.com/photo-1574316074151-68d183f34586?w=400"
        },
        {
            "name": "Ultra Green Tea",
            "price": 5108,
            "desc": "High quality grocery product with excellent durability and eco-friendly manufacturing process.",
            "eco": "C",
            "ecoRating": 4.1,
            "footprint": 6.8,
            "img": "https://images.unsplash.com/photo-1601648764658-cf37e8c89b70?w=400"
        },
        {
            "name": "Premium Brown Rice",
            "price": 2289,
            "desc": "High quality grocery product with excellent durability and eco-friendly manufacturing process.",
            "eco": "D",
            "ecoRating": 4.2,
            "footprint": 18.2,
            "img": "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=400"
        },
        {
            "name": "Eco Peanut Butter",
            "price": 3296,
            "desc": "High quality grocery product with excellent durability and eco-friendly manufacturing process.",
            "eco": "A",
            "ecoRating": 4.3,
            "footprint": 12.6,
            "img": "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400"
        },
        {
            "name": "Smart Rolled Oats",
            "price": 3622,
            "desc": "High quality grocery product with excellent durability and eco-friendly manufacturing process.",
            "eco": "B",
            "ecoRating": 4.4,
            "footprint": 15.4,
            "img": "https://images.unsplash.com/photo-1584286595398-a59f21d313f5?w=400"
        },
        {
            "name": "Elite Organic Honey v2",
            "price": 4148,
            "desc": "High quality grocery product with excellent durability and eco-friendly manufacturing process.",
            "eco": "C",
            "ecoRating": 4.5,
            "footprint": 18.6,
            "img": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400"
        },
        {
            "name": "Pro Almond Milk v2",
            "price": 2924,
            "desc": "High quality grocery product with excellent durability and eco-friendly manufacturing process.",
            "eco": "D",
            "ecoRating": 4.6,
            "footprint": 8.6,
            "img": "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400"
        },
        {
            "name": "Classic Dark Roast Coffee v2",
            "price": 2686,
            "desc": "High quality grocery product with excellent durability and eco-friendly manufacturing process.",
            "eco": "A",
            "ecoRating": 4.7,
            "footprint": 16.7,
            "img": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400"
        },
        {
            "name": "Ultra Olive Oil v2",
            "price": 3037,
            "desc": "High quality grocery product with excellent durability and eco-friendly manufacturing process.",
            "eco": "B",
            "ecoRating": 4.8,
            "footprint": 8.9,
            "img": "https://images.unsplash.com/photo-1615483555563-fcba6a5e0b65?w=400"
        },
        {
            "name": "Premium Quinoa v2",
            "price": 744,
            "desc": "High quality grocery product with excellent durability and eco-friendly manufacturing process.",
            "eco": "C",
            "ecoRating": 4.9,
            "footprint": 17.9,
            "img": "https://images.unsplash.com/photo-1596647901403-90d56ee36611?w=400"
        },
        {
            "name": "Eco Sea Salt v2",
            "price": 4263,
            "desc": "High quality grocery product with excellent durability and eco-friendly manufacturing process.",
            "eco": "D",
            "ecoRating": 3.5,
            "footprint": 6.9,
            "img": "https://images.unsplash.com/photo-1574316074151-68d183f34586?w=400"
        },
        {
            "name": "Smart Green Tea v2",
            "price": 3182,
            "desc": "High quality grocery product with excellent durability and eco-friendly manufacturing process.",
            "eco": "A",
            "ecoRating": 3.6,
            "footprint": 15.1,
            "img": "https://images.unsplash.com/photo-1601648764658-cf37e8c89b70?w=400"
        },
        {
            "name": "Elite Brown Rice v2",
            "price": 4169,
            "desc": "High quality grocery product with excellent durability and eco-friendly manufacturing process.",
            "eco": "B",
            "ecoRating": 3.7,
            "footprint": 10.7,
            "img": "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=400"
        },
        {
            "name": "Pro Peanut Butter v2",
            "price": 2471,
            "desc": "High quality grocery product with excellent durability and eco-friendly manufacturing process.",
            "eco": "C",
            "ecoRating": 3.8,
            "footprint": 13.4,
            "img": "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400"
        },
        {
            "name": "Classic Rolled Oats v2",
            "price": 4134,
            "desc": "High quality grocery product with excellent durability and eco-friendly manufacturing process.",
            "eco": "D",
            "ecoRating": 3.9,
            "footprint": 2.9,
            "img": "https://images.unsplash.com/photo-1584286595398-a59f21d313f5?w=400"
        }
    ],
    "Beauty": [
        {
            "name": "Premium Face Wash",
            "price": 780,
            "desc": "High quality beauty product with excellent durability and eco-friendly manufacturing process.",
            "eco": "A",
            "ecoRating": 3.5,
            "footprint": 4.7,
            "img": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400"
        },
        {
            "name": "Eco Sunscreen SPF 50",
            "price": 976,
            "desc": "High quality beauty product with excellent durability and eco-friendly manufacturing process.",
            "eco": "B",
            "ecoRating": 3.6,
            "footprint": 4,
            "img": "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400"
        },
        {
            "name": "Smart Moisturizer",
            "price": 3895,
            "desc": "High quality beauty product with excellent durability and eco-friendly manufacturing process.",
            "eco": "C",
            "ecoRating": 3.7,
            "footprint": 15.3,
            "img": "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400"
        },
        {
            "name": "Elite Vitamin C Serum",
            "price": 5103,
            "desc": "High quality beauty product with excellent durability and eco-friendly manufacturing process.",
            "eco": "D",
            "ecoRating": 3.8,
            "footprint": 1.9,
            "img": "https://images.unsplash.com/photo-1571781926291-c477eb30d421?w=400"
        },
        {
            "name": "Pro Lip Balm",
            "price": 1660,
            "desc": "High quality beauty product with excellent durability and eco-friendly manufacturing process.",
            "eco": "A",
            "ecoRating": 3.9,
            "footprint": 10.5,
            "img": "https://images.unsplash.com/photo-1617897903246-719242758050?w=400"
        },
        {
            "name": "Classic Body Wash",
            "price": 3163,
            "desc": "High quality beauty product with excellent durability and eco-friendly manufacturing process.",
            "eco": "B",
            "ecoRating": 4,
            "footprint": 3.4,
            "img": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400"
        },
        {
            "name": "Ultra Hair Oil",
            "price": 1989,
            "desc": "High quality beauty product with excellent durability and eco-friendly manufacturing process.",
            "eco": "C",
            "ecoRating": 4.1,
            "footprint": 7.5,
            "img": "https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400"
        },
        {
            "name": "Premium Exfoliating Scrub",
            "price": 3068,
            "desc": "High quality beauty product with excellent durability and eco-friendly manufacturing process.",
            "eco": "D",
            "ecoRating": 4.2,
            "footprint": 9.5,
            "img": "https://images.unsplash.com/photo-1512496015851-a1dcfb3b8f46?w=400"
        },
        {
            "name": "Eco Night Cream",
            "price": 2102,
            "desc": "High quality beauty product with excellent durability and eco-friendly manufacturing process.",
            "eco": "A",
            "ecoRating": 4.3,
            "footprint": 1.8,
            "img": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400"
        },
        {
            "name": "Smart Hand Lotion",
            "price": 1213,
            "desc": "High quality beauty product with excellent durability and eco-friendly manufacturing process.",
            "eco": "B",
            "ecoRating": 4.4,
            "footprint": 1.7,
            "img": "https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=400"
        },
        {
            "name": "Elite Face Wash v2",
            "price": 890,
            "desc": "High quality beauty product with excellent durability and eco-friendly manufacturing process.",
            "eco": "C",
            "ecoRating": 4.5,
            "footprint": 9.7,
            "img": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400"
        },
        {
            "name": "Pro Sunscreen SPF 50 v2",
            "price": 4056,
            "desc": "High quality beauty product with excellent durability and eco-friendly manufacturing process.",
            "eco": "D",
            "ecoRating": 4.6,
            "footprint": 11.5,
            "img": "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400"
        },
        {
            "name": "Classic Moisturizer v2",
            "price": 3957,
            "desc": "High quality beauty product with excellent durability and eco-friendly manufacturing process.",
            "eco": "A",
            "ecoRating": 4.7,
            "footprint": 13.1,
            "img": "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400"
        },
        {
            "name": "Ultra Vitamin C Serum v2",
            "price": 2012,
            "desc": "High quality beauty product with excellent durability and eco-friendly manufacturing process.",
            "eco": "B",
            "ecoRating": 4.8,
            "footprint": 5.5,
            "img": "https://images.unsplash.com/photo-1571781926291-c477eb30d421?w=400"
        },
        {
            "name": "Premium Lip Balm v2",
            "price": 2451,
            "desc": "High quality beauty product with excellent durability and eco-friendly manufacturing process.",
            "eco": "C",
            "ecoRating": 4.9,
            "footprint": 6.9,
            "img": "https://images.unsplash.com/photo-1617897903246-719242758050?w=400"
        },
        {
            "name": "Eco Body Wash v2",
            "price": 3646,
            "desc": "High quality beauty product with excellent durability and eco-friendly manufacturing process.",
            "eco": "D",
            "ecoRating": 3.5,
            "footprint": 11.8,
            "img": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400"
        },
        {
            "name": "Smart Hair Oil v2",
            "price": 3397,
            "desc": "High quality beauty product with excellent durability and eco-friendly manufacturing process.",
            "eco": "A",
            "ecoRating": 3.6,
            "footprint": 18,
            "img": "https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400"
        },
        {
            "name": "Elite Exfoliating Scrub v2",
            "price": 2146,
            "desc": "High quality beauty product with excellent durability and eco-friendly manufacturing process.",
            "eco": "B",
            "ecoRating": 3.7,
            "footprint": 8.7,
            "img": "https://images.unsplash.com/photo-1512496015851-a1dcfb3b8f46?w=400"
        },
        {
            "name": "Pro Night Cream v2",
            "price": 1855,
            "desc": "High quality beauty product with excellent durability and eco-friendly manufacturing process.",
            "eco": "C",
            "ecoRating": 3.8,
            "footprint": 12.3,
            "img": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400"
        },
        {
            "name": "Classic Hand Lotion v2",
            "price": 2826,
            "desc": "High quality beauty product with excellent durability and eco-friendly manufacturing process.",
            "eco": "D",
            "ecoRating": 3.9,
            "footprint": 11.8,
            "img": "https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=400"
        }
    ],
    "Sports": [
        {
            "name": "Premium Yoga Mat",
            "price": 3349,
            "desc": "High quality sports product with excellent durability and eco-friendly manufacturing process.",
            "eco": "A",
            "ecoRating": 3.5,
            "footprint": 0.6,
            "img": "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=400"
        },
        {
            "name": "Eco Dumbbells",
            "price": 5377,
            "desc": "High quality sports product with excellent durability and eco-friendly manufacturing process.",
            "eco": "B",
            "ecoRating": 3.6,
            "footprint": 1.6,
            "img": "https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=400"
        },
        {
            "name": "Smart Water Bottle",
            "price": 2415,
            "desc": "High quality sports product with excellent durability and eco-friendly manufacturing process.",
            "eco": "C",
            "ecoRating": 3.7,
            "footprint": 5.7,
            "img": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400"
        },
        {
            "name": "Elite Resistance Bands",
            "price": 2326,
            "desc": "High quality sports product with excellent durability and eco-friendly manufacturing process.",
            "eco": "D",
            "ecoRating": 3.8,
            "footprint": 4.8,
            "img": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400"
        },
        {
            "name": "Pro Jump Rope",
            "price": 5233,
            "desc": "High quality sports product with excellent durability and eco-friendly manufacturing process.",
            "eco": "A",
            "ecoRating": 3.9,
            "footprint": 4.6,
            "img": "https://images.unsplash.com/photo-1515523110800-9415d13b84a8?w=400"
        },
        {
            "name": "Classic Foam Roller",
            "price": 4176,
            "desc": "High quality sports product with excellent durability and eco-friendly manufacturing process.",
            "eco": "B",
            "ecoRating": 4,
            "footprint": 6.9,
            "img": "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400"
        },
        {
            "name": "Ultra Gym Bag",
            "price": 1434,
            "desc": "High quality sports product with excellent durability and eco-friendly manufacturing process.",
            "eco": "C",
            "ecoRating": 4.1,
            "footprint": 5.2,
            "img": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400"
        },
        {
            "name": "Premium Running Shoes",
            "price": 2759,
            "desc": "High quality sports product with excellent durability and eco-friendly manufacturing process.",
            "eco": "D",
            "ecoRating": 4.2,
            "footprint": 16.8,
            "img": "https://images.unsplash.com/photo-1576633587382-13ddf37b1fc1?w=400"
        },
        {
            "name": "Eco Protein Shaker",
            "price": 2986,
            "desc": "High quality sports product with excellent durability and eco-friendly manufacturing process.",
            "eco": "A",
            "ecoRating": 4.3,
            "footprint": 19.9,
            "img": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400"
        },
        {
            "name": "Smart Cycling Gloves",
            "price": 1164,
            "desc": "High quality sports product with excellent durability and eco-friendly manufacturing process.",
            "eco": "B",
            "ecoRating": 4.4,
            "footprint": 6.9,
            "img": "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400"
        },
        {
            "name": "Elite Yoga Mat v2",
            "price": 4672,
            "desc": "High quality sports product with excellent durability and eco-friendly manufacturing process.",
            "eco": "C",
            "ecoRating": 4.5,
            "footprint": 17.6,
            "img": "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=400"
        },
        {
            "name": "Pro Dumbbells v2",
            "price": 1577,
            "desc": "High quality sports product with excellent durability and eco-friendly manufacturing process.",
            "eco": "D",
            "ecoRating": 4.6,
            "footprint": 2.2,
            "img": "https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=400"
        },
        {
            "name": "Classic Water Bottle v2",
            "price": 1723,
            "desc": "High quality sports product with excellent durability and eco-friendly manufacturing process.",
            "eco": "A",
            "ecoRating": 4.7,
            "footprint": 6.9,
            "img": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400"
        },
        {
            "name": "Ultra Resistance Bands v2",
            "price": 4946,
            "desc": "High quality sports product with excellent durability and eco-friendly manufacturing process.",
            "eco": "B",
            "ecoRating": 4.8,
            "footprint": 4.5,
            "img": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400"
        },
        {
            "name": "Premium Jump Rope v2",
            "price": 1843,
            "desc": "High quality sports product with excellent durability and eco-friendly manufacturing process.",
            "eco": "C",
            "ecoRating": 4.9,
            "footprint": 19.6,
            "img": "https://images.unsplash.com/photo-1515523110800-9415d13b84a8?w=400"
        },
        {
            "name": "Eco Foam Roller v2",
            "price": 3358,
            "desc": "High quality sports product with excellent durability and eco-friendly manufacturing process.",
            "eco": "D",
            "ecoRating": 3.5,
            "footprint": 18.7,
            "img": "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400"
        },
        {
            "name": "Smart Gym Bag v2",
            "price": 579,
            "desc": "High quality sports product with excellent durability and eco-friendly manufacturing process.",
            "eco": "A",
            "ecoRating": 3.6,
            "footprint": 7.7,
            "img": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400"
        },
        {
            "name": "Elite Running Shoes v2",
            "price": 2669,
            "desc": "High quality sports product with excellent durability and eco-friendly manufacturing process.",
            "eco": "B",
            "ecoRating": 3.7,
            "footprint": 4.7,
            "img": "https://images.unsplash.com/photo-1576633587382-13ddf37b1fc1?w=400"
        },
        {
            "name": "Pro Protein Shaker v2",
            "price": 4712,
            "desc": "High quality sports product with excellent durability and eco-friendly manufacturing process.",
            "eco": "C",
            "ecoRating": 3.8,
            "footprint": 0.5,
            "img": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400"
        },
        {
            "name": "Classic Cycling Gloves v2",
            "price": 2543,
            "desc": "High quality sports product with excellent durability and eco-friendly manufacturing process.",
            "eco": "D",
            "ecoRating": 3.9,
            "footprint": 14.3,
            "img": "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400"
        }
    ],
    "Home & Kitchen": [
        {
            "name": "Premium Cast Iron Skillet",
            "price": 1633,
            "desc": "High quality home & kitchen product with excellent durability and eco-friendly manufacturing process.",
            "eco": "A",
            "ecoRating": 3.5,
            "footprint": 2.6,
            "img": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=400"
        },
        {
            "name": "Eco Air Fryer",
            "price": 2635,
            "desc": "High quality home & kitchen product with excellent durability and eco-friendly manufacturing process.",
            "eco": "B",
            "ecoRating": 3.6,
            "footprint": 0.5,
            "img": "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=400"
        },
        {
            "name": "Smart Dinnerware Set",
            "price": 2456,
            "desc": "High quality home & kitchen product with excellent durability and eco-friendly manufacturing process.",
            "eco": "C",
            "ecoRating": 3.7,
            "footprint": 6.2,
            "img": "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400"
        },
        {
            "name": "Elite Coffee Maker",
            "price": 2278,
            "desc": "High quality home & kitchen product with excellent durability and eco-friendly manufacturing process.",
            "eco": "D",
            "ecoRating": 3.8,
            "footprint": 16.6,
            "img": "https://images.unsplash.com/photo-1556910103-1c02745a872f?w=400"
        },
        {
            "name": "Pro Blender",
            "price": 1004,
            "desc": "High quality home & kitchen product with excellent durability and eco-friendly manufacturing process.",
            "eco": "A",
            "ecoRating": 3.9,
            "footprint": 0.2,
            "img": "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400"
        },
        {
            "name": "Classic Knife Set",
            "price": 4635,
            "desc": "High quality home & kitchen product with excellent durability and eco-friendly manufacturing process.",
            "eco": "B",
            "ecoRating": 4,
            "footprint": 8.9,
            "img": "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400"
        },
        {
            "name": "Ultra Cutting Board",
            "price": 4407,
            "desc": "High quality home & kitchen product with excellent durability and eco-friendly manufacturing process.",
            "eco": "C",
            "ecoRating": 4.1,
            "footprint": 4.5,
            "img": "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=400"
        },
        {
            "name": "Premium Toaster",
            "price": 524,
            "desc": "High quality home & kitchen product with excellent durability and eco-friendly manufacturing process.",
            "eco": "D",
            "ecoRating": 4.2,
            "footprint": 15.9,
            "img": "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=400"
        },
        {
            "name": "Eco Food Storage",
            "price": 1541,
            "desc": "High quality home & kitchen product with excellent durability and eco-friendly manufacturing process.",
            "eco": "A",
            "ecoRating": 4.3,
            "footprint": 18.4,
            "img": "https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=400"
        },
        {
            "name": "Smart Wine Glasses",
            "price": 4478,
            "desc": "High quality home & kitchen product with excellent durability and eco-friendly manufacturing process.",
            "eco": "B",
            "ecoRating": 4.4,
            "footprint": 6.3,
            "img": "https://images.unsplash.com/photo-1622659350436-a3eeeb5b5d13?w=400"
        },
        {
            "name": "Elite Cast Iron Skillet v2",
            "price": 3265,
            "desc": "High quality home & kitchen product with excellent durability and eco-friendly manufacturing process.",
            "eco": "C",
            "ecoRating": 4.5,
            "footprint": 1.1,
            "img": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=400"
        },
        {
            "name": "Pro Air Fryer v2",
            "price": 4749,
            "desc": "High quality home & kitchen product with excellent durability and eco-friendly manufacturing process.",
            "eco": "D",
            "ecoRating": 4.6,
            "footprint": 13.8,
            "img": "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=400"
        },
        {
            "name": "Classic Dinnerware Set v2",
            "price": 3743,
            "desc": "High quality home & kitchen product with excellent durability and eco-friendly manufacturing process.",
            "eco": "A",
            "ecoRating": 4.7,
            "footprint": 6.5,
            "img": "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400"
        },
        {
            "name": "Ultra Coffee Maker v2",
            "price": 1024,
            "desc": "High quality home & kitchen product with excellent durability and eco-friendly manufacturing process.",
            "eco": "B",
            "ecoRating": 4.8,
            "footprint": 2.9,
            "img": "https://images.unsplash.com/photo-1556910103-1c02745a872f?w=400"
        },
        {
            "name": "Premium Blender v2",
            "price": 2745,
            "desc": "High quality home & kitchen product with excellent durability and eco-friendly manufacturing process.",
            "eco": "C",
            "ecoRating": 4.9,
            "footprint": 5.6,
            "img": "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400"
        },
        {
            "name": "Eco Knife Set v2",
            "price": 679,
            "desc": "High quality home & kitchen product with excellent durability and eco-friendly manufacturing process.",
            "eco": "D",
            "ecoRating": 3.5,
            "footprint": 8.5,
            "img": "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400"
        },
        {
            "name": "Smart Cutting Board v2",
            "price": 5060,
            "desc": "High quality home & kitchen product with excellent durability and eco-friendly manufacturing process.",
            "eco": "A",
            "ecoRating": 3.6,
            "footprint": 17.1,
            "img": "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=400"
        },
        {
            "name": "Elite Toaster v2",
            "price": 2672,
            "desc": "High quality home & kitchen product with excellent durability and eco-friendly manufacturing process.",
            "eco": "B",
            "ecoRating": 3.7,
            "footprint": 15.6,
            "img": "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=400"
        },
        {
            "name": "Pro Food Storage v2",
            "price": 5199,
            "desc": "High quality home & kitchen product with excellent durability and eco-friendly manufacturing process.",
            "eco": "C",
            "ecoRating": 3.8,
            "footprint": 9.5,
            "img": "https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=400"
        },
        {
            "name": "Classic Wine Glasses v2",
            "price": 4492,
            "desc": "High quality home & kitchen product with excellent durability and eco-friendly manufacturing process.",
            "eco": "D",
            "ecoRating": 3.9,
            "footprint": 19,
            "img": "https://images.unsplash.com/photo-1622659350436-a3eeeb5b5d13?w=400"
        }
    ]
};

  // Generate 140 products total by looping templates and modifying variables
  let pidCount = 1;
  while (pidCount <= 140) {
    for (let cat of categories) {
      if (pidCount > 140) break;
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
        image: template.img,
        imageUrl: template.img,
        thumbnail: template.img,
        rating: +(2.0 + (pidCount % 31) * 0.1).toFixed(1) > 5 ? 5.0 : +(2.0 + (pidCount % 31) * 0.1).toFixed(1),
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
        rating: Math.round(2.0 + (pidCount % 31) * 0.1),
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
      const prodId = `prod_${((i * 3 + k) % 140) + 1}`;
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
