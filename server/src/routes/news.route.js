import { Router } from "express";
import axios from "axios";
// import dotenv from "dotenv";

// dotenv.config();
const router = Router();
const NEWS_CACHE_TTL_MS = 5 * 60 * 1000;
const FAILURE_CACHE_TTL_MS = 30 * 1000;
const PROVIDER_BASE_URL = "https://newsapi.org/v2/everything";

let newsCache = {
	data: null,
	expiresAt: 0,
};

// Map of news sources for specific categories - using more specific queries to filter relevant content
const categoryQueries = {
	"PC Components & Prices": [
		"(GPU OR graphics card) AND (price OR cost OR specification)",
		"(CPU OR processor) AND (price OR benchmark OR release)",
		"(RAM OR memory) AND (DDR5 OR DDR4 OR performance)",
		"gaming PC build components",
	],
	"Software News": [
		"software update release",
		"programming language news",
		"developer tools framework",
		"API update announcement",
	],
	"Tech Discoveries": [
		"technology breakthrough innovation",
		"AI advancement",
		"quantum computing",
		"tech review analysis",
	],
	"GPU/Graphics News": [
		"(graphics card OR GPU) AND (NVIDIA OR AMD OR Intel)",
		"GPU benchmark performance",
		"ray tracing DLSS technology",
	],
	"CPU News": [
		"(CPU OR processor) AND (Intel OR AMD)",
		"processor benchmark release",
		"CPU performance comparison",
	],
};

// Keywords to exclude from results to filter out irrelevant articles
const excludeKeywords = [
	"cryptocurrency",
	"bitcoin",
	"stock market",
	"sports",
	"celebrity",
	"entertainment",
	"weather",
	"politics",
	"medical",
	"legal",
	"iphone",
	"smartphone",
	"android device",
	"tablet",
	"smartwatch",
	"wearable",
	"car",
	"automobile",
	"travel",
	"fashion",
	"streaming service",
	"kitchen",
	"cooking",
	"mixer",
	"appliance",
	"furniture",
	"home decor",
	"beauty",
	"makeup",
	"jewelry",
	"music festival",
	"concert",
	"singer",
	"band",
	"artist performance",
];

const isRelevantArticle = (article) => {
	const combinedText = (
		article.title +
		" " +
		(article.description || "") +
		" " +
		(article.content || "")
	).toLowerCase();

	// Check if any exclude keywords appear in the article
	if (excludeKeywords.some((keyword) => combinedText.includes(keyword))) {
		return false;
	}

	// For GPU/Graphics and CPU categories, require at least one tech-related keyword
	const techKeywords = [
		"gpu",
		"graphics",
		"nvidia",
		"amd",
		"intel",
		"cpu",
		"processor",
		"ram",
		"memory",
		"motherboard",
		"ssd",
		"storage",
		"benchmark",
		"performance",
		"gaming",
		"gaming pc",
		"ryzen",
		"geforce",
		"radeon",
		"tech",
		"software",
		"framework",
		"api",
		"programming",
		"developer",
		"ai",
		"quantum",
		"chip",
		"release",
		"announcement",
		"launch",
	];

	// At least one tech keyword should be present
	return techKeywords.some((keyword) => combinedText.includes(keyword));
};

const getNewsApiKey = () => process.env.NEWSAPI_KEY?.trim();

const mapProviderError = (error, query) => {
	const status = error?.response?.status;
	const providerMessage = error?.response?.data?.message;

	let type = "provider_error";
	if (status === 401 || status === 403) {
		type = "invalid_api_key";
	} else if (status === 429) {
		type = "rate_limited";
	} else if (error?.code) {
		type = "network_error";
	}

	return {
		type,
		query,
		status: status || null,
		code: error?.code || null,
		message: providerMessage || error?.message || "Unknown provider error",
	};
};

