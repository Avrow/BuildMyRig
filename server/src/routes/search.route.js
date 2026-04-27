import express from "express";
import { searchComponents, searchRetailers } from "../controller/search.controller.js";

const router = express.Router();

router.get("/components", searchComponents);
router.get("/retailers", searchRetailers);

export default router;
