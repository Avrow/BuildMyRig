import mongoose from "mongoose";

const shopSchema = new mongoose.Schema(
    {
        shopName: {
            type: String,
            required: true,
            trim: true,
        },
        area: {
            type: String,
            required: true,
            trim: true,
        },
        address: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        verified: {
            type: Boolean,
            default: false,
        },
        categories: [{
            type: String,
            trim: true,
        }],
        googleMapLink: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const Shop = mongoose.model("Shop", shopSchema);

export default Shop;
