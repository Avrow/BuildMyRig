import Firecrawl from "@mendable/firecrawl-js";

function getFirecrawlApiKey() {
	return process.env.FIRECRAWL_API_KEY || process.env.FIRECRAWLER_API_KEY;
}

function makeFirecrawlClient() {
	return new Firecrawl({
		apiKey: getFirecrawlApiKey(),
	});
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

export async function scrapeProductPrice(productUrl) {
	if (!getFirecrawlApiKey()) {
		throw new Error("FIRECRAWL_API_KEY is missing in environment variables");
	}

	const source = getSourceFromUrl(productUrl);
	const firecrawl = makeFirecrawlClient();
	const scrapedDoc = await firecrawl.scrapeUrl(productUrl, {
		formats: ["markdown"],
	});

	const markdownText = scrapedDoc?.markdown || scrapedDoc?.data?.markdown;
	if (!markdownText || typeof markdownText !== "string") {
		throw new Error("Firecrawl returned empty content");
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
