import mongoose from "mongoose";

const savedBuildSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User reference is required"],
			index: true,
		},
		components: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Component",
			},
		],
		buildName: {
			type: String,
			default: "Virtual Build",
			trim: true,
			minlength: [2, "Build name must be at least 2 characters"],
			maxlength: [120, "Build name cannot exceed 120 characters"],
		},
		totalPrice: {
			type: Number,
			default: 0,
			min: [0, "Total price cannot be negative"],
		},
		buildImageUrl: {
			type: String,
			default: null,
			trim: true,
		},
	},
	{ timestamps: true },
);

savedBuildSchema.index({ user: 1, createdAt: -1 });

export default mongoose.models.SavedBuild ||
	mongoose.model("SavedBuild", savedBuildSchema);
