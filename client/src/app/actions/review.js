"use server";

import connectDB from "@/lib/mongooseClient";
import Review from "@/models/Review";
import { revalidatePath } from "next/cache";


export async function submitReview(data) {
    try {
        await connectDB();
        await Review.create(data);
        revalidatePath("/community");
        return { success: true };
    } catch (err) {
        return { error: err.message };
    }
}


export async function submitReply(reviewId, replyData) {
    try {
        await connectDB();
        const review = await Review.findById(reviewId);
        if (!review) return { error: "Review not found" };

        
        review.replies.push({
            userId: replyData.userId,
            userName: replyData.userName,
            text: replyData.text,
            createdAt: new Date()
        });

        await review.save();
        revalidatePath("/community");
        return { success: true };
    } catch (err) {
        return { error: err.message };
    }
}


export async function toggleReaction(reviewId, userId, type) {
    try {
        await connectDB();
        const review = await Review.findById(reviewId);
        if (!review) return { error: "Review not found" };

        
        ['love', 'haha', 'sad'].forEach(t => {
            review.reactions[t] = (review.reactions[t] || []).filter(id => id !== userId);
        });
        
        review.reactions[type].push(userId);
        
        
        review.markModified('reactions');
        await review.save();
        
        revalidatePath("/community");
        return { success: true };
    } catch (err) {
        return { error: err.message };
    }
}