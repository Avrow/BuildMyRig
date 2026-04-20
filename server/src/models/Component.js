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
		// Price data from multiple sources
		prices: [
			{
				source: {
					type: String,
					enum: ["ryans", "startech"],
					required: true,
				},
				price: {
					type: Number,
					required: true,
					min: [0, "Price cannot be negative"],
				},
				url: {
					type: String,
					default: null,
				},
				lastUpdated: {
					type: Date,
					default: Date.now,
				},
			},
		],
		// Legacy single price field (for backward compatibility)
		price: {
			type: Number,
			default: null,
			min: [0, "Price cannot be negative"],
		},
		// Track when price data was last updated
		lastPriceUpdate: {
			type: Date,
			default: null,
		},
		// Populated lazily by the Serper Image Search API on first view
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
