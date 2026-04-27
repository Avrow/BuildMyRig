"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeftRight, Loader2, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";

// Constants
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const COMPONENT_TYPES = [
	{ value: "CPU", label: "CPU" },
	{ value: "GPU", label: "GPU" },
	{ value: "RAM", label: "RAM" },
	{ value: "Storage", label: "Storage" },
	{ value: "Motherboard", label: "Motherboard" },
	{ value: "PSU", label: "PSU" },
	{ value: "Case", label: "Case" },
	{ value: "Cooler", label: "Cooler" },
];

// Helper functions
function formatSpecKey(key) {
	return key
		.replace(/_/g, " ")
		.replace(/([A-Z])/g, " $1")
		.replace(/^./, (s) => s.toUpperCase())
		.trim();
}

function formatSpecValue(value) {
	if (typeof value === "number") {
		return value.toLocaleString();
	}
	return String(value);
}

// Determine if higher or lower value is better for comparison
function getComparisonDirection(specKey, componentType) {
	const key = specKey.toLowerCase();
	
	// CPU specs
	if (componentType === "CPU") {
		if (key.includes("core") || key.includes("thread") || key.includes("clock") || key.includes("boost")) return "higher";
		if (key.includes("tdp") || key.includes("power")) return "lower";
	}
	
	// GPU specs
	if (componentType === "GPU") {
		if (key.includes("memory") || key.includes("clock") || key.includes("boost")) return "higher";
		if (key.includes("power") || key.includes("tdp")) return "lower";
	}
	
	// RAM specs
	if (componentType === "RAM") {
		if (key.includes("speed") || key.includes("frequency") || key.includes("size") || key.includes("capacity")) return "higher";
		if (key.includes("latency") || key.includes("timing") || key.includes("voltage")) return "lower";
	}
	
	// Storage specs
	if (componentType === "Storage") {
		if (key.includes("capacity") || key.includes("size") || key.includes("speed") || key.includes("read") || key.includes("write")) return "higher";
	}
	
	// PSU specs
	if (componentType === "PSU") {
		if (key.includes("wattage") || key.includes("power") || key.includes("efficiency")) return "higher";
	}
	
	// Default to higher is better
	return "higher";
}

// Compare two values and determine which is better
function compareValues(val1, val2, direction) {
	if (val1 === null || val1 === undefined || val2 === null || val2 === undefined) {
		return { better: null, worse: null };
	}
	
	const num1 = parseFloat(val1);
	const num2 = parseFloat(val2);
	
	if (isNaN(num1) || isNaN(num2)) {
		return { better: null, worse: null };
	}
	
	if (direction === "higher") {
		return {
			better: num1 > num2 ? 1 : num2 > num1 ? 2 : 0,
			worse: num1 < num2 ? 1 : num2 < num1 ? 2 : 0,
		};
	} else {
		return {
			better: num1 < num2 ? 1 : num2 < num1 ? 2 : 0,
			worse: num1 > num2 ? 1 : num2 > num1 ? 2 : 0,
		};
	}
}

