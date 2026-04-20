import express from "express";
import { getParts } from "../controller/partsController.js";

const router = express.Router();

router.get("/", getParts);

export default router;
