import mongoose from "mongoose";

const priceEntrySchema = new mongoose.Schema(
	{
		source: {
			type: String,
			enum: ["ryans", "startech"],
			required: true,
		},
		price: {
			type: Number,
			required: true,
			min: 0,
		},
		url: {
			type: String,
			required: true,
			trim: true,
		},
		lastUpdated: {
			type: Date,
			default: Date.now,
		},
	},
	{ _id: false },
);

const productSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		prices: {
			type: [priceEntrySchema],
			default: [],
		},
	},
	{ timestamps: true },
);

productSchema.index({ name: 1 });

export default mongoose.model("Product", productSchema);
