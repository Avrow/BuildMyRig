import Review from "../models/review.js";
// creating review with basic validation (e.g. rating range, required fields) for better data integrity
export const createReview = async (req, res) => {
	try {
		const { buildId, userId, userName, rating, comment } = req.body;
		if (!buildId || !userId || !userName || !rating || !comment) {
			return res.status(400).json({
				success: false,
				error: "All fields are required",
			});
		}
		const newReview = new Review({
			buildId,
			userId,
			userName,
			rating,
			comment,
			reactions: { love: [], haha: [], sad: [] },
			replies: [],
		});
		await newReview.save();
		res.status(201).json({ success: true, data: newReview });
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
};

// build review fetching with sorting by newest first for better UX
export const getReviewsByPost = async (req, res) => {
	try {
		const { buildId } = req.params;
		const reviews = await Review.find({ buildId }).sort({ createdAt: -1 });
		res.status(200).json({ success: true, data: reviews });
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
};

export const createReply = async (req, res) => {
	try {
		const { reviewId } = req.params;
		const { userId, userName, text } = req.body;
		if (!userId || !userName || !text) {
			return res.status(400).json({
				success: false,
				error: "All fields are required",
			});
		}

		const review = await Review.findById(reviewId);
		if (!review)
			return res
				.status(404)
				.json({ success: false, error: "Review not found" });

		review.replies.push({
			userId,
			userName,
			text,
			createdAt: new Date(),
		});

		await review.save();
		return res.status(201).json({ success: true, data: review });
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};

// reaction toggling handled in separate route for cleaner code and better separation of concerns
export const reactToReview = async (req, res) => {
	const { reviewId, type, userId } = req.body;
	try {
		const review = await Review.findById(reviewId);
		if (!review)
			return res
				.status(404)
				.json({ success: false, error: "Review not found" });

		const reactions = review.reactions[type];
		if (reactions.includes(userId)) {
			review.reactions[type] = reactions.filter((id) => id !== userId);
		} else {
			review.reactions[type].push(userId);
		}
		await review.save();
		res.status(200).json({ success: true, data: review });
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
};
