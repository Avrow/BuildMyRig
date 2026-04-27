require('dotenv').config();
const mongoose = require('mongoose');

async function trigger() {
  await mongoose.connect('mongodb://localhost:27017/buildmyrig');
  
  const Component = mongoose.model('Component', new mongoose.Schema({
    name: String,
    stockStatus: String
  }, { strict: false }));
  
  const component = await Component.findOne({ 
    name: { $regex: 'Intel Core i9-13900K', $options: 'i' } 
  });
  
  if (!component) {
    console.log('Component not found!');
    process.exit();
  }
  
  console.log('Found:', component.name);
  console.log('Current status:', component.stockStatus);
  
  component.stockStatus = 'in_stock';
  await component.save();
  
  console.log('Updated to: in_stock');
  console.log('Email notification triggered! Check your email inbox.');
  
  process.exit();
}

trigger();
