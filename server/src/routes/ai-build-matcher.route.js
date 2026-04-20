import { Router } from "express";
import { generateAIBuildMatch } from "../controller/ai-build-matcher.controller.js"


const router = Router();

router.post("/", generateAIBuildMatch);

export default router;
