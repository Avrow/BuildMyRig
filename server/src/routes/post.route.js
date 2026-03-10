import { Router } from "express";
import { createBuildPost } from "../controller/post.controller.js";

const router = Router();

router.get("/", (req, res) => {
	res.json(generateMockNews(5));
});

router.post("/", createBuildPost);

export default router;