// Main component
export default function SpecComparePage() {
	const [selectedType, setSelectedType] = useState("");
	const [components, setComponents] = useState([]);
	const [component1, setComponent1] = useState(null);
	const [component2, setComponent2] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Fetch components when type is selected
	const fetchComponents = useCallback(async (type) => {
		if (!type) return;
		
		setLoading(true);
		setError(null);
		setComponents([]);
		setComponent1(null);
		setComponent2(null);

		try {
			const params = new URLSearchParams({
				type,
				limit: "100",
			});

			const response = await fetch(`${API_URL}/api/components?${params.toString()}`, {
				credentials: "include",
			});

			if (!response.ok) throw new Error("Failed to fetch components");
			
			const data = await response.json();
			setComponents(data.components || []);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}, []);

	// Handle type selection
	const handleTypeChange = (type) => {
		setSelectedType(type);
		fetchComponents(type);
	};

	// Handle component selection
	const handleComponent1Change = (componentId) => {
		const component = components.find(c => (c._id || c.name) === componentId);
		setComponent1(component);
	};

	const handleComponent2Change = (componentId) => {
		const component = components.find(c => (c._id || c.name) === componentId);
		setComponent2(component);
	};

	// Reset comparison
	const handleReset = () => {
		setSelectedType("");
		setComponents([]);
		setComponent1(null);
		setComponent2(null);
		setError(null);
	};

	// Get all unique spec keys from both components
	const getAllSpecKeys = () => {
		if (!component1 && !component2) return [];
		
		const keys1 = component1 ? Object.keys(component1.specs || {}) : [];
		const keys2 = component2 ? Object.keys(component2.specs || {}) : [];
		
		// Filter out basic fields that are already displayed separately
		const excludeKeys = ["name", "price", "imageUrl", "type", "brand"];
		
		return [...new Set([...keys1, ...keys2])]
			.filter(key => !excludeKeys.includes(key))
			.sort();
	};

	// Render comparison table
	const renderComparisonTable = () => {
		if (!component1 || !component2) return null;

		const specKeys = getAllSpecKeys();
		const direction = getComparisonDirection("", selectedType);

		return (
			<Card className="mt-8">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ArrowLeftRight className="h-5 w-5" />
						Specification Comparison
					</CardTitle>
				</CardHeader>
				<CardContent>
					{/* Component names and basic info */}
					<div className="grid grid-cols-3 gap-4 mb-6">
						<div className="font-medium text-sm text-slate-500">Specification</div>
						<div className="text-center">
							<div className="font-medium">{component1.name}</div>
							<div className="text-sm text-slate-500">{component1.brand}</div>
							<Badge variant="outline" className="mt-1">
								{component1.type}
							</Badge>
						</div>
						<div className="text-center">
							<div className="font-medium">{component2.name}</div>
							<div className="text-sm text-slate-500">{component2.brand}</div>
							<Badge variant="outline" className="mt-1">
								{component2.type}
							</Badge>
						</div>
					</div>

					<Separator className="mb-4" />

					{/* Specs comparison */}
					<div className="space-y-3">
						{specKeys.map((key) => {
							const val1 = component1.specs?.[key];
							const val2 = component2.specs?.[key];
							const compDirection = getComparisonDirection(key, selectedType);
							const comparison = compareValues(val1, val2, compDirection);

							return (
								<div key={key} className="grid grid-cols-3 gap-4 items-center">
									<div className="font-medium text-sm text-slate-700 dark:text-slate-300">
										{formatSpecKey(key)}
									</div>
									<div
										className={`text-center p-2 rounded ${
											comparison.better === 1
												? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
												: comparison.worse === 1
												? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
												: ""
										}`}
									>
										{val1 !== null && val1 !== undefined ? (
											<div className="flex items-center justify-center gap-1">
												{formatSpecValue(val1)}
												{comparison.better === 1 && <CheckCircle className="h-4 w-4 text-green-600" />}
												{comparison.worse === 1 && <XCircle className="h-4 w-4 text-red-600" />}
											</div>
										) : (
											<span className="text-slate-400">—</span>
										)}
									</div>
									<div
										className={`text-center p-2 rounded ${
											comparison.better === 2
												? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
												: comparison.worse === 2
												? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
												: ""
										}`}
									>
										{val2 !== null && val2 !== undefined ? (
											<div className="flex items-center justify-center gap-1">
												{formatSpecValue(val2)}
												{comparison.better === 2 && <CheckCircle className="h-4 w-4 text-green-600" />}
												{comparison.worse === 2 && <XCircle className="h-4 w-4 text-red-600" />}
											</div>
										) : (
											<span className="text-slate-400">—</span>
										)}
									</div>
								</div>
							);
						})}
					</div>

					<Separator className="my-4" />

					{/* Price comparison */}
					<div className="grid grid-cols-3 gap-4 items-center">
						<div className="font-medium text-sm text-slate-700 dark:text-slate-300">
							Price
						</div>
						<div
							className={`text-center p-2 rounded ${
								component1.price !== null && component1.price !== undefined && component2.price !== null && component2.price !== undefined
									? component1.price < component2.price
										? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
										: component1.price > component2.price
										? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
										: ""
									: ""
							}`}
						>
							{component1.price !== null && component1.price !== undefined ? (
								<div className="flex items-center justify-center gap-1">
									${component1.price.toLocaleString()}
									{component2.price !== null && component2.price !== undefined && (
										component1.price < component2.price ? <CheckCircle className="h-4 w-4 text-green-600" /> :
										component1.price > component2.price ? <XCircle className="h-4 w-4 text-red-600" /> : null
									)}
								</div>
							) : (
								<span className="text-slate-400">Price not available</span>
							)}
						</div>
						<div
							className={`text-center p-2 rounded ${
								component1.price !== null && component1.price !== undefined && component2.price !== null && component2.price !== undefined
									? component2.price < component1.price
										? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
										: component2.price > component1.price
										? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
										: ""
									: ""
							}`}
						>
							{component2.price !== null && component2.price !== undefined ? (
								<div className="flex items-center justify-center gap-1">
									${component2.price.toLocaleString()}
									{component1.price !== null && component1.price !== undefined && (
										component2.price < component1.price ? <CheckCircle className="h-4 w-4 text-green-600" /> :
										component2.price > component1.price ? <XCircle className="h-4 w-4 text-red-600" /> : null
									)}
								</div>
							) : (
								<span className="text-slate-400">Price not available</span>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		);
	};

	return (
		<div className="min-h-screen bg-white dark:bg-slate-950">
			<Navbar />

			<main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
				{/* Header */}
				<div className="text-center mb-12">
					<Badge
						variant="secondary"
						className="mb-4 inline-flex gap-1.5 rounded-full px-4 py-1 text-sm font-medium"
					>
						<ArrowLeftRight className="h-3.5 w-3.5 text-blue-500" />
						Spec Comparison
					</Badge>
					<h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
						Compare PC Components
					</h1>
					<p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">
						Select two components of the same type to see a detailed side-by-side comparison of their specifications.
					</p>
				</div>

				{/* Controls */}
				<Card className="mb-8">
					<CardContent className="pt-6">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{/* Category Selection */}
							<div>
								<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
									Component Category
								</label>
								<Select value={selectedType} onValueChange={handleTypeChange}>
									<SelectTrigger>
										<SelectValue placeholder="Select category..." />
									</SelectTrigger>
									<SelectContent>
										{COMPONENT_TYPES.map((type) => (
											<SelectItem key={type.value} value={type.value}>
												{type.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Component 1 Selection */}
							<div>
								<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
									Component 1
								</label>
								<Select
									value={component1 ? (component1._id || component1.name) : ""}
									onValueChange={handleComponent1Change}
									disabled={!selectedType || loading}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select first component..." />
									</SelectTrigger>
									<SelectContent>
										{components.map((component) => (
											<SelectItem
												key={component._id || component.name}
												value={component._id || component.name}
											>
												{component.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Component 2 Selection */}
							<div>
								<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
									Component 2
								</label>
								<Select
									value={component2 ? (component2._id || component2.name) : ""}
									onValueChange={handleComponent2Change}
									disabled={!selectedType || loading}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select second component..." />
									</SelectTrigger>
									<SelectContent>
										{components.map((component) => (
											<SelectItem
												key={component._id || component.name}
												value={component._id || component.name}
											>
												{component.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Reset Button */}
						<div className="mt-4 flex justify-end">
							<Button
								variant="outline"
								onClick={handleReset}
								className="flex items-center gap-2"
							>
								<RotateCcw className="h-4 w-4" />
								Clear / Reset
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Loading State */}
				{loading && (
					<div className="flex justify-center py-12">
						<div className="flex items-center gap-2 text-slate-500">
							<Loader2 className="h-5 w-5 animate-spin" />
							Loading components...
						</div>
					</div>
				)}

				{/* Error State */}
				{error && (
					<Card className="mb-8 border-red-200 dark:border-red-800">
						<CardContent className="pt-6">
							<div className="text-center text-red-600 dark:text-red-400">
								<p className="mb-4">{error}</p>
								<Button
									variant="outline"
									onClick={() => fetchComponents(selectedType)}
									className="border-red-200 dark:border-red-800"
								>
									Retry
								</Button>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Comparison Table */}
				{renderComparisonTable()}
			</main>
		</div>
	);
}
