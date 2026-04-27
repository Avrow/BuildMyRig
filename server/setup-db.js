const mongoose = require('mongoose');

async function setupDatabase() {
  try {
    await mongoose.connect('mongodb://localhost:27017/buildmyrig');
    const db = mongoose.connection.db;
    
    console.log('Connected to database');
    
    // Clear existing
    await db.collection('pricewatches').deleteMany({});
    await db.collection('retailers').deleteMany({});
    
    // Add retailers
    const retailers = [
      { name: 'Star Tech', location: 'Dhaka' },
      { name: 'Ryans Computers', location: 'Dhaka' },
      { name: 'TechLand', location: 'Dhaka' },
      { name: 'Global PC', location: 'Chittagong' },
      { name: 'PC World', location: 'Dhaka' }
    ];
    
    await db.collection('retailers').insertMany(retailers);
    console.log('✅ Added 5 retailers');
    
    // Get components
    const components = await db.collection('components').find().toArray();
    console.log(`📦 Found ${components.length} components`);
    
    // Price ranges by component type
    const priceRanges = {
      'CPU': { min: 15000, max: 60000 },
      'GPU': { min: 25000, max: 150000 },
      'RAM': { min: 3000, max: 20000 },
      'Storage': { min: 4000, max: 25000 },
      'Motherboard': { min: 8000, max: 40000 },
      'PSU': { min: 4000, max: 18000 },
      'Case': { min: 3000, max: 15000 },
      'Cooler': { min: 2000, max: 12000 }
    };
    
    // Add prices for each component to each retailer
    let priceCount = 0;
    for (const component of components) {
      const range = priceRanges[component.type] || { min: 5000, max: 30000 };
      for (const retailer of retailers) {
        const price = Math.round(range.min + Math.random() * (range.max - range.min));
        const inStock = Math.random() > 0.2;
        
        await db.collection('pricewatches').insertOne({
          componentId: component._id,
          retailerName: retailer.name,
          price: price,
          inStock: inStock,
          location: retailer.location,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        priceCount++;
      }
    }
    
    console.log(`✅ Added ${priceCount} price entries`);
    console.log('\n=== VERIFICATION ===');
    console.log(`Retailers: ${await db.collection('retailers').countDocuments()}`);
    console.log(`Components: ${await db.collection('components').countDocuments()}`);
    console.log(`Prices: ${await db.collection('pricewatches').countDocuments()}`);
    
    await mongoose.disconnect();
    console.log('\n✅ Database setup complete!');
  } catch (error) {
    console.error('Error:', error);
  }
}

setupDatabase();
