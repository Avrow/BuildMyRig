import { Router } from "express";
import {
	getComponents,
	updateComponentImage,
} from "../controller/component.controller.js";

const router = Router();

router.get("/", getComponents);
router.put("/:id/image", updateComponentImage);

export default router;
