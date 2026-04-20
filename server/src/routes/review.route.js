import express from "express";
import { createReview, getReviewsByPost, reactToReview } from "../controller/review.controller.js";

const router = express.Router();

router.post("/", createReview);
router.get("/:buildId", getReviewsByPost);
router.patch("/react", reactToReview);

export default router;