import Alert from "../models/Alert.js";
import nodemailer from "nodemailer";

// Helper function to send restock email
const sendRestockEmail = async (email, componentName, retailerName) => {
  // Auto creates a temporary test account, no signup needed
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const mailOptions = {
    from: '"PC Build Platform" <noreply@pcbuild.com>',
    to: email,
    subject: `${componentName} is Back in Stock!`,
    text: `Good news! ${componentName} is now back in stock at ${retailerName}. 
    
Visit our platform to check the latest price and availability.

- PC Build Platform Team`,
  };

  const info = await transporter.sendMail(mailOptions);
  
  // This URL lets you preview the email in browser
  console.log("Email preview URL: " + nodemailer.getTestMessageUrl(info));
  
  return nodemailer.getTestMessageUrl(info);
};

// POST set a new alert (no email, just saves to DB)
export const setAlert = async (req, res) => {
  try {
    const { componentId, email, retailerName } = req.body;
    const newAlert = new Alert({
      componentId,
      email,
      retailerName,
    });
    await newAlert.save();
    res.status(201).json({
      message: "Alert set successfully!",
      data: newAlert,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET all alerts for dashboard
export const getAllAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().populate(
      "componentId",
      "name type brand"
    );
    res.status(200).json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE cancel an alert
export const deleteAlert = async (req, res) => {
  try {
    const deleted = await Alert.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Alert not found" });
    }
    res.status(200).json({ message: "Alert cancelled successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT mark component as restocked → sends email to all watchers
export const markAsRestocked = async (req, res) => {
  try {
    const { componentId, retailerName, componentName } = req.body;

    // Find all alerts watching this component at this retailer
    const alerts = await Alert.find({
      componentId,
      retailerName,
      isNotified: false,
    });

    if (alerts.length === 0) {
      return res.status(404).json({ 
        message: "No active alerts found for this component" 
      });
    }

    // Send email to each watcher and mark as notified
    const emailPreviews = [];
    for (const alert of alerts) {
      const previewUrl = await sendRestockEmail(
        alert.email,
        componentName,
        retailerName
      );
      emailPreviews.push({ email: alert.email, previewUrl });

      // Mark alert as notified
      await Alert.findByIdAndUpdate(alert._id, { isNotified: true });
    }

    res.status(200).json({
      message: `Restock emails sent to ${alerts.length} user(s)`,
      emailPreviews,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};