/**
 * Server-only utility – never import this in a Client Component.
 *
 * Calls the Bing Image Search API v7 and returns the top image URL,
 * or null if nothing was found.
 */
export async function fetchBingImage(query) {
	const apiKey = process.env.BING_SEARCH_API_KEY;
	if (!apiKey) {
		throw new Error(
			"BING_SEARCH_API_KEY is not defined. Add it to .env.local.",
		);
	}

	const params = new URLSearchParams({
		q: query,
		count: "3", // request 3 results so we can fall back if the first is broken
		imageType: "Photo",
		safeSearch: "Moderate",
	});

	const res = await fetch(
		`https://api.bing.microsoft.com/v7.0/images/search?${params}`,
		{
			headers: { "Ocp-Apim-Subscription-Key": apiKey },
			// Cache at the CDN level for 24 h to save API quota
			next: { revalidate: 60 * 60 * 24 },
		},
	);

	if (!res.ok) {
		throw new Error(`Bing API responded with ${res.status} ${res.statusText}`);
	}

	const data = await res.json();

	// Return the first available contentUrl
	const url = data.value?.find((img) => img.contentUrl)?.contentUrl ?? null;
	return url;
}
