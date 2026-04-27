import Alert from "../models/Alert.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Helper function to send confirmation email when alert is set
const sendConfirmationEmail = async (email, componentName, retailerName) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    const mailOptions = {
      from: `"BuildMyRig" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `✅ Alert Set for ${componentName} at ${retailerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #eab308;">✅ Inventory Alert Confirmed!</h2>
          <p>You have set an alert for <strong>${componentName}</strong> at <strong>${retailerName}</strong>.</p>
          <p>You will receive an email when this product is back in stock.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">Thank you for using BuildMyRig!</p>
        </div>
      `,
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`📧 Confirmation email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Email error:", error.message);
    return false;
  }
};

// Helper function to send restock email
const sendRestockEmail = async (email, componentName, retailerName) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    const mailOptions = {
      from: `"BuildMyRig" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🟢 ${componentName} is Back in Stock at ${retailerName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #22c55e;">🟢 Back in Stock!</h2>
          <p><strong>${componentName}</strong> is now back in stock at <strong>${retailerName}</strong>!</p>
          <p>Visit BuildMyRig to purchase immediately.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">You received this because you set an inventory alert on BuildMyRig.</p>
        </div>
      `,
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`📧 Restock email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Email error:", error.message);
    return false;
  }
};

// POST set a new alert - SENDS CONFIRMATION EMAIL
export const setAlert = async (req, res) => {
  try {
    const { componentId, email, retailerName, componentName } = req.body;
    
    const newAlert = new Alert({
      componentId,
      email,
      retailerName,
      componentName: componentName,
      isNotified: false,
    });
    
    await newAlert.save();
    console.log(`✅ Alert saved for ${email} on ${componentName}`);
    
    // Send confirmation email
    await sendConfirmationEmail(email, componentName, retailerName);
    
    res.status(201).json({
      success: true,
      message: "Alert set successfully! Confirmation email sent.",
      data: newAlert,
    });
  } catch (error) {
    console.error("Set alert error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// GET all alerts for dashboard
export const getAllAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().populate("componentId", "name type brand");
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

    for (const alert of alerts) {
      await sendRestockEmail(alert.email, componentName, retailerName);
      await Alert.findByIdAndUpdate(alert._id, { isNotified: true });
    }

    res.status(200).json({
      success: true,
      message: `Restock emails sent to ${alerts.length} user(s)`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};