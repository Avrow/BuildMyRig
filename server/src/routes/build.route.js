import { Router } from "express";
import {
	generateBuildLook,
	createSavedBuild,
	getMySavedBuilds,
} from "../controller/build.controller.js";
import { authenticateUser } from "../middleware/auth.js";

const router = Router();

router.post("/generate-look", generateBuildLook);
router.post("/virtual-look", generateBuildLook);
router.post("/", authenticateUser, createSavedBuild);
router.get("/my-builds", authenticateUser, getMySavedBuilds);

export default router;
