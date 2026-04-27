import axios from "axios";
import FormData from "form-data";

export const checkImageSafety = async (imageSource, isUrl = true) => {
	const form = new FormData();

	// Required API key
	form.append("API_KEY", process.env.PICPURIFY_API_KEY);

	// Task list (as per PicPurify docs)
	form.append(
		"task",
		"porn_moderation,gore_moderation,drug_moderation,suggestive_nudity_moderation,weapons_moderation",
	);

	// Optional: you can add origin/reference if needed for tracking
	// form.append("reference_id", "your-id");

	if (isUrl) {
		form.append("url_image", imageSource);
	} else {
		form.append("file", imageSource, {
			filename: "upload.jpg",
		});
	}

	try {
		const { data } = await axios.post(
			"https://www.picpurify.com/analyse/1.1/",
			form,
			{
				headers: form.getHeaders(),
				timeout: 15000,
			},
		);

		// API failure handling
		if (!data || data.status !== "success") {
			return {
				isSafe: false,
				message: data?.error_msg || "PicPurify API error",
			};
		}

		// Extract moderation scores safely
		const pornScore = data?.porn_moderation?.porn_content ?? 0;
		const goreScore = data?.gore_moderation?.gore_content ?? 0;
		const drugScore = data?.drug_moderation?.drug_content ?? 0;
		const nsfwScore =
			data?.suggestive_nudity_moderation?.suggestive_nudity ?? 0;

		// Final decision logic (more complete than before)
		const isUnsafe =
			data?.final_decision === "REJECT" ||
			pornScore > 0.7 ||
			goreScore > 0.7 ||
			drugScore > 0.7 ||
			nsfwScore > 0.7;

		if (isUnsafe) {
			return {
				isSafe: false,
				message: data?.reject_cause || "Unsafe content detected",
				scores: {
					pornScore,
					goreScore,
					drugScore,
					nsfwScore,
				},
			};
		}

		return { isSafe: true };
	} catch (err) {
		console.error("PicPurify Error:", err.response?.data || err.message);

		return {
			isSafe: false,
			message: "Moderation failed (network/API issue)",
		};
	}
};
