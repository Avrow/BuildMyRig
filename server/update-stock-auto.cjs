require('dotenv').config();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

async function updateStockAndNotify() {
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
    return;
  }
  
  console.log('Found:', component.name);
  console.log('Current status:', component.stockStatus);
  
  component.stockStatus = 'in_stock';
  await component.save();
  console.log('✅ Updated stock to: in_stock');
  
  const Alert = mongoose.model('Alert', new mongoose.Schema({
    componentId: mongoose.Schema.Types.ObjectId,
    email: String,
    retailerName: String,
    isNotified: Boolean
  }, { strict: false }));
  
  const alerts = await Alert.find({ 
    componentId: component._id, 
    isNotified: false 
  });
  
  console.log('Found', alerts.length, 'alerts to notify');
  
  if (alerts.length === 0) {
    console.log('No active alerts');
    process.exit();
    return;
  }
  
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  
  for (const alert of alerts) {
    try {
      await transporter.sendMail({
        from: `"BuildMyRig" <${process.env.EMAIL_USER}>`,
        to: alert.email,
        subject: `✅ Back in Stock! ${component.name}`,
        html: `<h2>${component.name} is back in stock at ${alert.retailerName}!</h2><p>Visit BuildMyRig to purchase.</p>`
      });
      console.log('✅ Email sent to:', alert.email);
      alert.isNotified = true;
      await alert.save();
    } catch (error) {
      console.error('❌ Failed:', error.message);
    }
  }
  
  console.log('Done!');
  process.exit();
}

updateStockAndNotify();
