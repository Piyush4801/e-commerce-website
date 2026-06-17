const fs = require('fs');
const path = require('path');

const categories = ['Electronics', 'Fashion', 'Books', 'Grocery', 'Beauty', 'Sports', 'Home & Kitchen'];

const imagesData = {
  'Electronics': [
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=400',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
    'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400',
    'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400',
    'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=400'
  ],
  'Fashion': [
    'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400',
    'https://images.unsplash.com/photo-1434389678278-dfa4cb5c58ee?w=400',
    'https://images.unsplash.com/photo-1489987707023-af0825dad1c3?w=400',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400',
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400'
  ],
  'Books': [
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
    'https://images.unsplash.com/photo-1589998059171-9899ea8a5df4?w=400',
    'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400',
    'https://images.unsplash.com/photo-1524578970427-96a84f3df9b5?w=400',
    'https://images.unsplash.com/photo-1511108690759-009324a90311?w=400',
    'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400',
    'https://images.unsplash.com/photo-1521123845561-1229c30e6231?w=400',
    'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=400'
  ],
  'Grocery': [
    'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
    'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400',
    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
    'https://images.unsplash.com/photo-1615483555563-fcba6a5e0b65?w=400',
    'https://images.unsplash.com/photo-1596647901053-90d56ee36611?w=400',
    'https://images.unsplash.com/photo-1574316074151-68d183f34586?w=400',
    'https://images.unsplash.com/photo-1601648764658-cf37e8c89b70?w=400',
    'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=400',
    'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400',
    'https://images.unsplash.com/photo-1584286595398-a59f21d313f5?w=400'
  ],
  'Beauty': [
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400',
    'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400',
    'https://images.unsplash.com/photo-1571781926291-c477eb30d421?w=400',
    'https://images.unsplash.com/photo-1617897903246-719242758050?w=400',
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
    'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400',
    'https://images.unsplash.com/photo-1512496015851-a1dcfb3b8f46?w=400',
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
    'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=400'
  ],
  'Sports': [
    'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=400',
    'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=400',
    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400',
    'https://images.unsplash.com/photo-1515523110800-9415d13b84a8?w=400',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
    'https://images.unsplash.com/photo-1576633587382-13ddf37b1fc1?w=400',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400',
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400'
  ],
  'Home & Kitchen': [
    'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=400',
    'https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=400',
    'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400',
    'https://images.unsplash.com/photo-1556910103-1c02745a872f?w=400',
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400',
    'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400',
    'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=400',
    'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=400',
    'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=400',
    'https://images.unsplash.com/photo-1622659350436-a3eeeb5b5d13?w=400'
  ]
};

const names = {
  'Electronics': ['Smart Laptop', 'Pro Phone', 'Wireless Earbuds', '4K Monitor', 'Smartwatch', 'Mechanical Keyboard', 'Gaming Mouse', 'Bluetooth Speaker', 'Tablet Pro', 'Action Camera'],
  'Fashion': ['Denim Jeans', 'Leather Jacket', 'Cotton T-Shirt', 'Running Sneakers', 'Wool Sweater', 'Sunglasses', 'Casual Dress', 'Smart Watch', 'Silk Tie', 'Canvas Backpack'],
  'Books': ['JavaScript Handbook', 'Sci-Fi Novel', 'History of World', 'Startup Guide', 'Cooking Recipes', 'Poetry Collection', 'Mystery Thriller', 'Design Patterns', 'Art Album', 'Financial Freedom'],
  'Grocery': ['Organic Honey', 'Almond Milk', 'Dark Roast Coffee', 'Olive Oil', 'Quinoa', 'Sea Salt', 'Green Tea', 'Brown Rice', 'Peanut Butter', 'Rolled Oats'],
  'Beauty': ['Face Wash', 'Sunscreen SPF 50', 'Moisturizer', 'Vitamin C Serum', 'Lip Balm', 'Body Wash', 'Hair Oil', 'Exfoliating Scrub', 'Night Cream', 'Hand Lotion'],
  'Sports': ['Yoga Mat', 'Dumbbells', 'Water Bottle', 'Resistance Bands', 'Jump Rope', 'Foam Roller', 'Gym Bag', 'Running Shoes', 'Protein Shaker', 'Cycling Gloves'],
  'Home & Kitchen': ['Cast Iron Skillet', 'Air Fryer', 'Dinnerware Set', 'Coffee Maker', 'Blender', 'Knife Set', 'Cutting Board', 'Toaster', 'Food Storage', 'Wine Glasses']
};

const productTemplates = {};

for (const cat of categories) {
  productTemplates[cat] = [];
  const imgs = imagesData[cat];
  const catNames = names[cat];
  for (let i = 0; i < 20; i++) {
    const imgUrl = imgs[i % imgs.length];
    const baseName = catNames[i % catNames.length];
    
    productTemplates[cat].push({
      name: `${['Premium', 'Eco', 'Smart', 'Elite', 'Pro', 'Classic', 'Ultra'][i % 7]} ${baseName} ${i > 9 ? 'v2' : ''}`.trim(),
      price: Math.floor(Math.random() * 5000) + 500,
      desc: `High quality ${cat.toLowerCase()} product with excellent durability and eco-friendly manufacturing process.`,
      eco: ['A', 'B', 'C', 'D'][i % 4],
      ecoRating: 3.5 + (i % 15) * 0.1,
      footprint: Math.floor(Math.random() * 200) / 10,
      img: imgUrl
    });
  }
}

const templatesStr = `  const productTemplates = ${JSON.stringify(productTemplates, null, 4)};`;

const targetFile = path.join(__dirname, '../data/dummyData.js');
let content = fs.readFileSync(targetFile, 'utf8');

const regex = /  const productTemplates = \{[\s\S]*?\};\n\n  \/\/ Generate 105 products total/;

const newContent = content.replace(regex, `${templatesStr}\n\n  // Generate 140 products total`);
const newContent2 = newContent.replace(/105/g, '140'); 

fs.writeFileSync(targetFile, newContent2);
console.log('Successfully updated dummyData.js with 140 unique product templates!');
