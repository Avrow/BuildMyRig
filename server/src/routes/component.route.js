import { Router } from "express";
import {
	getComponents,
	updateComponentImage,
	getComponentPriceHandler,
	getComponentsPricesHandler,
} from "../controller/component.controller.js";

const router = Router();

// List components with filters
router.get("/", getComponents);

// Update component image
router.patch("/:id/image", updateComponentImage);

// Get component price with smart caching
router.get("/price", getComponentPriceHandler);

// Batch get multiple component prices
router.post("/prices", getComponentsPricesHandler);

export default router;
