import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    buildId: { type: mongoose.Schema.Types.ObjectId, ref: 'BuildPost', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true }, 
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    reactions: {
        love: { type: [String], default: [] },
        haha: { type: [String], default: [] },
        sad: { type: [String], default: [] }
    },
    replies: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        userName: String,
        text: String,
        createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Review ?? mongoose.model("Review", reviewSchema);