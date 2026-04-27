import mongoose from "mongoose";
import Component from "../models/Component.js";
import SavedBuild from "../models/SavedBuild.js";
import {
	buildVisualPrompt,
	generateBuildLookImage,
} from "../utils/buildImageGenerator.js";

function toObjectIdSet(values) {
	return [...new Set(values.map((value) => String(value)))];
}

function isValidObjectId(id) {
	return mongoose.Types.ObjectId.isValid(String(id));
}

function resolveComponentPrice(component) {
	if (typeof component.price === "number" && Number.isFinite(component.price)) {
		return component.price;
	}

	if (Array.isArray(component.prices) && component.prices.length > 0) {
		const valid = component.prices
			.map((entry) => entry?.price)
			.filter((price) => typeof price === "number" && Number.isFinite(price));
		if (valid.length > 0) return Math.min(...valid);
	}

	return 0;
}

function isValidBuildImageUrl(value) {
	if (!value) return true;
	if (typeof value !== "string") return false;

	const trimmed = value.trim();
	if (!trimmed) return true;
	if (trimmed.startsWith("data:image/")) return true;

	try {
		const parsed = new URL(trimmed);
		return parsed.protocol === "http:" || parsed.protocol === "https:";
	} catch {
		return false;
	}
}

export async function generateBuildLook(req, res) {
	try {
		const selectedComponents = req.body?.selectedComponents || req.body?.parts;

		if (!Array.isArray(selectedComponents) || selectedComponents.length === 0) {
			return res.status(400).json({
				success: false,
				error: "selectedComponents must be a non-empty array",
			});
		}

		const prompt = buildVisualPrompt(selectedComponents);
		const imageUrl = await generateBuildLookImage(prompt);

		return res.status(200).json({
			success: true,
			imageUrl,
			prompt,
		});
	} catch (err) {
		const isTimeout =
			err?.code === "ECONNABORTED" ||
			err?.status === 408 ||
			String(err?.message || "").toLowerCase().includes("timeout");

		console.error("[generateBuildLook]", err);
		return res.status(isTimeout ? 504 : 500).json({
			success: false,
			error: isTimeout
				? "Image generation timed out. Please try again."
				: err.message || "Failed to generate build image",
		});
	}
}

export async function createSavedBuild(req, res) {
	try {
		if (!req.user?.id) {
			return res.status(401).json({
				success: false,
				error: "Unauthorized",
			});
		}

		const {
			componentIds,
			buildName,
			buildImageUrl = null,
			virtualLookUrl = null,
		} = req.body;
		const finalBuildImageUrl = buildImageUrl || virtualLookUrl || null;
		const fallbackIds = Array.isArray(req.body?.components)
			? req.body.components
					.map((component) => component?.componentId || component?._id)
					.filter(Boolean)
			: [];
		const finalComponentIds =
			Array.isArray(componentIds) && componentIds.length > 0
				? componentIds
				: fallbackIds;
		const finalBuildName =
			typeof buildName === "string" && buildName.trim()
				? buildName.trim()
				: "Virtual Build";

		if (!isValidBuildImageUrl(finalBuildImageUrl)) {
			return res.status(400).json({
				success: false,
				error: "buildImageUrl must be a valid http(s) URL or data URL",
			});
		}

		if (!finalBuildImageUrl) {
			return res.status(400).json({
				success: false,
				error: "buildImageUrl is required",
			});
		}

		let components = [];
		let totalPrice = 0;

		if (Array.isArray(finalComponentIds) && finalComponentIds.length > 0) {
			const normalizedIds = toObjectIdSet(finalComponentIds);
			const invalidIds = normalizedIds.filter((id) => !isValidObjectId(id));
			if (invalidIds.length > 0) {
				return res.status(400).json({
					success: false,
					error: "Invalid component ID format",
					invalidIds,
				});
			}

			components = await Component.find({ _id: { $in: normalizedIds } }).select(
				"_id name price prices",
			);

			if (components.length !== normalizedIds.length) {
				const found = new Set(components.map((component) => String(component._id)));
				const missingIds = normalizedIds.filter((id) => !found.has(id));
				return res.status(404).json({
					success: false,
					error: "Some components were not found in catalog",
					missingIds,
				});
			}

			totalPrice = components.reduce(
				(sum, component) => sum + resolveComponentPrice(component),
				0,
			);
		}

		const savedBuild = await SavedBuild.create({
			user: req.user.id,
			components: components.map((component) => component._id),
			buildName: finalBuildName,
			totalPrice,
			buildImageUrl: finalBuildImageUrl,
		});

		return res.status(201).json({
			success: true,
			data: savedBuild,
		});
	} catch (err) {
		console.error("[createSavedBuild]", err);
		return res.status(500).json({
			success: false,
			error: err.message || "Failed to save build",
		});
	}
}

export async function getMySavedBuilds(req, res) {
	try {
		if (!req.user?.id) {
			return res.status(401).json({
				success: false,
				error: "Unauthorized",
			});
		}

		const builds = await SavedBuild.find({ user: req.user.id })
			.populate({
				path: "components",
				select: "name type brand price imageUrl specs",
			})
			.sort({ createdAt: -1 });

		return res.status(200).json({
			success: true,
			data: builds,
		});
	} catch (err) {
		console.error("[getMySavedBuilds]", err);
		return res.status(500).json({
			success: false,
			error: err.message || "Failed to fetch saved builds",
		});
	}
}
