import Firecrawl from "@mendable/firecrawl-js";
import { chromium } from "playwright";

function getFirecrawlApiKey() {
	return process.env.FIRECRAWL_API_KEY || process.env.FIRECRAWLER_API_KEY;
}

function makeFirecrawlClient() {
	return new Firecrawl({
		apiKey: getFirecrawlApiKey(),
	});
}

function isSearchUrl(inputUrl) {
	const url = new URL(inputUrl);
	if (url.searchParams.has("s")) return true;
	if (url.searchParams.has("search")) return true;
	return url.pathname.toLowerCase().includes("search");
}

function normalizeQuery(text) {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function scoreMatch(label, query) {
	if (!label || !query) return 0;
	const labelTokens = new Set(normalizeQuery(label).split(" "));
	const queryTokens = normalizeQuery(query).split(" ");
	let score = 0;
	for (const token of queryTokens) {
		if (labelTokens.has(token)) score += 1;
	}
	return score;
}

function extractBestProductLink(markdownText, hostname, query) {
	const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
	let match;
	let best = null;
	let bestScore = -1;

	while ((match = linkRegex.exec(markdownText)) !== null) {
		const label = match[1];
		const href = match[2];
		try {
			const url = new URL(href);
			if (!url.hostname.includes(hostname)) continue;
			if (isSearchUrl(url.toString())) continue;
			const score = scoreMatch(label, query);
			if (score > bestScore) {
				bestScore = score;
				best = url.toString();
			}
		} catch {
			// ignore invalid URLs
		}
	}

	return best;
}

function getSourceFromUrl(inputUrl) {
	const hostname = new URL(inputUrl).hostname.toLowerCase();

	if (hostname.includes("ryans.com")) {
		return "ryans";
	}

	if (hostname.includes("startech.com.bd")) {
		return "startech";
	}

	throw new Error("Only ryans.com and startech.com.bd URLs are supported");
}

function pickNameFromMarkdown(markdownText) {
	const firstHeadingMatch = markdownText.match(/^#\s+(.+)$/m);
	if (!firstHeadingMatch) {
		throw new Error("Could not extract product name from scraped page");
	}

	return firstHeadingMatch[1].trim();
}

function pickPriceFromMarkdown(markdownText) {
	// Matches examples like: ৳ 12,345 or ৳12,345
	const priceMatch = markdownText.match(/৳\s*([\d,]+)/);
	if (!priceMatch) {
		throw new Error("Could not find BDT price in scraped page");
	}

	const priceNumber = Number(priceMatch[1].replaceAll(",", ""));
	if (Number.isNaN(priceNumber)) {
		throw new Error("Price value was found but could not be parsed");
	}

	return priceNumber;
}

function pickPriceFromText(text) {
	const priceMatch = text.match(/৳\s*([\d,]+)/);
	if (!priceMatch) {
		throw new Error("Could not find BDT price in scraped page");
	}

	const priceNumber = Number(priceMatch[1].replaceAll(",", ""));
	if (Number.isNaN(priceNumber)) {
		throw new Error("Price value was found but could not be parsed");
	}

	return priceNumber;
}

async function scrapeMarkdown(productUrl) {
	const firecrawl = makeFirecrawlClient();
	const scrapedDoc = await firecrawl.scrapeUrl(productUrl, {
		formats: ["markdown"],
	});

	const markdownText = scrapedDoc?.markdown || scrapedDoc?.data?.markdown;
	if (!markdownText || typeof markdownText !== "string") {
		throw new Error("Firecrawl returned empty content");
	}

	return markdownText;
}

async function scrapeProductPriceInternal(productUrl, depth) {
	if (depth > 2) {
		throw new Error("Too many redirects while resolving product URL");
	}

	const source = getSourceFromUrl(productUrl);
	const markdownText = await scrapeMarkdown(productUrl);

	if (isSearchUrl(productUrl)) {
		const urlObj = new URL(productUrl);
		const query =
			urlObj.searchParams.get("s") || urlObj.searchParams.get("search") || "";
		const productUrlFromSearch = extractBestProductLink(
			markdownText,
			urlObj.hostname,
			query,
		);
		if (!productUrlFromSearch) {
			throw new Error("No product link found on search page");
		}
		return scrapeProductPriceInternal(productUrlFromSearch, depth + 1);
	}

	const name = pickNameFromMarkdown(markdownText);
	const price = pickPriceFromMarkdown(markdownText);

	return {
		name,
		price,
		source,
		url: productUrl,
	};
}

async function scrapeProductPriceWithPlaywright(productUrl, depth) {
	if (depth > 2) {
		throw new Error("Too many redirects while resolving product URL");
	}

	const source = getSourceFromUrl(productUrl);
	const browser = await chromium.launch({ headless: true });
	const page = await browser.newPage();

	try {
		await page.goto(productUrl, {
			waitUntil: "domcontentloaded",
			timeout: 45000,
		});

		if (isSearchUrl(productUrl)) {
			const urlObj = new URL(productUrl);
			const query =
				urlObj.searchParams.get("s") || urlObj.searchParams.get("search") || "";
			const links = await page.$$eval("a[href]", (anchors) =>
				anchors.map((a) => ({
					href: a.href,
					text: (a.textContent || "").trim(),
				})),
			);
			const candidates = links.filter((link) => {
				try {
					const url = new URL(link.href);
					if (!url.hostname.includes(urlObj.hostname)) return false;
					if (isSearchUrl(url.toString())) return false;
					return true;
				} catch {
					return false;
				}
			});

			let best = null;
			let bestScore = -1;
			for (const candidate of candidates) {
				const score = scoreMatch(candidate.text, query);
				if (score > bestScore) {
					bestScore = score;
					best = candidate.href;
				}
			}

			if (!best) {
				throw new Error("No product link found on search page");
			}

			return await scrapeProductPriceWithPlaywright(best, depth + 1);
		}

		let name = "";
		try {
			name = await page.$eval("h1", (el) => (el.textContent || "").trim());
		} catch {
			name = (await page.title())?.trim() || "";
		}

		if (!name) {
			throw new Error("Could not extract product name from scraped page");
		}

		const bodyText = await page.evaluate(() => document.body?.innerText || "");
		const price = pickPriceFromText(bodyText);

		return {
			name,
			price,
			source,
			url: productUrl,
		};
	} finally {
		await page.close();
		await browser.close();
	}
}

export async function scrapeProductPrice(productUrl) {
	if (!getFirecrawlApiKey()) {
		throw new Error("FIRECRAWL_API_KEY is missing in environment variables");
	}

	try {
		return await scrapeProductPriceInternal(productUrl, 0);
	} catch (error) {
		return scrapeProductPriceWithPlaywright(productUrl, 0);
	}
}
