import OpenAI from "openai";
import Component from "../models/Component.js";
import dotenv from "dotenv";
dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY) {
	console.error(
		"[AI Build Matcher] ERROR: OPENROUTER_API_KEY is not set in environment variables",
	);
	throw new Error("AI service API key is not configured");
}

const openai = new OpenAI({
	apiKey: OPENROUTER_API_KEY,
	baseURL: "https://openrouter.ai/api/v1",
	defaultHeaders: {
		"HTTP-Referer": process.env.APP_URL || "http://localhost:8000",
		"X-Title": "BuildMyRig AI Build Matcher",
	},
});

/**
 * Fetch all components from MongoDB and group by type
 */
async function fetchComponentCatalog() {
	try {
		const catalog = {};

		// Define all component types
		const types = [
			"CPU",
			"GPU",
			"RAM",
			"Storage",
			"Motherboard",
			"PSU",
			"Case",
			"Cooler",
		];

		for (const type of types) {
			const components = await Component.find({ type }).lean();
			catalog[type] = components.map((c) => ({
				name: c.name,
				brand: c.brand,
				price: c.price,
				specs: c.specs,
			}));
		}

		return catalog;
	} catch (err) {
		console.error("[fetchComponentCatalog] Error:", err);
		throw new Error("Failed to fetch component catalog");
	}
}

/**
 * Build the system prompt that instructs the AI to select only from the provided catalog
 */
function buildSystemPrompt(catalog) {
	const catalogJson = JSON.stringify(catalog, null, 2);

	return `You are an expert PC build advisor for BuildMyRig. Your task is to create a complete PC build recommendation using ONLY the components from the provided catalog. You must NEVER suggest components outside this catalog.

CRITICAL RULES:
1. You MUST select exactly ONE component from each category: CPU, GPU, RAM, Storage, Motherboard, PSU, Case, Cooler
2. Selected components must be EXACTLY as listed in the catalog (match name, brand, price exactly)
3. The total build cost must NOT exceed the user's budget
4. All selected components must be compatible (same socket CPU/Motherboard, proper PSU wattage, case size, etc.)
5. The build must meet the target performance level based on use case and resolution
6. Consider the user's preferred brands if possible, but only if compatible
7. Always aim for the best value within the budget constraint

PROVIDED COMPONENT CATALOG (ONLY use components from here):
${catalogJson}

Respond with ONLY a valid JSON object in this exact format:
{
  "buildName": "A catchy name for this build (e.g., '1440p Gaming Beast')",
  "summary": "2-3 sentence overview of the build philosophy and target use case",
  "estimatedTotal": <total cost as number>,
  "selectedParts": {
    "CPU": {"name": "Component name", "brand": "Brand", "price": number, "reason": "Why this was chosen"},
    "GPU": {"name": "Component name", "brand": "Brand", "price": number, "reason": "Why this was chosen"},
    "RAM": {"name": "Component name", "brand": "Brand", "price": number, "reason": "Why this was chosen"},
    "Storage": {"name": "Component name", "brand": "Brand", "price": number, "reason": "Why this was chosen"},
    "Motherboard": {"name": "Component name", "brand": "Brand", "price": number, "reason": "Why this was chosen"},
    "PSU": {"name": "Component name", "brand": "Brand", "price": number, "reason": "Why this was chosen"},
    "Case": {"name": "Component name", "brand": "Brand", "price": number, "reason": "Why this was chosen"},
    "Cooler": {"name": "Component name", "brand": "Brand", "price": number, "reason": "Why this was chosen"}
  },
  "reasoning": ["Key decision 1", "Key decision 2", "Key decision 3"],
  "warnings": ["Any compatibility or consideration note (or empty if none)"]
}`;
}

/**
 * POST /api/ai-build-matcher
 * Request body:
 * {
 *   budget: number,
 *   useCase: "gaming" | "productivity" | "streaming" | "video-editing" | "general-use",
 *   targetResolution: "1080p" | "1440p" | "4K",
 *   preferredBrands: string[] (optional),
 *   extraNotes: string (optional)
 * }
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

		// Validation
		if (!budget || budget < 500) {
			return res.status(400).json({ error: "Budget must be at least $500" });
		}

		if (
			!useCase ||
			![
				"gaming",
				"productivity",
				"streaming",
				"video-editing",
				"general-use",
			].includes(useCase)
		) {
			return res.status(400).json({ error: "Invalid use case" });
		}

		if (
			!targetResolution ||
			!["1080p", "1440p", "4K"].includes(targetResolution)
		) {
			return res.status(400).json({ error: "Invalid target resolution" });
		}

		// Fetch component catalog
		console.log("[AI Build Matcher] Fetching component catalog...");
		const catalog = await fetchComponentCatalog();

		// Build the prompt
		const systemPrompt = buildSystemPrompt(catalog);

		const userMessage = `Please create a PC build with these specifications:
- Budget: $${budget}
- Use Case: ${useCase}
- Target Resolution: ${targetResolution}
${preferredBrands.length > 0 ? `- Preferred Brands: ${preferredBrands.join(", ")}` : ""}
${extraNotes ? `- Additional Notes: ${extraNotes}` : ""}

Remember: Select ONLY from the provided catalog. The build must not exceed the budget and all components must be compatible.`;

		// Call OpenRouter via OpenAI SDK
		console.log("[AI Build Matcher] Calling OpenRouter API...");
		// await openai.chat.completions.create({
		// const message = await openai.messages.create({
		// console.log(userMessage);
		const completion = await openai.chat.completions.create({
			model: "openai/gpt-4o-mini",
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userMessage },
			],
			response_format: { type: "json_object" }, // Forces JSON output
			max_tokens: 2000,
		});

		// 3. Extract content correctly from choices
		const responseText = completion.choices[0].message.content;

		// 4. Directly parse (no need for regex match if using json_object mode)
		const buildData = JSON.parse(responseText);

		// Validate response structure
		// if (
		// 	!buildData.buildName ||
		// 	!buildData.summary ||
		// 	!buildData.selectedParts ||
		// 	typeof buildData.estimatedTotal !== "number"
		// ) {
		// 	throw new Error("AI response missing required fields");
		// }

		// // Ensure all required parts exist
		// const requiredParts = [
		// 	"CPU",
		// 	"GPU",
		// 	"RAM",
		// 	"Storage",
		// 	"Motherboard",
		// 	"PSU",
		// 	"Case",
		// 	"Cooler",
		// ];
		// for (const part of requiredParts) {
		// 	if (!buildData.selectedParts[part]) {
		// 		throw new Error(`Missing ${part} in AI response`);
		// 	}
		// }

		return res.status(200).json({
			success: true,
			data: buildData,
		});
	} catch (err) {
		console.error("[generateAIBuildMatch] Error:", err);

		if (err.message.includes("401") || err.status === 401) {
			return res.status(500).json({
				error:
					"AI service authentication failed. Please check API key configuration.",
			});
		}

		if (err.message.includes("parse")) {
			return res.status(500).json({
				error: "Failed to parse AI response. Please try again.",
			});
		}

		return res.status(500).json({
			error:
				err.message || "Failed to generate AI build match. Please try again.",
		});
	}
}