const mapArticleToNewsItem = (article, category) => {
	if (!article?.title || !article?.url) {
		return null;
	}

	// Filter out irrelevant articles
	if (!isRelevantArticle(article)) {
		return null;
	}

	return {
		id: `${Date.now()}-${Math.random()}`,
		title: article.title,
		description: article.description || "No description available",
		content: article.content || "Click to read more",
		summary: article.description || "No summary available",
		publishedAt: article.publishedAt,
		source: article.source?.name || "Unknown",
		originalUrl: article.url,
		imageUrl: article.urlToImage || null,
		category,
	};
};

const fetchNewsFromAPI = async (query) => {
	const apiKey = getNewsApiKey();

	if (!apiKey) {
		return {
			articles: [],
			error: {
				type: "missing_api_key",
				query,
				status: null,
				code: null,
				message: "NEWSAPI_KEY is not configured",
			},
		};
	}

	try {
		const response = await axios.get(PROVIDER_BASE_URL, {
			params: {
				q: query,
				sortBy: "publishedAt",
				language: "en",
				apiKey,
				pageSize: 10,
			},
			timeout: 8000,
		});

		return {
			articles: response.data.articles || [],
			error: null,
		};
	} catch (error) {
		const mappedError = mapProviderError(error, query);
		console.error("[NewsAPI] Provider request failed", mappedError);
		return {
			articles: [],
			error: mappedError,
		};
	}
};

const getNewsByCategory = async ({ forceRefresh = false } = {}) => {
	try {
		if (!forceRefresh && newsCache.data && Date.now() < newsCache.expiresAt) {
			return {
				news: newsCache.data,
				errors: [],
				fromCache: true,
			};
		}

		const allNews = [];
		const errors = [];

		for (const [category, queries] of Object.entries(categoryQueries)) {
			for (const query of queries) {
				const { articles, error } = await fetchNewsFromAPI(query);
				if (error) {
					errors.push(error);
				}

				const categoryArticles = articles
					.map((article) => mapArticleToNewsItem(article, category))
					.filter(Boolean);
				allNews.push(...categoryArticles);
			}
		}

		// Sort by date and remove duplicates
		const uniqueNews = Array.from(
			new Map(
				allNews
					.sort(
						(a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0),
					)
					.map((item) => [`${item.title}-${item.originalUrl}`, item]),
			).values(),
		);

		const result = uniqueNews.slice(0, 50);
		newsCache = {
			data: result,
			expiresAt:
				Date.now() + (result.length > 0 ? NEWS_CACHE_TTL_MS : FAILURE_CACHE_TTL_MS),
		};

		return {
			news: result,
			errors,
			fromCache: false,
		};
	} catch (error) {
		console.error("[NewsAPI] Error fetching categorized news:", error);
		return {
			news: [],
			errors: [
				{
					type: "server_error",
					query: null,
					status: null,
					code: null,
					message:
						error?.message || "Unexpected server error while building news list",
				},
			],
			fromCache: false,
		};
	}
};

// Get all news with optional category filter and search
router.get("/", async (req, res) => {
	try {
		const { category, search, refresh } = req.query;
		const forceRefresh = String(refresh).toLowerCase() === "true";

		let { news, errors, fromCache } = await getNewsByCategory({ forceRefresh });

		if (news.length === 0 && errors.length > 0) {
			return res.status(502).json({
				success: false,
				error: "Unable to fetch news from provider",
				count: 0,
				data: [],
				details:
					process.env.NODE_ENV === "production"
						? undefined
						: errors.slice(0, 5),
			});
		}

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
			meta: {
				fromCache,
				hadProviderErrors: errors.length > 0,
			},
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
		const { search, refresh } = req.query;
		const forceRefresh = String(refresh).toLowerCase() === "true";

		let { news, errors, fromCache } = await getNewsByCategory({ forceRefresh });

		if (news.length === 0 && errors.length > 0) {
			return res.status(502).json({
				success: false,
				error: "Unable to fetch news from provider",
				count: 0,
				data: [],
				details:
					process.env.NODE_ENV === "production"
						? undefined
						: errors.slice(0, 5),
			});
		}

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
			meta: {
				fromCache,
				hadProviderErrors: errors.length > 0,
			},
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
