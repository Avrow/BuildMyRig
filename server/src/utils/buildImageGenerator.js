import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import { InferenceClient } from "@huggingface/inference";

const IMAGE_PROVIDER = (
	process.env.IMAGE_GEN_PROVIDER || "huggingface"
).toLowerCase();

const IMAGE_TIMEOUT_MS = Number(process.env.IMAGE_GEN_TIMEOUT_MS || 45000);

/* =========================
   VALIDATION
========================= */
function ensurePrompt(prompt) {
	if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
		throw new Error("Image prompt is required");
	}
}

/* =========================
   PROMPT BUILDER
========================= */
export function buildVisualPrompt(parts = []) {
	const normalized = Array.isArray(parts)
		? parts.map((part) => ({
				name: part?.name || "Unknown Part",
				type: part?.type || "Unknown",
				brand: part?.brand || "",
				specs: part?.specs || {},
			}))
		: [];

	const getPart = (type) => normalized.find((p) => p.type === type);

	const casePart = getPart("Case");
	const gpuPart = getPart("GPU");
	const coolerPart = getPart("Cooler");
	const cpuPart = getPart("CPU");
	const motherboardPart = getPart("Motherboard");

	const hasRGB = [casePart, gpuPart, coolerPart]
		.map((p) => JSON.stringify(p?.specs || {}).toLowerCase())
		.some((text) => text.includes("rgb") || text.includes("argb"));

	const rgbHints = hasRGB
		? "Visible RGB and ARGB lighting effects throughout the interior"
		: "Subtle premium lighting with clean cable management";

	return [
		"Photorealistic high-end custom gaming PC tower",
		"transparent tempered glass side panel",
		rgbHints,
		casePart
			? `Case: ${casePart.brand} ${casePart.name}`
			: "Modern airflow mid-tower case",
		gpuPart ? `GPU visible: ${gpuPart.brand} ${gpuPart.name}` : "Dual-fan GPU",
		coolerPart
			? `Cooling: ${coolerPart.brand} ${coolerPart.name}`
			: "Air cooler",
		cpuPart ? `CPU: ${cpuPart.name}` : "Latest CPU",
		motherboardPart
			? `Motherboard: ${motherboardPart.brand} ${motherboardPart.name}`
			: "ATX motherboard",
		"dark studio background",
		"cinematic lighting",
		"ultra realistic",
		"8k, ray tracing, sharp focus, depth of field",
		"no text, no watermark",
	].join(", ");
}

/* =========================
   GOOGLE IMAGEN (FALLBACK)
========================= */
async function generateWithGeminiImagen(prompt) {
	const apiKey = process.env.GOOGLE_API_KEY;
	if (!apiKey) throw new Error("GOOGLE_API_KEY missing");

	const client = new GoogleGenAI({ apiKey });

	const model = process.env.GOOGLE_IMAGEN_MODEL || "imagen-3.0-generate-001";

	console.log("Using Google model:", model);

	const result = await client.models.generateImages({
		model,
		prompt,
		config: {
			numberOfImages: 1,
			outputMimeType: "image/jpeg",
		},
		timeoutMs: IMAGE_TIMEOUT_MS,
	});

	const image = result?.generatedImages?.[0];

	if (!image?.imageBytes) {
		throw new Error("Google Imagen returned no image");
	}

	return {
		base64: image.imageBytes,
		mimeType: "image/jpeg",
	};
}

/* =========================
   HUGGING FACE (PRIMARY)
========================= */
const hfClient = new InferenceClient(process.env.HF_TOKEN);

async function blobToBase64(blob) {
	const arrayBuffer = await blob.arrayBuffer();
	return Buffer.from(arrayBuffer).toString("base64");
}

async function generateWithHuggingFace(prompt) {
	if (!process.env.HF_TOKEN) {
		throw new Error("HF_TOKEN is missing");
	}

	const model =
		process.env.HF_MODEL || "stabilityai/stable-diffusion-xl-base-1.0";

	const provider = process.env.HF_PROVIDER || "nscale";

	console.log("Using HF model:", model);
	console.log("Using HF provider:", provider);

	let imageBlob;

	try {
		imageBlob = await hfClient.textToImage({
			provider,
			model,
			inputs: prompt,
			parameters: {
				num_inference_steps: 30,
				guidance_scale: 7.5,
			},
		});
	} catch (err) {
		throw new Error(`HF failed: ${err.message}`);
	}

	if (!imageBlob) {
		throw new Error("No image returned from HuggingFace");
	}

	const base64 = await blobToBase64(imageBlob);

	return {
		base64,
		mimeType: imageBlob.type || "image/png",
	};
}

/* =========================
   MAIN ENTRY
========================= */
export async function generateBuildLookImage(prompt) {
	ensurePrompt(prompt);

	if (IMAGE_PROVIDER === "huggingface") {
		try {
			return await generateWithHuggingFace(prompt);
		} catch (err) {
			console.warn("HF failed → fallback to Google:", err.message);
			return generateWithGeminiImagen(prompt);
		}
	}

	if (IMAGE_PROVIDER === "google") {
		try {
			return await generateWithGeminiImagen(prompt);
		} catch (err) {
			console.warn("Google failed → fallback to HF:", err.message);
			return generateWithHuggingFace(prompt);
		}
	}

	throw new Error(`Unsupported IMAGE_GEN_PROVIDER: ${IMAGE_PROVIDER}`);
}
