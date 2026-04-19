import { Router } from "express";
import { createBuildPost, getAllBuildPosts } from "../controller/post.controller.js";

const router = Router();

// fetch all build posts (used by future api clients)
router.get("/", getAllBuildPosts);

router.post("/", createBuildPost);

export default router;
