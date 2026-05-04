import express from "express";
import {
	createReview,
	createReply,
	getReviewsByPost,
	reactToReview,
} from "../controller/review.controller.js";

const router = express.Router();

router.post("/", createReview);
router.get("/:buildId", getReviewsByPost);
router.post("/:reviewId/replies", createReply);
router.patch("/react", reactToReview);

export default router;
