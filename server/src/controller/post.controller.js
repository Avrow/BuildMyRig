import BuildPost from "../models/buildPost.js";

export async function createBuildPost(req, res) {
	const { imageUrl, caption, cpu, gpu, ram } = req.body;

	if (!imageUrl || !caption || !cpu || !gpu || !ram) {
		return res
			.status(400)
			.json({ error: "All fields including an image are required." });
	}

	try {
		const post = await BuildPost.create({ imageUrl, caption, cpu, gpu, ram });

		res.status(201).json({ success: true, id: post._id.toString() });
	} catch (err) {
		console.error("[createBuildPost]", err);
		return res.status(500).json({ error: "Failed to save your build. Please try again." });
	}
}
