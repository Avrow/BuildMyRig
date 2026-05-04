import axios from "axios";
import { GoogleGenAI } from "@google/genai";

const IMAGE_PROVIDER = (process.env.IMAGE_GEN_PROVIDER || "google").toLowerCase();
const IMAGE_TIMEOUT_MS = Number(process.env.IMAGE_GEN_TIMEOUT_MS || 45000);

function ensurePrompt(prompt) {
	if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
		throw new Error("Image prompt is required");
	}
}


export function buildVisualPrompt(parts = []) {
	const normalized = Array.isArray(parts)
		? parts.map((part) => ({
			name: part?.name || "Unknown Part",
			type: part?.type || "Unknown",
			brand: part?.brand || "",
			specs: part?.specs || {},
		}))
		: [];

	const getPart = (type) => normalized.find((part) => part.type === type);
	const casePart = getPart("Case");
	const gpuPart = getPart("GPU");
	const coolerPart = getPart("Cooler");
	const cpuPart = getPart("CPU");
	const motherboardPart = getPart("Motherboard");

	const rgbHints = [casePart, gpuPart, coolerPart]
		.map((part) => JSON.stringify(part?.specs || {}).toLowerCase())
		.filter(Boolean)
		.some((specText) => specText.includes("rgb") || specText.includes("argb"))
		? "Visible RGB and ARGB lighting effects throughout the interior"
		: "Subtle premium lighting with clean cable management";

	const basePrompt = [
		"Photorealistic high-end custom gaming PC tower render",
		"transparent tempered glass side panel",
		rgbHints,
		casePart
			? `Case design inspired by ${casePart.brand} ${casePart.name}`
			: "Modern airflow-focused mid-tower case",
		gpuPart
			? `Prominent GPU visible: ${gpuPart.brand} ${gpuPart.name}`
			: "Modern dual-fan graphics card mounted horizontally",
		coolerPart
			? `CPU cooling setup: ${coolerPart.brand} ${coolerPart.name}`
			: "Performance air cooler with illuminated fan",
		cpuPart ? `CPU platform: ${cpuPart.name}` : "Latest generation desktop CPU",
		motherboardPart
			? `Motherboard style based on ${motherboardPart.brand} ${motherboardPart.name}`
			: "ATX gaming motherboard",
		"dark neutral studio background, cinematic lighting, ultra detailed, no text, no watermark",
	].join(", ");

	return basePrompt;
}

async function generateWithGeminiImagen(prompt) {
	const apiKey = process.env.GOOGLE_API_KEY;
	if (!apiKey) {
		throw new Error("GOOGLE_API_KEY is missing for Gemini image generation");
	}

	const client = new GoogleGenAI({ apiKey });
	const result = await client.models.generateImages({
		model: process.env.GOOGLE_IMAGEN_MODEL || "imagen-3.0-generate-002",
		prompt,
		config: {
			numberOfImages: 1,
			outputMimeType: process.env.GOOGLE_IMAGEN_MIME || "image/jpeg",
		},
		timeoutMs: IMAGE_TIMEOUT_MS,
	});

	const first = result?.generatedImages?.[0] || result?.images?.[0];
	const base64 =
		first?.image?.imageBytes ||
		first?.imageBytes ||
		first?.image?.base64Data ||
		first?.base64;
	const mimeType =
		first?.image?.mimeType ||
		first?.mimeType ||
		process.env.GOOGLE_IMAGEN_MIME ||
		"image/jpeg";

	if (!base64) {
		throw new Error("Gemini Imagen response did not include image bytes");
	}

	return { base64, mimeType };
}

async function generateWithHuggingFace(prompt) {
	const apiUrl = process.env.HUGGINGFACE_IMAGE_API_URL;
	if (!apiUrl) {
		throw new Error("HUGGINGFACE_IMAGE_API_URL is missing for Hugging Face image generation");
	}

	const apiKey = process.env.HUGGINGFACE_API_KEY;
	const response = await axios.post(
		apiUrl,
		{ inputs: prompt },
		{
			responseType: "arraybuffer",
			timeout: IMAGE_TIMEOUT_MS,
			headers: {
				"Content-Type": "application/json",
				...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
			},
		},
	);

	const mimeType = response.headers["content-type"] || "image/png";
	const base64 = Buffer.from(response.data).toString("base64");
	return { base64, mimeType };
}

export async function generateBuildLookImage(prompt) {
	ensurePrompt(prompt);

	if (IMAGE_PROVIDER === "huggingface") {
		return generateWithHuggingFace(prompt);
	}

	if (IMAGE_PROVIDER === "google" || IMAGE_PROVIDER === "gemini") {
		return generateWithGeminiImagen(prompt);
	}

	throw new Error(
		`Unsupported IMAGE_GEN_PROVIDER '${IMAGE_PROVIDER}'. Use 'google' or 'huggingface'.`,
	);
}
