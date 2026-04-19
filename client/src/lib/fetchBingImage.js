/**
 * Server-only utility – never import this in a Client Component.
 *
 * Calls the Serper Google Images API and returns the top image URL,
 * or null if nothing was found.
 */
export async function fetchSerperImage(query) {
	const apiKey = process.env.SERPER_API_KEY;
	if (!apiKey) {
		throw new Error("SERPER_API_KEY is not defined. Add it to .env.local.");
	}

	const res = await fetch("https://google.serper.dev/images", {
		method: "POST",
		headers: {
			"X-API-KEY": apiKey,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ q: query, num: 3 }),
		// Cache at the CDN level for 24 h to save API quota
		next: { revalidate: 60 * 60 * 24 },
	});

	if (!res.ok) {
		throw new Error(
			`Serper API responded with ${res.status} ${res.statusText}`,
		);
	}

	const data = await res.json();

	// Return the first available imageUrl
	const url = data.images?.find((img) => img.imageUrl)?.imageUrl ?? null;
	return url;
}
