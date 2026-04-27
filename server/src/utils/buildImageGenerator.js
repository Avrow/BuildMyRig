import axios from "axios";
import OpenAI from "openai";

const IMAGE_PROVIDER = (process.env.IMAGE_GEN_PROVIDER || "openai").toLowerCase();
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

async function generateWithOpenAI(prompt) {
	const apiKey = process.env.OPENAI_API_KEY;
	if (!apiKey) {
		throw new Error("OPENAI_API_KEY is missing for OpenAI image generation");
	}

	const client = new OpenAI({ apiKey });
	const result = await client.images.generate({
		model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
		prompt,
		size: process.env.OPENAI_IMAGE_SIZE || "1024x1024",
		timeout: IMAGE_TIMEOUT_MS,
	});

	const first = result?.data?.[0];
	if (first?.url) {
		return first.url;
	}

	if (first?.b64_json) {
		return `data:image/png;base64,${first.b64_json}`;
	}

	throw new Error("OpenAI image generation returned no image data");
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

	const contentType = response.headers["content-type"] || "image/png";
	const base64 = Buffer.from(response.data).toString("base64");
	return `data:${contentType};base64,${base64}`;
}

export async function generateBuildLookImage(prompt) {
	ensurePrompt(prompt);

	if (IMAGE_PROVIDER === "huggingface") {
		return generateWithHuggingFace(prompt);
	}

	if (IMAGE_PROVIDER === "openai") {
		return generateWithOpenAI(prompt);
	}

	throw new Error(
		`Unsupported IMAGE_GEN_PROVIDER '${IMAGE_PROVIDER}'. Use 'openai' or 'huggingface'.`,
	);
}
