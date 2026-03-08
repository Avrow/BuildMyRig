import { NextResponse } from "next/server";
import { fetchBingImage } from "@/lib/fetchBingImage";

/**
 * GET /api/bing-image?q=AMD+Ryzen+7+7800X3D+box
 *
 * Proxy route that keeps the Bing API key on the server.
 * Returns: { url: string }
 */
export async function GET(request) {
	const { searchParams } = new URL(request.url);
	const q = searchParams.get("q")?.trim();

	if (!q) {
		return NextResponse.json(
			{ error: "Missing required query parameter 'q'" },
			{ status: 400 },
		);
	}

	try {
		const url = await fetchBingImage(q);

		if (!url) {
			return NextResponse.json(
				{ error: "No image found for this query" },
				{ status: 404 },
			);
		}

		return NextResponse.json({ url });
	} catch (err) {
		console.error("[/api/bing-image]", err.message);
		return NextResponse.json({ error: "Image search failed" }, { status: 500 });
	}
}
