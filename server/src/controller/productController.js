import Product from "../models/Product.js";
import { scrapeProductPrice } from "../service/firecrawlService.js";

function isValidHttpUrl(rawUrl) {
	try {
		const parsed = new URL(rawUrl);
		return parsed.protocol === "http:" || parsed.protocol === "https:";
	} catch {
		return false;
	}
}

function escapeRegex(text) {
	return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getAllProducts(req, res, next) {
	try {
		const products = await Product.find({}).sort({ updatedAt: -1 }).lean();
		res.status(200).json({ products });
	} catch (error) {
		next(error);
	}
}

export async function scrapeAndStoreProduct(req, res, next) {
	try {
		const { url } = req.body;

		if (!url || typeof url !== "string" || !isValidHttpUrl(url)) {
			return res
				.status(400)
				.json({ error: "Please provide a valid product URL" });
		}

		const scrapedProduct = await scrapeProductPrice(url);
		const now = new Date();

		const existingProduct = await Product.findOne({
			name: {
				$regex: new RegExp(`^${escapeRegex(scrapedProduct.name)}$`, "i"),
			},
		});

		if (!existingProduct) {
			const newProduct = await Product.create({
				name: scrapedProduct.name,
				prices: [
					{
						source: scrapedProduct.source,
						price: scrapedProduct.price,
						url: scrapedProduct.url,
						lastUpdated: now,
					},
				],
			});

			return res.status(201).json({
				message: "Product scraped and saved",
				product: newProduct,
			});
		}

		const priceIndex = existingProduct.prices.findIndex(
			(item) => item.source === scrapedProduct.source,
		);

		if (priceIndex === -1) {
			existingProduct.prices.push({
				source: scrapedProduct.source,
				price: scrapedProduct.price,
				url: scrapedProduct.url,
				lastUpdated: now,
			});
		} else {
			existingProduct.prices[priceIndex].price = scrapedProduct.price;
			existingProduct.prices[priceIndex].url = scrapedProduct.url;
			existingProduct.prices[priceIndex].lastUpdated = now;
		}

		await existingProduct.save();

		return res.status(200).json({
			message: "Product price updated",
			product: existingProduct,
		});
	} catch (error) {
		if (error.message.includes("Only ryans.com and startech.com.bd")) {
			return res.status(400).json({ error: error.message });
		}

		if (
			error.message.includes("Could not find BDT price") ||
			error.message.includes("Could not extract product name")
		) {
			return res.status(422).json({ error: error.message });
		}

		next(error);
	}
}
