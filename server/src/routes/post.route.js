import { Router } from "express";
import { createBuildPost, getAllBuildPosts, getPostById } from "../controller/post.controller.js";

const router = Router();

// Routes definition
router.get("/", getAllBuildPosts);
router.get("/:id", getPostById); 
router.post("/", createBuildPost);

export default router;