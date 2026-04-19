"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/mongooseClient";
import BuildPost from "@/models/buildPost";

/**
 * Persists a new PC build post to MongoDB.
 *
 * @param {{ imageUrl: string, caption: string, cpu: string, gpu: string, ram: string }} data
 * @returns {{ success: true, id: string } | { error: string }}
 */
export async function createBuildPost({ imageUrl, caption, cpu, gpu, ram }) {
	// Validate required fields on the server to prevent bad data.
	if (!imageUrl || !caption || !cpu || !gpu || !ram) {
		return { error: "All fields including an image are required." };
	}

	try {
		await connectDB();
		const post = await BuildPost.create({ imageUrl, caption, cpu, gpu, ram });

		// Invalidate the community page cache so the new post shows up instantly.
		revalidatePath("/community");

		return { success: true, id: post._id.toString() };
	} catch (err) {
		console.error("[createBuildPost]", err);
		return { error: "Failed to save your build. Please try again." };
	}
}
