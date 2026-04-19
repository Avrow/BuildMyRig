import express from "express";
import {
  setAlert,
  getAllAlerts,
  deleteAlert,
  markAsRestocked,
} from "../controller/inventoryalert.controller.js";

const router = express.Router();

// POST set a new alert
router.post("/set", setAlert);

// GET all alerts
router.get("/", getAllAlerts);

// DELETE cancel an alert
router.delete("/delete/:id", deleteAlert);

// PUT mark component as restocked + send emails
router.put("/restock", markAsRestocked);

export default router;