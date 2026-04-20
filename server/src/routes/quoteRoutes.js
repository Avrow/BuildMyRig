import express from "express";
import Quote from "../models/quote.js";
import { createQuote, getUserQuotes, getQuoteById, deleteQuote } from "../controller/quoteController.js";

const router = express.Router();

router.post("/", createQuote);
router.get("/test", (req, res) => {
    res.json({ message: "Quote routes are working", timestamp: new Date() });
});
router.get("/all", async (req, res) => {
    try {
        const quotes = await Quote.find({}).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: quotes,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});
router.get("/user/:userId", getUserQuotes);
router.get("/:id", getQuoteById);
router.delete("/:id", deleteQuote);

export default router;
