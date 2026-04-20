import mongoose from "mongoose";

const partSchema = new mongoose.Schema({
    partName: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
});

const quoteSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    quoteName: {
        type: String,
        required: true,
        trim: true,
    },
    parts: [partSchema],
    totalPrice: {
        type: Number,
        required: true,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

quoteSchema.pre('save', function() {
    this.totalPrice = this.parts.reduce((total, part) => total + part.price, 0);
});

export default mongoose.model("Quote", quoteSchema);
