import BuildPost from "../models/buildPost.js";
import Review from "../models/review.js";
import { checkImageSafety } from "../utils/picPurify.js";

function normalizeReview(review) {
	return {
		...review,
		_id: review._id.toString(),
		buildId: review.buildId.toString(),
		userId: review.userId.toString(),
		createdAt: review.createdAt
			? review.createdAt.toISOString()
			: new Date().toISOString(),
		replies: (review.replies || []).map((reply) => ({
			...reply,
			_id: reply._id?.toString(),
			userId: reply.userId?.toString(),
			createdAt: reply.createdAt?.toISOString(),
		})),
	};
}

function getAverageRating(reviews) {
	if (!reviews.length) return "0.0";
	const avg =
		reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length;
	return avg.toFixed(1);
}

// given a post ID, fetch the post details along with its reviews, average rating, and review count
export async function getPostById(req, res) {
	try {
		const post = await BuildPost.findById(req.params.id).populate(
			"author",
			"name _id",
		);
		if (!post) {
			return res.status(404).json({ success: false, error: "Build Not Found" });
		}
		res.status(200).json({ success: true, data: post });
	} catch (err) {
		res.status(500).json({ success: false, error: "Server Error" });
	}
}

// all build posts fetching with average rating and review count
export async function getAllBuildPosts(req, res) {
	try {
		const posts = await BuildPost.find({})
			.populate("author", "name _id")
			.sort({ createdAt: -1 })
			.lean();

		const payload = await Promise.all(
			posts.map(async (post) => {
				const reviewsRaw = await Review.find({ buildId: post._id }).lean();
				const reviews = reviewsRaw.map(normalizeReview);

				return {
					id: post._id.toString(),
					authorId: post.author?._id?.toString(),
					authorName: post.author?.name || "Anonymous",
					imageUrl: post.imageUrl,
					caption: post.caption,
					description: post.description,
					cpu: post.cpu,
					gpu: post.gpu,
					ram: post.ram,
					avgRating: getAverageRating(reviews),
					commentCount: reviews.length,
					reviews,
					createdAt: post.createdAt
						? post.createdAt.toISOString()
						: new Date().toISOString(),
				};
			}),
		);

		res.json({ success: true, data: payload });
	} catch (err) {
		res
			.status(500)
			.json({ success: false, error: "Failed to load posts from database." });
	}
}

// new build post creation with 1500-word limit and AI Safe Search
export async function createBuildPost(req, res) {
	const { author, imageUrl, caption, cpu, gpu, ram, description } = req.body;

	// ১. সব ফিল্ড আছে কি না চেক
	if (
		!author ||
		!imageUrl ||
		!caption ||
		!cpu ||
		!gpu ||
		!ram ||
		!description
	) {
		return res
			.status(400)
			.json({ success: false, error: "All fields are required!" });
	}

	// ২. ওয়ার্ড কাউন্ট ভ্যালিডেশন
	const wordCount = description.trim().split(/\s+/).filter(Boolean).length;
	if (wordCount > 1500) {
		return res.status(400).json({
			success: false,
			error: `Description too long! Max 1500 words. (Current: ${wordCount})`,
		});
	}

	try {
		// ৩. **FEATURE 3: PicPurify Safe Search Check**
		// পোস্ট সেভ করার আগেই ইমেজটি স্ক্যান করা হচ্ছে
		const moderation = await checkImageSafety(imageUrl);

		if (!moderation.isSafe) {
			return res.status(400).json({
				success: false,
				violation: true, // ফ্রন্টএন্ডে লাল ক্রস দেখানোর জন্য এই ফ্ল্যাগটি দরকার
				error: moderation.message,
			});
		}

		// ৪. যদি নিরাপদ হয়, তবেই ডাটাবেসে সেভ হবে
		const post = await BuildPost.create({
			author,
			imageUrl,
			caption,
			cpu,
			gpu,
			ram,
			description,
		});
		res.status(201).json({ success: true, id: post._id.toString() });
	} catch (err) {
		console.error(err);
		res.status(500).json({ success: false, error: "Failed to save build." });
	}
}

export async function updateBuildPost(req, res) {
	const { id } = req.params;
	const { userId, imageUrl, caption, cpu, gpu, ram, description } =
		req.body || {};

	if (!userId) {
		return res
			.status(400)
			.json({ success: false, error: "User ID is required." });
	}

	if (description) {
		const wordCount = description.trim().split(/\s+/).filter(Boolean).length;
		if (wordCount > 1500) {
			return res.status(400).json({
				success: false,
				error: `Description too long! Max 1500 words. (Current: ${wordCount})`,
			});
		}
	}

	try {
		if (imageUrl) {
			const moderation = await checkImageSafety(imageUrl);
			if (!moderation.isSafe) {
				return res.status(400).json({
					success: false,
					violation: true,
					error: moderation.message,
				});
			}
		}

		const post = await BuildPost.findById(id);
		if (!post)
			return res.status(404).json({ success: false, error: "Post not found" });

		if (post.author.toString() !== String(userId)) {
			return res
				.status(403)
				.json({ success: false, error: "Unauthorized access." });
		}

		const updated = await BuildPost.findByIdAndUpdate(
			id,
			{ imageUrl, caption, cpu, gpu, ram, description },
			{ new: true },
		);

		return res.status(200).json({ success: true, data: updated });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ success: false, error: "Update failed." });
	}
}

export async function deleteBuildPost(req, res) {
	const { id } = req.params;
	const { userId } = req.body || {};

	if (!userId) {
		return res
			.status(400)
			.json({ success: false, error: "User ID is required." });
	}

	try {
		const post = await BuildPost.findById(id);
		if (!post)
			return res.status(404).json({ success: false, error: "Post not found" });

		if (post.author.toString() !== String(userId)) {
			return res.status(403).json({
				success: false,
				error: "Unauthorized! You can only delete your own posts.",
			});
		}

		await BuildPost.findByIdAndDelete(id);
		return res.status(200).json({ success: true });
	} catch (err) {
		console.error(err);
		return res
			.status(500)
			.json({ success: false, error: "Failed to delete post." });
	}
}
