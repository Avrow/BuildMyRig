import mongoose from "mongoose";

const marketplaceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, required: true },
    price: { type: Number, required: true },
    sellerName: { type: String, required: true },
    location: { type: String, required: true },
    phone: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String, default: "https://via.placeholder.com/500x400?text=PC+Component" },
    createdAt: { type: Date, default: Date.now }
});

const MarketplaceItem = mongoose.model("MarketplaceItem", marketplaceSchema);
export default MarketplaceItem;