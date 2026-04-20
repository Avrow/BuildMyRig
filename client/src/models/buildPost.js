import mongoose from "mongoose";

const buildPostSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: [true, "Author is required"] },
    imageUrl: { type: String, required: [true, "An image URL is required"] },
    caption: { type: String, required: [true, "A caption is required"], maxlength: [280, "Caption cannot exceed 280 characters"] },
    description: { type: String, required: [true, "The builder's narrative is required"] },
    cpu: { type: String, required: [true, "CPU is required"] },
    gpu: { type: String, required: [true, "GPU is required"] },
    ram: { type: String, required: [true, "RAM is required"] },
}, { timestamps: true });

export default mongoose.models.BuildPost ?? mongoose.model("BuildPost", buildPostSchema);