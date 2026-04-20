"use server";
import vision from '@google-cloud/vision';
import path from 'path';

// Google Vision API client initialization
const client = new vision.ImageAnnotatorClient({
    keyFilename: path.join(process.cwd(), 'vision-key.json'),
});

/**
 * Moderates an image using Google Vision API's Safe Search Detection.
 */
export async function moderateImage(imageUrl) {
    try {
        const [result] = await client.safeSearchDetection(imageUrl);
        const detections = result.safeSearchAnnotation;

        // Categories to check: Adult, Violence, Racy
        const unsafeLevels = ['LIKELY', 'VERY_LIKELY'];

        const isInappropriate = 
            unsafeLevels.includes(detections.adult) || 
            unsafeLevels.includes(detections.violence) || 
            unsafeLevels.includes(detections.racy);

        if (isInappropriate) {
            return { safe: false, error: "Security Policy: Inappropriate content detected. Please upload a clean PC build photo." };
        }

        return { safe: true };
    } catch (error) {
        console.error("Google Vision API Error:", error);
        // If the API fails, we won't block the user (safe fallback)
        return { safe: true }; 
    }
}