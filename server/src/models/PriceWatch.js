import mongoose from "mongoose";

const priceWatchSchema = new mongoose.Schema(
  {
    componentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Component",
      required: true,
    },
    retailerName: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    location: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("PriceWatch", priceWatchSchema);