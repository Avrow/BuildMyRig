import express from "express";
import {
  reviewBuild,
  analyzeComponent,
} from "../controller/ai-review.controller.js";

const router = express.Router();

// POST review a full build
router.post("/review-build", reviewBuild);

// GET analyze a single component
router.get("/analyze-component/:componentId", analyzeComponent);

export default router;
