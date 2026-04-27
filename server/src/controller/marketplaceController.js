import MarketplaceItem from "../models/MarketplaceItem.js";
import { checkImageSafety } from "../utils/picPurify.js";

export async function createMarketplacePost(req, res) {
	try {
		if (!req.body.image) {
			return res.status(400).json({
				success: false,
				error: "Image is required",
			});
		}
		console.log("first");

		// Moderation
		const moderation = await checkImageSafety(req.body.image, true);

		if (!moderation.isSafe && !moderation.message.includes("Network")) {
			return res.status(400).json({
				success: false,
				violation: true,
				error: moderation.message,
			});
		}

		// Safe field extraction
		const {
			type,
			image,
			title,
			price,
			location,
			sellerName,
			phone,
			description,
		} = req.body;

		const newItem = await MarketplaceItem.create({
			title,
			price,
			description,
			imageUrl: image,
			type,
			location,
			sellerName,
			phone,
		});

		res.status(201).json({ success: true, data: newItem });
	} catch (error) {
		console.error("Create Marketplace Error:", error);
		res.status(500).json({ success: false, error: "Server Error" });
	}
}
export async function getAllMarketplaceItems(req, res) {
    try {
        const items = await MarketplaceItem.find().sort({ createdAt: -1 });
		console.log("Fetched Items:", items);
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch" });
    }
}