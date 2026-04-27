import OpenAI from "openai";
import Component from "../models/Component.js";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
	apiKey: process.env.OPENROUTER_API_KEY,
	baseURL: "https://openrouter.ai/api/v1",
	defaultHeaders: {
		"HTTP-Referer": process.env.APP_URL || "http://localhost:8000",
		"X-Title": "BuildMyRig AI Build Matcher",
	},
});

/**
 * 🔥 SMART FILTERING CONFIG
 */
const LIMITS = {
	CPU: 8,
	GPU: 8,
	RAM: 5,
	Storage: 5,
	Motherboard: 8,
	PSU: 5,
	Case: 5,
	Cooler: 5,
};

/**
 * 🎯 Fetch + FILTER catalog (IMPORTANT)
 */
async function fetchFilteredCatalog(budget, useCase) {
	const catalog = {};
	const types = Object.keys(LIMITS);

	for (const type of types) {
		// Basic filtering by budget (rough heuristic)
		const maxPrice = getMaxPriceByType(type, budget);

		let query = { type, price: { $lte: maxPrice } };

		let components = await Component.find(query)
			.sort({ price: -1 }) // higher value first
			.limit(LIMITS[type])
			.lean();

		// 🚀 REMOVE HEAVY FIELDS
		catalog[type] = components.map((c) => ({
			name: c.name,
			brand: c.brand,
			price: c.price,
		}));
	}

	return catalog;
}

/**
 * 💡 Budget allocation heuristic
 */
function getMaxPriceByType(type, budget) {
	const ratios = {
		GPU: 0.35,
		CPU: 0.2,
		Motherboard: 0.12,
		RAM: 0.08,
		Storage: 0.08,
		PSU: 0.07,
		Case: 0.05,
		Cooler: 0.05,
	};

	return budget * (ratios[type] || 0.1);
}

/**
 * 🧠 Short prompt
 */
function buildSystemPrompt(catalog) {
	return `You are a PC build expert. Build a PC using ONLY the given catalog.

Rules:
- Pick exactly one from each category
- Stay within budget
- Ensure compatibility
- Use exact names/prices

Catalog:
${JSON.stringify(catalog)}

Return JSON:
{
  "buildName": "",
  "summary": "",
  "estimatedTotal": number,
  "selectedParts": {
    "CPU": {"name":"","brand":"","price":number,"reason":""},
    "GPU": {"name":"","brand":"","price":number,"reason":""},
    "RAM": {"name":"","brand":"","price":number,"reason":""},
    "Storage": {"name":"","brand":"","price":number,"reason":""},
    "Motherboard": {"name":"","brand":"","price":number,"reason":""},
    "PSU": {"name":"","brand":"","price":number,"reason":""},
    "Case": {"name":"","brand":"","price":number,"reason":""},
    "Cooler": {"name":"","brand":"","price":number,"reason":""}
  },
  "reasoning": [],
  "warnings": []
}`;
}

/**
 * 🎯 MAIN CONTROLLER
 */
export async function generateAIBuildMatch(req, res) {
	try {
		const {
			budget,
			useCase,
			targetResolution,
			preferredBrands = [],
			extraNotes = "",
		} = req.body;

		// ✅ Validation
		if (!budget || budget < 500) {
			return res.status(400).json({ error: "Budget must be >= $500" });
		}

		// 🚀 FILTERED catalog (KEY FIX)
		console.log("[AI] Fetching filtered catalog...");
		const catalog = await fetchFilteredCatalog(budget, useCase);

		// 🧠 Prompt
		const systemPrompt = buildSystemPrompt(catalog);

		const userMessage = `Build a PC:
Budget: $${budget}
Use Case: ${useCase}
Resolution: ${targetResolution}
Preferred: ${preferredBrands.join(", ") || "None"}
Notes: ${extraNotes || "None"}`;

		console.log("[AI] Calling OpenRouter...");

		const completion = await openai.chat.completions.create({
			model: "openai/gpt-4o-mini",
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userMessage },
			],
			response_format: { type: "json_object" },
			max_tokens: 1200,
		});

		const responseText = completion.choices[0].message.content;
		const buildData = JSON.parse(responseText);

		return res.status(200).json({
			success: true,
			data: buildData,
		});
	} catch (err) {
		console.error("[AI ERROR]", err);

		return res.status(500).json({
			error:
				err?.error?.metadata?.raw ||
				err.message ||
				"AI build generation failed",
		});
	}
}
