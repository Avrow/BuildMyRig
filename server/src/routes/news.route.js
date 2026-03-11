import { Router } from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const router = Router();

const NEWSAPI_KEY = process.env.NEWSAPI_KEY;

// Map of news sources for specific categories
const categoryQueries = {
	"PC Components & Prices": ["GPU price", "CPU price", "RAM price", "gaming PC"],
	"Software News": ["software update", "programming language", "developer news"],
	"Tech Discoveries": [
		"tech innovation",
		"new technology",
		"tech breakthrough",
	],
	"GPU/Graphics News": ["GPU", "graphics card", "NVIDIA", "AMD Radeon"],
	"CPU News": ["CPU", "processor", "Intel", "AMD Ryzen"],
};

const fetchNewsFromAPI = async (query) => {
	console.log(NEWSAPI_KEY)
	try {
		const response = await axios.get("https://newsapi.org/v2/everything", {
			params: {
				q: query,
				sortBy: "publishedAt",
				language: "en",
				apiKey: NEWSAPI_KEY,
				pageSize: 10,
			},
		});

		return response.data.articles || [];
	} catch (error) {
		console.error("[NewsAPI] Error fetching news:", error.message);
		return [];
	}
};

const getNewsByCategory = async () => {
	try {
		const allNews = [];

		for (const [category, queries] of Object.entries(categoryQueries)) {
			for (const query of queries) {
				const articles = await fetchNewsFromAPI(query);
				const categoryArticles = articles.map((article) => ({
					id: `${Date.now()}-${Math.random()}`,
					title: article.title,
					description: article.description || "No description available",
					content: article.content || "Click to read more",
					summary: article.description || "No summary available",
					publishedAt: article.publishedAt,
					source: article.source.name,
					originalUrl: article.url,
					imageUrl: article.urlToImage,
					category: category,
				}));
				allNews.push(...categoryArticles);
			}
		}

		// Sort by date and remove duplicates
		const uniqueNews = Array.from(
			new Map(
				allNews
					.sort(
						(a, b) =>
							new Date(b.publishedAt) - new Date(a.publishedAt),
					)
					.map((item) => [item.title, item]),
			).values(),
		);

		return uniqueNews.slice(0, 50); // Return top 50 unique news
	} catch (error) {
		console.error("[NewsAPI] Error fetching categorized news:", error);
		return [];
	}
};

// Get all news with optional category filter and search
router.get("/", async (req, res) => {
	try {
		const { category, search } = req.query;

		let news = await getNewsByCategory();

		if (category && category !== "All") {
			news = news.filter((item) => item.category === category);
		}

		if (search) {
			const searchLower = search.toLowerCase();
			news = news.filter(
				(item) =>
					item.title.toLowerCase().includes(searchLower) ||
					item.summary.toLowerCase().includes(searchLower),
			);
		}

		res.json({
			success: true,
			count: news.length,
			data: news,
		});
	} catch (error) {
		console.error("[NewsAPI] Route error:", error);
		res.status(500).json({
			success: false,
			error: "Failed to fetch news",
		});
	}
});

// Get news by specific category
router.get("/category/:category", async (req, res) => {
	try {
		const { category } = req.params;
		const { search } = req.query;

		let news = await getNewsByCategory();
		news = news.filter((item) => item.category === category);

		if (search) {
			const searchLower = search.toLowerCase();
			news = news.filter(
				(item) =>
					item.title.toLowerCase().includes(searchLower) ||
					item.summary.toLowerCase().includes(searchLower),
			);
		}

		res.json({
			success: true,
			count: news.length,
			data: news,
		});
	} catch (error) {
		console.error("[NewsAPI] Category route error:", error);
		res.status(500).json({
			success: false,
			error: "Failed to fetch news",
		});
	}
});

export default router;
