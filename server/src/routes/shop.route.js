import express from "express";
import {
    getAllShops,
    getShopById,
    createShop,
    updateShop,
    deleteShop,
} from "../controller/shop.controller.js";

const router = express.Router();

// GET /api/shops - Get all shops with optional area filtering
// GET /api/shops?area=Sutrapur - Filter shops by area
router.get("/", getAllShops);

// GET /api/shops/:id - Get single shop by ID
router.get("/:id", getShopById);

// POST /api/shops - Create new shop (admin only)
router.post("/", createShop);

// PUT /api/shops/:id - Update shop (admin only)
router.put("/:id", updateShop);

// DELETE /api/shops/:id - Delete shop (admin only)
router.delete("/:id", deleteShop);

export default router;
