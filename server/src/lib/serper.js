/**
 * Server-side Serper Google Images utility.
 *
 * Calls the Serper API and returns the first valid imageUrl found,
 * or null if nothing was found / API key is missing.
 */
export async function fetchSerperImage(query) {
	const apiKey = process.env.SERPER_API_KEY;
	if (!apiKey) {
		console.warn("[serper] SERPER_API_KEY not defined – skipping image fetch");
		return null;
	}

	try {
		const res = await fetch("https://google.serper.dev/images", {
			method: "POST",
			headers: {
				"X-API-KEY": apiKey,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ q: query, num: 3 }),
		});

		if (!res.ok) {
			console.warn(`[serper] API responded ${res.status} for query: ${query}`);
			return null;
		}

		const data = await res.json();
		return data.images?.find((img) => img.imageUrl)?.imageUrl ?? null;
	} catch (err) {
		console.error("[serper] fetch error:", err.message);
		return null;
	}
}
