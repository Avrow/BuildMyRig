import mongoose from "mongoose";

const marketTrendSchema = new mongoose.Schema({
  componentName: {
    type: String,
    required: true,
    trim: true,
  },
  priceUSD: {
    type: Number,
    required: true,
  },
  priceBDT: {
    type: Number,
    required: true,
  },
  exchangeRate: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
}, { timestamps: true });

export default mongoose.model("MarketTrend", marketTrendSchema);