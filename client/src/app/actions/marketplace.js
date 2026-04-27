"use server";
// here we will handle the marketplace related server actions, like creating a listing, deleting a listing, etc.
// With this function we will save the post to the marketplace database.
export async function createListing(data) {
    try {
        // here we will make our API call or directly interact with the database (similar to previous actions)
        console.log("Saving to Marketplace:", data);
        return { success: true };
    } catch (err) {
        return { error: err.message };
    }
}