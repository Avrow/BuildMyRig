import mongoose from "mongoose";

const buildPostSchema = new mongoose.Schema(
    {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
        imageUrl: { type: String, required: true },
        caption: { type: String, required: true },
        cpu: { type: String, required: true },
        gpu: { type: String, required: true },
        ram: { type: String, required: true },
        description: { type: String, required: true }, 
    },
    { timestamps: true }
);

export default mongoose.models.BuildPost ?? mongoose.model("BuildPost", buildPostSchema);