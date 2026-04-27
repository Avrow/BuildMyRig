require('dotenv').config();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

async function sendNotification() {
  await mongoose.connect('mongodb://localhost:27017/buildmyrig');
  
  const Alert = mongoose.model('Alert', new mongoose.Schema({
    componentId: mongoose.Schema.Types.ObjectId,
    email: String,
    retailerName: String,
    componentName: String,
    isNotified: Boolean
  }, { strict: false }));
  
  // Find your alert
  const alert = await Alert.findOne({ 
    email: 'asfiatuzzannatahana15@gmail.com',
    isNotified: false 
  });
  
  if (!alert) {
    console.log('No active alert found for this email');
    process.exit();
  }
  
  console.log('Found alert for:', alert.email);
  console.log('Component:', alert.componentName || 'Intel Core i9-13900K');
  console.log('Retailer:', alert.retailerName);
  
  // Setup email transporter
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  
  // Send email
  const mailOptions = {
    from: `"BuildMyRig" <${process.env.EMAIL_USER}>`,
    to: alert.email,
    subject: '✅ Back in Stock! Intel Core i9-13900K is now available',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #eab308;">🟢 Back in Stock Alert!</h2>
        <p>Good news! <strong>Intel Core i9-13900K</strong> is now available at <strong>${alert.retailerName}</strong>.</p>
        <p>Click below to purchase:</p>
        <a href="http://localhost:3000/price-watcher" style="background: #eab308; color: black; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Product</a>
        <hr>
        <p style="color: #666; font-size: 12px;">You received this because you set an inventory alert on BuildMyRig.</p>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', alert.email);
    
    // Mark as notified
    alert.isNotified = true;
    await alert.save();
    console.log('✅ Alert marked as notified');
  } catch (error) {
    console.error('❌ Email failed:', error.message);
  }
  
  process.exit();
}

sendNotification();
