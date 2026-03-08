import { createUploadthing } from "uploadthing/next";

const f = createUploadthing();

/**
 * File router for UploadThing.
 * Add/remove endpoints here to match your use-case.
 */
export const ourFileRouter = {
	// Single image uploader, max 4 MB.
	imageUploader: f({
		image: { maxFileSize: "4MB", maxFileCount: 1 },
	})
		.middleware(async () => {
			// For the MVP we allow any upload without auth.
			// TODO: Add authentication here when ready.
			return {};
		})
		.onUploadComplete(async ({ file }) => {
			// This runs on the server after a successful upload.
			// The returned value is forwarded to the client callback.
			return { url: file.ufsUrl };
		}),
};
