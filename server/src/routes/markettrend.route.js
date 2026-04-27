import express from "express";
import {
  getMarketTrend,
  searchComponents,
} from "../controller/markettrend.controller.js";

const router = express.Router();

// GET market trend for a specific component
router.get("/trend/:componentName", getMarketTrend);

// GET search components
router.get("/search", searchComponents);

export default router;