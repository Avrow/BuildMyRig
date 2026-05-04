import { Router } from "express";
import {
	createBuildPost,
	getAllBuildPosts,
	getPostById,
	updateBuildPost,
	deleteBuildPost,
} from "../controller/post.controller.js";

const router = Router();

// Routes definition
router.get("/", getAllBuildPosts);
router.get("/:id", getPostById);
router.post("/", createBuildPost);
router.patch("/:id", updateBuildPost);
router.delete("/:id", deleteBuildPost);

export default router;
