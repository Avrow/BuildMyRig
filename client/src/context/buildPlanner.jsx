"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const BuildPlannerContext = createContext(null);

const CATEGORIES = [
	"CPU",
	"GPU",
	"Motherboard",
	"RAM",
	"Storage",
	"PSU",
	"Case",
	"Cooler",
];

function parseNumberFromValue(value) {
	if (value === null || value === undefined) return 0;
	if (typeof value === "number") return Number.isFinite(value) ? value : 0;

	const normalized = String(value).replace(/,/g, "");
	const match = normalized.match(/\d+(\.\d+)?/);
	if (!match) return 0;
	const parsed = Number.parseFloat(match[0]);
	return Number.isFinite(parsed) ? parsed : 0;
}

function getSocket(component) {
	const socketValue = component?.specs?.socket ?? component?.specs?.cpuSocket;
	if (!socketValue) return "";
	return String(socketValue).trim().toLowerCase();
}

function getPSUWattage(psu) {
	if (!psu) return 0;
	const specWatt =
		parseNumberFromValue(psu?.specs?.wattage) ||
		parseNumberFromValue(psu?.specs?.power) ||
		parseNumberFromValue(psu?.specs?.capacity);
	if (specWatt > 0) return specWatt;

	const nameWatt = String(psu?.name || "").match(/(\d{3,4})\s*w/i);
	return nameWatt ? parseInt(nameWatt[1], 10) : 0;
}

function getComponentPowerEstimate(component) {
	if (!component) return 0;

	const type = component.type;
	const bySpec =
		parseNumberFromValue(component?.specs?.tdp) ||
		parseNumberFromValue(component?.specs?.wattage) ||
		parseNumberFromValue(component?.specs?.powerDraw) ||
		parseNumberFromValue(component?.specs?.power);

	if (bySpec > 0) return bySpec;

	if (type === "CPU") return 95;
	if (type === "GPU") return 220;
	if (type === "Motherboard") return 55;
	if (type === "RAM") return 8;
	if (type === "Storage") return 10;
	if (type === "Cooler") return 6;
	if (type === "Case") return 4;
	return 0;
}

function buildCompatibilityWarnings(selectedByCategory) {
	const warnings = [];
	const cpu = selectedByCategory.CPU;
	const motherboard = selectedByCategory.Motherboard;

	if (cpu && motherboard) {
		const cpuSocket = getSocket(cpu);
		const moboSocket = getSocket(motherboard);
		if (cpuSocket && moboSocket && cpuSocket !== moboSocket) {
			warnings.push("Motherboard socket does not match CPU socket.");
		}
	}

	return warnings;
}

function roundUpToNearestStep(value, step = 50) {
	if (!value || value <= 0) return 0;
	return Math.ceil(value / step) * step;
}

