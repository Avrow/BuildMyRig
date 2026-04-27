import PriceWatch from "../models/PriceWatch.js";
import Alert from "../models/Alert.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const sendRestockEmail = async (email, componentName, retailerName) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"BuildMyRig" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🟢 ${componentName} is Back in Stock at ${retailerName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #22c55e;">🟢 Back in Stock!</h2>
          <p><strong>${componentName}</strong> is now back in stock at <strong>${retailerName}</strong>!</p>
          <p>Visit BuildMyRig to check the latest price and availability.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">You received this because you set an inventory alert on BuildMyRig.</p>
        </div>
      `,
    });

    console.log(`📧 Restock email sent to ${email} for ${componentName}`);
    return true;
  } catch (error) {
    console.error("Restock email error:", error.message);
    return false;
  }
};

const checkRestock = async () => {
  try {
    // Find all unnotified alerts
    const alerts = await Alert.find({ isNotified: false });
    
    for (const alert of alerts) {
      // Check if this component is now in stock at the retailer
      const priceEntry = await PriceWatch.findOne({
        componentId: alert.componentId,
        retailerName: alert.retailerName,
        inStock: true,
      });

      if (priceEntry) {
        // Item is back in stock! Send email
        console.log(`🔍 Restock detected: ${alert.componentName} at ${alert.retailerName}`);
        
        await sendRestockEmail(
          alert.email,
          alert.componentName,
          alert.retailerName
        );

        // Mark alert as notified
        await Alert.findByIdAndUpdate(alert._id, { isNotified: true });
      }
    }
  } catch (error) {
    console.error("Restock checker error:", error.message);
  }
};

// Run every 30 seconds
export const startRestockChecker = () => {
  console.log("🔄 Restock checker started — checking every 30 seconds");
  setInterval(checkRestock, 30000);
};