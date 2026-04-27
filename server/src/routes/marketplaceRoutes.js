import express from "express";
import multer from "multer";
import { createMarketplacePost, getAllMarketplaceItems } from "../controller/marketplaceController.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// পাথ শুধু "/" থাকবে কারণ app.js এ আমরা প্রক্সি দিয়েছি
router.post("/", createMarketplacePost);
router.get("/", getAllMarketplaceItems);

export default router;