export function BuildPlannerProvider({ children }) {
	const [activeCategory, setActiveCategory] = useState("CPU");
	const [searchQuery, setSearchQuery] = useState("");
	const [catalogParts, setCatalogParts] = useState([]);
	const [catalogLoading, setCatalogLoading] = useState(false);
	const [catalogError, setCatalogError] = useState("");

	const [selectedByCategory, setSelectedByCategory] = useState({});
	const [virtualLookUrl, setVirtualLookUrl] = useState("");
	const [generatingLook, setGeneratingLook] = useState(false);
	const [savingBuild, setSavingBuild] = useState(false);

	const selectedParts = useMemo(
		() => CATEGORIES.map((category) => selectedByCategory[category]).filter(Boolean),
		[selectedByCategory],
	);

	const selectedPowerConsumerParts = useMemo(
		() => selectedParts.filter((part) => part.type !== "PSU"),
		[selectedParts],
	);

	const totalRequiredWattage = useMemo(
		() =>
			selectedPowerConsumerParts.reduce(
				(sum, part) => sum + getComponentPowerEstimate(part),
				0,
			),
		[selectedPowerConsumerParts],
	);

	const compatibilityWarnings = useMemo(
		() => buildCompatibilityWarnings(selectedByCategory),
		[selectedByCategory],
	);

	const fetchParts = useCallback(async (category, search) => {
		setCatalogLoading(true);
		setCatalogError("");

		const params = new URLSearchParams({ type: category, limit: "24" });
		if (search?.trim()) params.set("search", search.trim());

		try {
			const response = await fetch(`${API_URL}/api/components?${params.toString()}`, {
				credentials: "include",
			});
			const data = await response.json().catch(() => ({}));
			if (!response.ok) {
				throw new Error(data.error || "Failed to load components");
			}
			setCatalogParts(Array.isArray(data.components) ? data.components : []);
		} catch (err) {
			setCatalogParts([]);
			setCatalogError(err.message || "Failed to load components");
		} finally {
			setCatalogLoading(false);
		}
	}, []);

	const addPart = useCallback((part) => {
		setSelectedByCategory((prev) => ({
			...prev,
			[part.type]: part,
		}));
	}, []);

	const removePart = useCallback((category) => {
		setSelectedByCategory((prev) => {
			const next = { ...prev };
			delete next[category];
			return next;
		});
	}, []);

	const clearBuild = useCallback(() => {
		setSelectedByCategory({});
		setVirtualLookUrl("");
	}, []);

	const generateVirtualLook = useCallback(async () => {
		if (selectedParts.length === 0) {
			toast.error("Add at least one part before generating a virtual look");
			return;
		}

		setGeneratingLook(true);
		try {
			const response = await fetch(`${API_URL}/api/builds/virtual-look`, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					parts: selectedParts.map((part) => ({
						componentId: part._id,
						name: part.name,
						type: part.type,
						brand: part.brand,
						specs: part.specs || {},
					})),
				}),
			});

			const data = await response.json().catch(() => ({}));
			const imageBase64 = data.imageBase64 || "";
			const imageUrl = data.imageUrl || "";
			if (!response.ok || (!imageBase64 && !imageUrl)) {
				throw new Error(data.error || "Virtual look generation failed");
			}

			setVirtualLookUrl(imageBase64 || imageUrl);
			toast.success("Virtual build look generated");
		} catch (err) {
			toast.error(err.message || "Failed to generate virtual look");
		} finally {
			setGeneratingLook(false);
		}
	}, [selectedParts]);

	const saveImage = useCallback(async () => {
		if (!virtualLookUrl) {
			toast.error("Generate a virtual look before saving.");
			return false;
		}

		setSavingBuild(true);
		try {
			const payload = {
				buildImageUrl: virtualLookUrl,
				buildName: `Virtual Build ${new Date().toLocaleDateString()}`,
			};

			const response = await fetch(`${API_URL}/api/builds`, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});
			const data = await response.json().catch(() => ({}));
			if (!response.ok) {
				throw new Error(data.error || "Failed to save image");
			}

			toast.success("Image saved successfully");
			return true;
		} catch (err) {
			toast.error(err.message || "Failed to save image");
			return false;
		} finally {
			setSavingBuild(false);
		}
	}, [virtualLookUrl]);

	const psuWattage = useMemo(() => getPSUWattage(selectedByCategory.PSU), [selectedByCategory]);
	const requiredWattageWithBuffer = useMemo(
		() => Math.ceil(totalRequiredWattage * 1.2),
		[totalRequiredWattage],
	);
	const suggestedPsuWattage = useMemo(
		() => roundUpToNearestStep(Math.max(requiredWattageWithBuffer, 450), 50),
		[requiredWattageWithBuffer],
	);
	const hasSelectedPsu = Boolean(selectedByCategory.PSU && psuWattage > 0);
	const isPsuSufficient = Boolean(hasSelectedPsu && psuWattage >= requiredWattageWithBuffer);
	const hasPsuHeadroomWarning = Boolean(hasSelectedPsu && !isPsuSufficient);

	const value = {
		categories: CATEGORIES,
		activeCategory,
		setActiveCategory,
		searchQuery,
		setSearchQuery,
		catalogParts,
		catalogLoading,
		catalogError,
		fetchParts,
		selectedByCategory,
		selectedParts,
		addPart,
		removePart,
		clearBuild,
		totalRequiredWattage,
		requiredWattageWithBuffer,
		suggestedPsuWattage,
		estimatedWattage: totalRequiredWattage,
		compatibilityWarnings,
		psuWattage,
		hasSelectedPsu,
		isPsuSufficient,
		hasPsuHeadroomWarning,
		virtualLookUrl,
		setVirtualLookUrl,
		generateVirtualLook,
		generatingLook,
		saveImage,
		savingBuild,
	};

	return (
		<BuildPlannerContext.Provider value={value}>
			{children}
		</BuildPlannerContext.Provider>
	);
}

export function useBuildPlanner() {
	const ctx = useContext(BuildPlannerContext);
	if (!ctx) {
		throw new Error("useBuildPlanner must be used within BuildPlannerProvider");
	}
	return ctx;
}
