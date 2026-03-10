import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import Component from "../models/Component.js";
import { fetchSerperImage } from "../lib/serper.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "../../pc-part-dataset-main/data/csv/json");

// Maps Component.type → JSON filename
const TYPE_TO_FILE = {
	CPU: "cpu.json",
	GPU: "video-card.json",
	RAM: "memory.json",
	Storage: "internal-hard-drive.json",
	Motherboard: "motherboard.json",
	PSU: "power-supply.json",
	Case: "case.json",
	Cooler: "cpu-cooler.json",
};

function extractBrand(name) {
	return (name ?? "").split(" ")[0] || "Unknown";
}

/**
 * Read raw items from a JSON file and shape them like DB documents so the
 * client gets a consistent response shape when the DB has no data yet.
 */
function readFromJSON(type) {
	const file = TYPE_TO_FILE[type];
	if (!file) return [];
	try {
		const raw = JSON.parse(readFileSync(resolve(DATA_DIR, file), "utf-8"));
		return raw
			.filter((item) => item.name)
			.map((item) => ({
				_id: null,
				name: item.name,
				brand: extractBrand(item.name),
				type,
				price: typeof item.price === "number" ? item.price : null,
				imageUrl: null,
				specs: item,
				source: "json",
			}));
	} catch {
		return [];
	}
}

/**
 * Fire-and-forget: fetch a Serper image for a component and persist it to DB.
 * Called in the background – never awaited in the request path.
 */
async function backfillImage(component) {
	try {
		const query = `${component.name} ${component.type} pc part`;
		const url = await fetchSerperImage(query);
		if (url) {
			await Component.findByIdAndUpdate(component._id, { imageUrl: url });
			console.log(`[image] saved for "${component.name}"`);
		}
	} catch (err) {
		console.error(`[image] backfill failed for ${component._id}:`, err.message);
	}
}

/**
 * GET /api/components
 * Query params: search, type, brand, page (default 1), limit (default 24)
 */
export async function getComponents(req, res) {
	try {
		const { search, type, brand, page = 1, limit = 24 } = req.query;

		const filter = {};
		if (type) filter.type = { $regex: new RegExp(`^${type}$`, "i") };
		if (brand) filter.brand = { $regex: brand, $options: "i" };
		if (search) {
			filter.$or = [
				{ name: { $regex: search, $options: "i" } },
				{ brand: { $regex: search, $options: "i" } },
			];
		}

		const skip = (parseInt(page) - 1) * parseInt(limit);

		const [components, total] = await Promise.all([
			Component.find(filter)
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(parseInt(limit))
				.lean(),
			Component.countDocuments(filter),
		]);

		// ── Fallback: DB empty for this type → serve straight from JSON ──────
		if (total === 0 && type && TYPE_TO_FILE[type]) {
			let jsonItems = readFromJSON(type);

			if (brand) {
				const rx = new RegExp(brand, "i");
				jsonItems = jsonItems.filter((i) => rx.test(i.brand));
			}
			if (search) {
				const rx = new RegExp(search, "i");
				jsonItems = jsonItems.filter(
					(i) => rx.test(i.name) || rx.test(i.brand),
				);
			}

			const jsonTotal = jsonItems.length;
			const paged = jsonItems.slice(skip, skip + parseInt(limit));

			return res.json({
				components: paged,
				pagination: {
					total: jsonTotal,
					page: parseInt(page),
					limit: parseInt(limit),
					pages: Math.ceil(jsonTotal / parseInt(limit)),
				},
				source: "json",
			});
		}

		// ── Background: fetch Serper images for components that lack one ─────
		// Cap at 5 per request to avoid hammering the API quota.
		const missing = components.filter((c) => !c.imageUrl).slice(0, 5);
		if (missing.length > 0) {
			Promise.allSettled(missing.map(backfillImage));
		}

		res.json({
			components,
			pagination: {
				total,
				page: parseInt(page),
				limit: parseInt(limit),
				pages: Math.ceil(total / parseInt(limit)),
			},
		});
	} catch (err) {
		console.error("[getComponents]", err);
		res.status(500).json({ error: "Failed to fetch components" });
	}
}

/**
 * PUT /api/components/:id/image
 * Body: { imageUrl: string }
 * Persists the image URL once it has been fetched from Serper.
 */
export async function updateComponentImage(req, res) {
	try {
		const { id } = req.params;
		const { imageUrl } = req.body;

		if (!imageUrl || typeof imageUrl !== "string") {
			return res
				.status(400)
				.json({ error: "A valid imageUrl string is required" });
		}

		// Basic URL validation before persisting
		try {
			new URL(imageUrl);
		} catch {
			return res.status(400).json({ error: "imageUrl must be a valid URL" });
		}

		const component = await Component.findByIdAndUpdate(
			id,
			{ imageUrl },
			{ new: true, runValidators: true },
		).lean();

		if (!component) {
			return res.status(404).json({ error: "Component not found" });
		}

		res.json({ success: true, component });
	} catch (err) {
		console.error("[updateComponentImage]", err);
		res.status(500).json({ error: "Failed to update image URL" });
	}
}
