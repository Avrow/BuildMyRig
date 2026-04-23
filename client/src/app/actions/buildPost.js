"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/mongooseClient";
import BuildPost from "@/models/buildPost";
import { moderateImage } from "@/lib/imageModeration"; 

/**
 * new post create
 */
export async function createBuildPost({ author, imageUrl, caption, cpu, gpu, ram, description }) {
    if (!author || !imageUrl || !caption || !cpu || !gpu || !ram || !description) {
        return { error: "All fields are required." };
    }

    try {
        const moderation = await moderateImage(imageUrl);
        if (moderation && moderation.safe === false) {
            return { error: moderation.error };
        }

        await connectDB();
        const post = await BuildPost.create({ 
            author, imageUrl, caption, cpu, gpu, ram, description  
        });

        revalidatePath("/community");
        return { success: true, id: post._id.toString() };
    } catch (err) {
        console.error("[createBuildPost Error]", err);
        return { error: "Failed to save build." };
    }
}

/**
 * post delete (only by author) - permission check included
 */
export async function deleteBuildPost(postId, userId) {
    try {
        await connectDB();
        const post = await BuildPost.findById(postId);
        
        if (!post) return { error: "Post not found" };
        
        // অথেনটিকেশন চেক
        if (post.author.toString() !== userId) {
            return { error: "Unauthorized! You can only delete your own posts." };
        }

        await BuildPost.findByIdAndDelete(postId);
        revalidatePath("/community");
        return { success: true };
    } catch (err) {
        console.error("[deleteBuildPost Error]", err);
        return { error: "Failed to delete post." };
    }
}

/**
 * post upload
 */
export async function updateBuildPost(postId, userId, updatedData) {
    try {
        if (updatedData.imageUrl) {
            const moderation = await moderateImage(updatedData.imageUrl);
            if (moderation && moderation.safe === false) {
                return { error: moderation.error };
            }
        }

        await connectDB();
        const post = await BuildPost.findById(postId);
        
        if (!post) return { error: "Post not found" };
        if (post.author.toString() !== userId) {
            return { error: "Unauthorized access." };
        }

        await BuildPost.findByIdAndUpdate(postId, updatedData);
        revalidatePath("/community");
        return { success: true };
    } catch (err) {
        console.error("[updateBuildPost Error]", err);
        return { error: "Update failed." };
    }
}