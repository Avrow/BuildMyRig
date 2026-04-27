import BuildPost from "../models/buildPost.js";
import axios from "axios";
import FormData from "form-data";
import { checkImageSafety } from "../utils/picPurify.js";


// given a post ID, fetch the post details along with its reviews, average rating, and review count
export async function getPostById(req, res) {
    try {
        const post = await BuildPost.findById(req.params.id);
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
        const posts = await BuildPost.aggregate([
            {
                $lookup: {
                    from: "reviews", 
                    localField: "_id",
                    foreignField: "postId",
                    as: "reviews"
                }
            },
            {
                $addFields: {
                    avgRating: { $avg: "$reviews.rating" },
                    reviewCount: { $size: "$reviews" }
                }
            },
            { $sort: { createdAt: -1 } }
        ]);
        res.json({ success: true, data: posts });
    } catch (err) {
        res.status(500).json({ error: "Failed to load posts from database." });
    }
}

// new build post creation with 1500-word limit and AI Safe Search
export async function createBuildPost(req, res) {
    const { imageUrl, caption, cpu, gpu, ram, description } = req.body;

    // ১. সব ফিল্ড আছে কি না চেক
    if (!imageUrl || !caption || !cpu || !gpu || !ram || !description) {
        return res.status(400).json({ success: false, error: "All fields are required!" });
    }

    // ২. ওয়ার্ড কাউন্ট ভ্যালিডেশন
    const wordCount = description.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount > 1500) {
        return res.status(400).json({ 
            success: false, 
            error: `Description too long! Max 1500 words. (Current: ${wordCount})` 
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
                error: moderation.message 
            });
        }

        // ৪. যদি নিরাপদ হয়, তবেই ডাটাবেসে সেভ হবে
        const post = await BuildPost.create({ imageUrl, caption, cpu, gpu, ram, description });
        res.status(201).json({ success: true, id: post._id });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Failed to save build." });
    }
}