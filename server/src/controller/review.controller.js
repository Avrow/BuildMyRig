import Review from "../models/Review.js";

// creating review with basic validation (e.g. rating range, required fields) for better data integrity
export const createReview = async (req, res) => {
    try {
        const { buildId, userId, userName, rating, comment } = req.body;
        const newReview = new Review({
            buildId,
            userId,
            userName,
            rating,
            comment,
            reactions: { love: [], haha: [], sad: [] },
            replies: []
        });
        await newReview.save();
        res.status(201).json(newReview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// build review fetching with sorting by newest first for better UX
export const getReviewsByPost = async (req, res) => {
    try {
        const { buildId } = req.params;
        const reviews = await Review.find({ buildId }).sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// reaction toggling handled in separate route for cleaner code and better separation of concerns
export const reactToReview = async (req, res) => {
    const { reviewId, type, userId } = req.body;
    try {
        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ message: "Review not found" });

        const reactions = review.reactions[type];
        if (reactions.includes(userId)) {
            review.reactions[type] = reactions.filter(id => id !== userId);
        } else {
            review.reactions[type].push(userId);
        }
        await review.save();
        res.status(200).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};