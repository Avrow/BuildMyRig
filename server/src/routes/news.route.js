import { Router } from "express";
import axios from "axios";

const router = Router();

router.get("/", async (req, res) => {
	try {
		const response = await axios.get("https://newsapi.org/v2/everything", {
			params: {
				q: "technology OR AI OR software OR programming OR gadgets OR startups",
				language: "en",
				sortBy: "publishedAt",
				pageSize: 20,
				domains: "techcrunch.com,theverge.com,wired.com,arstechnica.com",

				apiKey: process.env.NEWSAPI_KEY,
			},
		});

		res.json({
			success: true,
			data: response.data.articles,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

export default router;
