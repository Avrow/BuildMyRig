const mongoose = require('mongoose');
const axios = require('axios');

(async () => {
  try {
    console.log('==== COMPONENT CATALOG CHECK ====\n');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/m1_db', {});
    
    const db = mongoose.connection.db;
    const componentCollection = db.collection('components');
    
    // Count components by type
    const types = ['CPU', 'GPU', 'RAM', 'Storage', 'Motherboard', 'PSU', 'Case', 'Cooler'];
    const counts = {};
    let totalComponents = 0;
    
    console.log('Component Count by Type:');
    for (const type of types) {
      const count = await componentCollection.countDocuments({type: type});
      counts[type] = count;
      totalComponents += count;
      console.log('  ' + type + ': ' + count);
    }
    
    console.log('\nTotal Components: ' + totalComponents + '\n');
    
    if (totalComponents === 0) {
      console.log('No components found in database!');
      await mongoose.disconnect();
      process.exit(0);
    }
    
    // Test AI Build Matcher API
    console.log('==== AI BUILD MATCHER API TEST ====\n');
    
    const testPayload = {
      budget: 1000,
      useCase: 'gaming',
      targetResolution: '1080p',
      preferredBrands: [],
      extraNotes: ''
    };
    
    console.log('Request Body:', JSON.stringify(testPayload, null, 2));
    console.log('\nSending POST to http://localhost:8000/api/ai-build-matcher...\n');
    
    const response = await axios.post('http://localhost:8000/api/ai-build-matcher', testPayload, {
      validateStatus: () => true,
      timeout: 30000
    });
    
    console.log('Status Code:', response.status);
    console.log('Response Headers:', response.headers['content-type']);
    
    const bodyStr = JSON.stringify(response.data, null, 2);
    console.log('Response Body (first 800 chars):');
    console.log(bodyStr.substring(0, 800));
    
    if (bodyStr.length > 800) {
      console.log('...[truncated]');
    }
    
    console.log('\n==== SUMMARY ====');
    console.log('Component Counts:', JSON.stringify(counts, null, 2));
    console.log('API Status:', response.status);
    console.log('Response Success:', response.data.success || response.data.error);
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
    process.exit(1);
  }
})();
