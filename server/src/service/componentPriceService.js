import Component from "../models/Component.js";
import { scrapeProductPrice } from "./firecrawlService.js";

const CACHE_DURATION_HOURS = 24;
const SEARCH_TIMEOUT_MS = 30000;

function isCacheExpired(lastUpdateDate) {
	if (!lastUpdateDate) return true;
	const now = new Date();
	const ageHours = (now - new Date(lastUpdateDate)) / (1000 * 60 * 60);
	return ageHours > CACHE_DURATION_HOURS;
}

function formatComponentResponse(component, cached = false) {
	return {
		_id: component._id,
		name: component.name,
		type: component.type,
		brand: component.brand,
		specs: component.specs,
		prices: component.prices || [],
		imageUrl: component.imageUrl,
		cached,
		lastPriceUpdate: component.lastPriceUpdate,
	};
}

/**
 * Search for a component in the database by name
 */
export async function findComponentByName(name) {
	if (!name || typeof name !== "string") {
		throw new Error("Component name is required");
	}

	const regex = new RegExp(name.trim(), "i");
	const component = await Component.findOne({
		$or: [{ name: regex }, { brand: regex }],
	}).lean();

	return component;
}

/**
 * Build search URLs for ryans.com and startech.com.bd
 */
function buildSearchUrls(componentName) {
	const encoded = encodeURIComponent(componentName.trim());
	return [
		`https://www.ryans.com/?s=${encoded}`,
		`https://www.startech.com.bd/?s=${encoded}`,
	];
}

/**
 * Scrape product prices from both sources
 * Returns array of {source, price, url, name}
 */
async function scrapeComponentPrices(componentName) {
	const searchUrls = buildSearchUrls(componentName);
	const results = [];
	const errors = [];

	// Try to scrape from both sources
	for (const url of searchUrls) {
		try {
			console.log(`[scrape] Attempting to scrape: ${url}`);
			const scrapedData = await scrapeProductPrice(url);
			results.push({
				source: scrapedData.source,
				price: scrapedData.price,
				url: scrapedData.url,
				name: scrapedData.name,
			});
		} catch (err) {
			// Log but don't fail - try other sources
			console.warn(`[scrape] Failed for ${url}:`, err.message);
			errors.push({
				source: new URL(url).hostname,
				error: err.message,
			});
		}
	}

	if (results.length === 0 && errors.length > 0) {
		throw new Error(
			`Could not scrape prices from any source: ${errors.map((e) => e.error).join("; ")}`,
		);
	}

	return results;
}

/**
 * Update component with scraped prices
 */
async function updateComponentPrices(component, scrapedData) {
	const now = new Date();

	// Ensure prices array exists
	if (!component.prices) {
		component.prices = [];
	}

	// Update each scraped price
	for (const scrape of scrapedData) {
		const existingIndex = component.prices.findIndex(
			(p) => p.source === scrape.source,
		);

		if (existingIndex !== -1) {
			// Update existing price entry
			component.prices[existingIndex].price = scrape.price;
			component.prices[existingIndex].url = scrape.url;
			component.prices[existingIndex].lastUpdated = now;
		} else {
			// Add new price entry
			component.prices.push({
				source: scrape.source,
				price: scrape.price,
				url: scrape.url,
				lastUpdated: now,
			});
		}
	}

	// Update overall lastPriceUpdate timestamp
	component.lastPriceUpdate = now;

	// Also update legacy price field with the lowest price
	if (component.prices.length > 0) {
		component.price = Math.min(...component.prices.map((p) => p.price));
	}

	return component;
}

/**
 * Get component price with smart caching
 * - If cache is fresh (< 24h), return cached data
 * - If cache is stale, auto-scrape and update
 * - If component doesn't exist, create it with scraped data
 */
export async function getComponentPrice(componentName) {
	if (!componentName || typeof componentName !== "string") {
		throw new Error("Component name is required");
	}

	// Try to find component in database
	let component = await Component.findOne({
		name: new RegExp(`^${componentName.trim()}$`, "i"),
	});

	// If component exists and cache is fresh, return it
	if (component && !isCacheExpired(component.lastPriceUpdate)) {
		console.log(`[cache-hit] Using cached data for "${componentName}"`);
		return {
			component: formatComponentResponse(component, true),
			message: "Data from cache (updated within 24 hours)",
		};
	}

	// Cache is stale or doesn't exist - scrape for fresh data
	console.log(`[scrape-trigger] Cache stale or missing for "${componentName}"`);

	try {
		const scrapedData = await scrapeComponentPrices(componentName);

		if (!component) {
			// Create new component
			const brand = (componentName.split(" ")[0] || "Unknown").trim();
			component = await Component.create({
				name: componentName.trim(),
				brand,
				type: "Storage", // Default type - user may override
				specs: {},
				prices: scrapedData.map((s) => ({
					source: s.source,
					price: s.price,
					url: s.url,
					lastUpdated: new Date(),
				})),
				lastPriceUpdate: new Date(),
				price: Math.min(...scrapedData.map((s) => s.price)),
			});

			console.log(`[new-component] Created component "${componentName}"`);
		} else {
			// Update existing component
			await updateComponentPrices(component, scrapedData);
			await component.save();
			console.log(`[updated] Component prices updated for "${componentName}"`);
		}

		return {
			component: formatComponentResponse(component, false),
			message: "Data freshly scraped from ryans.com and startech.com.bd",
		};
	} catch (error) {
		// If scraping failed but we have component with stale cache, return it anyway
		if (component && component.prices && component.prices.length > 0) {
			console.warn(
				`[scrape-failed] Returning stale cache for "${componentName}":`,
				error.message,
			);
			return {
				component: formatComponentResponse(component, true),
				message: "Data from cache (scraping failed, returning older data)",
				warning: error.message,
			};
		}

		// No data at all
		throw new Error(`Could not fetch component data: ${error.message}`);
	}
}

/**
 * Get multiple components by names (batch query)
 */
export async function getComponentsPrices(componentNames) {
	if (!Array.isArray(componentNames) || componentNames.length === 0) {
		throw new Error("Component names array is required");
	}

	const results = [];
	const errors = [];

	for (const name of componentNames) {
		try {
			const result = await getComponentPrice(name);
			results.push(result);
		} catch (err) {
			errors.push({ name, error: err.message });
		}
	}

	return {
		components: results,
		errors: errors.length > 0 ? errors : undefined,
		summary: {
			total: componentNames.length,
			successful: results.length,
			failed: errors.length,
		},
	};
}
