import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    componentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Component",
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    retailerName: {
      type: String,
      required: true,
      trim: true,
    },
    isNotified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Alert", alertSchema);