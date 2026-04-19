import mongoose from "mongoose";

const buildPostSchema = new mongoose.Schema(
	{
		imageUrl: {
			type: String,
			required: [true, "An image URL is required"],
		},
		caption: {
			type: String,
			required: [true, "A caption is required"],
			maxlength: [280, "Caption cannot exceed 280 characters"],
		},
		cpu: {
			type: String,
			required: [true, "CPU is required"],
		},
		gpu: {
			type: String,
			required: [true, "GPU is required"],
		},
		ram: {
			type: String,
			required: [true, "RAM is required"],
		},
	},
	{
		timestamps: true, // automatically adds createdAt and updatedAt
	},
);

// Guard against model re-compilation during Next.js hot reloads.
export default mongoose.models.BuildPost ??
	mongoose.model("BuildPost", buildPostSchema);
