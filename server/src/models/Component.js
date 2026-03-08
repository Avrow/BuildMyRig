import mongoose from "mongoose";

const COMPONENT_TYPES = [
	"CPU",
	"GPU",
	"RAM",
	"Storage",
	"Motherboard",
	"PSU",
	"Case",
	"Cooler",
];

const componentSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Component name is required"],
			trim: true,
		},
		type: {
			type: String,
			required: [true, "Component type is required"],
			enum: COMPONENT_TYPES,
		},
		brand: {
			type: String,
			required: [true, "Brand is required"],
			trim: true,
		},
		// Flexible key-value bag for any technical spec (cores, clock, TDP…)
		specs: {
			type: mongoose.Schema.Types.Mixed,
			default: {},
		},
		price: {
			type: Number,
			default: null,
			min: [0, "Price cannot be negative"],
		},
		// Populated lazily by the Bing Image Search API on first view
		imageUrl: {
			type: String,
			default: null,
		},
	},
	{ timestamps: true },
);

// Enable full-text search on name + brand fields
componentSchema.index({ name: "text", brand: "text" });

export default mongoose.model("Component", componentSchema);
