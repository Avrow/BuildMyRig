import express from "express";
import {
  getPricesByComponent,
  addPrice,
  updatePrice,
} from "../controller/pricewatch.controller.js";

const router = express.Router();

// GET all prices for a specific component
router.get("/component/:componentId", getPricesByComponent);

// POST add a new price entry›
router.post("/add", addPrice);

// PUT update a price entry
router.put("/update/:id", updatePrice);

export default router;