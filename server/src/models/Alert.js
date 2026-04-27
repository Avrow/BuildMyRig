import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
  componentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Component",
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  retailerName: {
    type: String,
    required: true,
  },
  componentName: {
    type: String,
    required: true,
  },
  isNotified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Alert", alertSchema);