import Component from "../models/Component.js";

/**
 * GET /api/components
 * Query params: search, type, brand, page (default 1), limit (default 24)
 */
export async function getComponents(req, res) {
	try {
		const { search, type, brand, page = 1, limit = 24 } = req.query;

		const filter = {};
		if (type) filter.type = type.toUpperCase();
		if (brand) filter.brand = { $regex: brand, $options: "i" };
		if (search) filter.$text = { $search: search };

		const skip = (parseInt(page) - 1) * parseInt(limit);

		const sortStage = search
			? { score: { $meta: "textScore" } }
			: { createdAt: -1 };

		const [components, total] = await Promise.all([
			Component.find(filter)
				.sort(sortStage)
				.skip(skip)
				.limit(parseInt(limit))
				.lean(),
			Component.countDocuments(filter),
		]);

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
 * Persists the image URL once it has been fetched from Bing.
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
