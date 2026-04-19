"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
	Loader2,
	Sparkles,
	AlertCircle,
	CheckCircle2,
	Zap,
	Cpu,
	MemoryStick,
	HardDrive,
	CircuitBoard,
	BatteryCharging,
	Box,
	Wind,
	TrendingUp,
	PackageOpen,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { aiApi } from "@/lib/api";
import { redirect } from "next/navigation";
import { useAuth } from "@/context/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const USE_CASES = [
	{ value: "gaming", label: "Gaming", icon: Zap },
	{ value: "productivity", label: "Productivity", icon: Cpu },
	{ value: "streaming", label: "Streaming", icon: TrendingUp },
	{ value: "video-editing", label: "Video Editing", icon: PackageOpen },
	{ value: "general-use", label: "General Use", icon: CheckCircle2 },
];

const RESOLUTIONS = [
	{ value: "1080p", label: "1080p (Full HD)" },
	{ value: "1440p", label: "1440p (QHD)" },
	{ value: "4K", label: "4K (Ultra HD)" },
];

const BRANDS = [
	"Intel",
	"AMD",
	"NVIDIA",
	"Kingston",
	"Corsair",
	"ASUS",
	"MSI",
	"Gigabyte",
	"Crucial",
	"Western Digital",
];

const COMPONENT_ICONS = {
	CPU: Cpu,
	GPU: Zap,
	RAM: MemoryStick,
	Storage: HardDrive,
	Motherboard: CircuitBoard,
	PSU: BatteryCharging,
	Case: Box,
	Cooler: Wind,
};

const COMPONENT_COLORS = {
	CPU: "bg-blue-600/20 text-blue-500 border-blue-600/40",
	GPU: "bg-purple-600/20 text-purple-500 border-purple-600/40",
	RAM: "bg-green-600/20 text-green-500 border-green-600/40",
	Storage: "bg-yellow-600/20 text-yellow-600 border-yellow-600/40",
	Motherboard: "bg-red-600/20 text-red-500 border-red-600/40",
	PSU: "bg-orange-600/20 text-orange-500 border-orange-600/40",
	Case: "bg-cyan-600/20 text-cyan-500 border-cyan-600/40",
	Cooler: "bg-sky-600/20 text-sky-500 border-sky-600/40",
};

export default function AIBuildMatcherPage() {
	const { user } = useAuth();

	const [formData, setFormData] = useState({
		budget: "",
		useCase: "",
		targetResolution: "",
		preferredBrands: [],
		extraNotes: "",
	});

	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState(null);
	const [error, setError] = useState(null);

	const handleBudgetChange = (e) => {
		const value = e.target.value.replace(/[^\d]/g, "");
		setFormData((prev) => ({
			...prev,
			budget: value ? parseInt(value) : "",
		}));
	};

	const handleUseCaseChange = (value) => {
		setFormData((prev) => ({
			...prev,
			useCase: prev.useCase === value ? "" : value,
		}));
	};

	const handleResolutionChange = (value) => {
		setFormData((prev) => ({
			...prev,
			targetResolution: prev.targetResolution === value ? "" : value,
		}));
	};

	const handleBrandToggle = (brand) => {
		setFormData((prev) => ({
			...prev,
			preferredBrands: prev.preferredBrands.includes(brand)
				? prev.preferredBrands.filter((b) => b !== brand)
				: [...prev.preferredBrands, brand],
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!user) {
			toast.error("You must be signed in to generate a build");
			return;
		}
		
		setError(null);
		setResult(null);

		// Validation
		if (!formData.budget || formData.budget < 500) {
			toast.error("Budget must be at least $500");
			return;
		}

		if (!formData.useCase) {
			toast.error("Please select a use case");
			return;
		}

		if (!formData.targetResolution) {
			toast.error("Please select a target resolution");
			return;
		}

		setLoading(true);

		try {
			const response = await fetch(`${API_URL}/api/ai-build-matcher`, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					budget: formData.budget,
					useCase: formData.useCase,
					targetResolution: formData.targetResolution,
					preferredBrands: formData.preferredBrands,
					extraNotes: formData.extraNotes,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to generate build");
			}

			if (data.success && data.data) {
				setResult(data.data);
				toast.success("Build generated successfully!");
			} else {
				throw new Error("Invalid response format");
			}
		} catch (err) {
			const errorMessage = err.message || "Failed to generate AI build match";
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const handleReset = () => {
		setFormData({
			budget: "",
			useCase: "",
			targetResolution: "",
			preferredBrands: [],
			extraNotes: "",
		});
		setResult(null);
		setError(null);
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-blue-950/30 dark:to-slate-950'>
			<Navbar />
			{!user && (
				<div className='bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4'>
					<p>Please sign in to use the AI Build Matcher.</p>
				</div>
			)}

			<main className='mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-16'>
				{/* Hero Section */}
				<div className='mb-12 text-center'>
					<div className='inline-flex items-center gap-2 mb-4 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full'>
						<Sparkles className='h-4 w-4 text-blue-600 dark:text-blue-400' />
						<span className='text-sm font-medium text-blue-600 dark:text-blue-400'>
							AI-Powered Recommendations
						</span>
					</div>

					<h1 className='text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4'>
						AI Build Matcher
					</h1>

					<p className='text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto'>
						Let our AI select the perfect PC components for your needs. Get a
						custom build tailored to your budget, use case, and performance
						targets.
					</p>
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
					{/* Form Section */}
					<div className='lg:col-span-1'>
						<Card className='h-fit border-slate-200 dark:border-slate-800 shadow-sm'>
							<CardHeader>
								<CardTitle>Build Preferences</CardTitle>
								<CardDescription>Tell us what you need</CardDescription>
							</CardHeader>

							<CardContent>
								<form onSubmit={handleSubmit} className='space-y-6'>
									{/* Budget */}
									<div className='space-y-2'>
										<Label htmlFor='budget' className='text-sm font-medium'>
											Budget (USD) *
										</Label>
										<div className='relative'>
											<span className='absolute left-3 top-2.5 text-slate-500'>
												$
											</span>
											<Input
												id='budget'
												type='text'
												inputMode='numeric'
												placeholder='2000'
												value={formData.budget}
												onChange={handleBudgetChange}
												className='pl-8'
												disabled={loading}
											/>
										</div>
										<p className='text-xs text-slate-500'>Minimum $500</p>
									</div>

									<Separator />

									{/* Use Case */}
									<div className='space-y-3'>
										<Label className='text-sm font-medium'>Use Case *</Label>
										<div className='grid grid-cols-2 gap-2'>
											{USE_CASES.map((uc) => {
												const Icon = uc.icon;
												return (
													<button
														key={uc.value}
														type='button'
														onClick={() => handleUseCaseChange(uc.value)}
														disabled={loading}
														className={`p-2 rounded-lg border-2 transition-all ${
															formData.useCase === uc.value
																? "border-blue-600 bg-blue-50 dark:bg-blue-900/30"
																: "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
														} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
													>
														<Icon className='h-5 w-5 mx-auto mb-1 text-slate-600 dark:text-slate-300' />
														<div className='text-xs font-medium text-slate-700 dark:text-slate-200'>
															{uc.label}
														</div>
													</button>
												);
											})}
										</div>
									</div>

									<Separator />

									{/* Target Resolution */}
									<div className='space-y-3'>
										<Label className='text-sm font-medium'>
											Target Resolution *
										</Label>
										<div className='space-y-2'>
											{RESOLUTIONS.map((res) => (
												<button
													key={res.value}
													type='button'
													onClick={() => handleResolutionChange(res.value)}
													disabled={loading}
													className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
														formData.targetResolution === res.value
															? "border-blue-600 bg-blue-50 dark:bg-blue-900/30"
															: "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
													} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
												>
													<div className='text-sm font-medium text-slate-900 dark:text-white'>
														{res.label}
													</div>
												</button>
											))}
										</div>
									</div>

									<Separator />

									{/* Preferred Brands */}
									<div className='space-y-3'>
										<Label className='text-sm font-medium'>
											Preferred Brands (Optional)
										</Label>
										<div className='flex flex-wrap gap-2'>
											{BRANDS.map((brand) => (
												<button
													key={brand}
													type='button'
													onClick={() => handleBrandToggle(brand)}
													disabled={loading}
													className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
														formData.preferredBrands.includes(brand)
															? "bg-blue-600 text-white border-blue-600"
															: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
													} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
												>
													{brand}
												</button>
											))}
										</div>
									</div>

									<Separator />

									{/* Extra Notes */}
									<div className='space-y-2'>
										<Label htmlFor='extraNotes' className='text-sm font-medium'>
											Extra Notes (Optional)
										</Label>
										<textarea
											id='extraNotes'
											placeholder='Any specific preferences or constraints...'
											value={formData.extraNotes}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													extraNotes: e.target.value,
												}))
											}
											disabled={loading}
											className='w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none'
											rows='3'
										/>
									</div>

									{/* Buttons */}
									<div className='flex flex-col gap-2 pt-2'>
										<Button
											type='submit'
											disabled={loading}
											className='w-full bg-blue-600 hover:bg-blue-700 text-white'
										>
											{loading ? (
												<>
													<Loader2 className='h-4 w-4 mr-2 animate-spin' />
													Generating Build...
												</>
											) : (
												<>
													<Sparkles className='h-4 w-4 mr-2' />
													Generate Build
												</>
											)}
										</Button>

										{(result || error) && (
											<Button
												type='button'
												variant='outline'
												onClick={handleReset}
												disabled={loading}
											>
												Reset & Start Over
											</Button>
										)}
									</div>
								</form>
							</CardContent>
						</Card>
					</div>

					{/* Results Section */}
					<div className='lg:col-span-2'>
						{loading && (
							<div className='h-full min-h-96 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50'>
								<Loader2 className='h-12 w-12 text-blue-600 dark:text-blue-400 animate-spin mb-4' />
								<p className='text-lg font-medium text-slate-600 dark:text-slate-300'>
									AI is analyzing the component catalog...
								</p>
								<p className='text-sm text-slate-500 dark:text-slate-400 mt-2'>
									This usually takes 10-30 seconds
								</p>
							</div>
						)}

						{error && !loading && (
							<Card className='border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20'>
								<CardContent className='pt-6'>
									<div className='flex gap-3'>
										<AlertCircle className='h-5 w-5 text-red-500 flex-shrink-0 mt-0.5' />
										<div>
											<h3 className='font-semibold text-red-900 dark:text-red-200'>
												Error Generating Build
											</h3>
											<p className='text-sm text-red-700 dark:text-red-300 mt-1'>
												{error}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						)}

						{result && !loading && (
							<div className='space-y-6'>
								{/* Build Summary */}
								<Card className='border-slate-200 dark:border-slate-800 shadow-sm'>
									<CardHeader>
										<div className='flex items-start justify-between'>
											<div>
												<CardTitle className='text-2xl'>
													{result.buildName}
												</CardTitle>
												<CardDescription className='mt-2'>
													{result.summary}
												</CardDescription>
											</div>
										</div>
									</CardHeader>

									<CardContent>
										<div className='mb-6 p-4 bg-gradient-to-r from-blue-50 to-slate-50 dark:from-blue-900/20 dark:to-slate-900/50 rounded-lg border border-blue-200 dark:border-blue-800'>
											<div className='text-sm text-slate-600 dark:text-slate-300 mb-1'>
												Estimated Total
											</div>
											<div className='text-4xl font-bold text-blue-600 dark:text-blue-400'>
												${result.estimatedTotal.toLocaleString()}
											</div>
										</div>

										{result.warnings && result.warnings.length > 0 && (
											<div className='mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg'>
												<div className='text-sm font-medium text-amber-900 dark:text-amber-200'>
													⚠️ Considerations:
												</div>
												<ul className='mt-2 space-y-1'>
													{result.warnings.map((warning, idx) => (
														<li
															key={idx}
															className='text-sm text-amber-800 dark:text-amber-300'
														>
															• {warning}
														</li>
													))}
												</ul>
											</div>
										)}
									</CardContent>
								</Card>

								{/* Selected Components */}
								<div className='space-y-3'>
									<h3 className='text-lg font-semibold text-slate-900 dark:text-white'>
										Selected Components
									</h3>

									<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
										{Object.entries(result.selectedParts).map(
											([type, part]) => {
												const Icon = COMPONENT_ICONS[type];
												const colorClass = COMPONENT_COLORS[type];

												return (
													<Card
														key={type}
														className='border-slate-200 dark:border-slate-800'
													>
														<CardContent className='pt-6'>
															<div className='flex items-start gap-4'>
																<div
																	className={`p-3 rounded-lg border ${colorClass}`}
																>
																	<Icon className='h-6 w-6' />
																</div>

																<div className='flex-1 min-w-0'>
																	<div className='text-xs font-medium text-slate-500 dark:text-slate-400 mb-1'>
																		{type}
																	</div>

																	<h4 className='font-semibold text-slate-900 dark:text-white text-sm line-clamp-2'>
																		{part.name}
																	</h4>

																	<p className='text-xs text-slate-500 dark:text-slate-400 mt-1'>
																		{part.brand}
																	</p>

																	<p className='text-lg font-bold text-blue-600 dark:text-blue-400 mt-2'>
																		${part.price.toLocaleString()}
																	</p>

																	<p className='text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed'>
																		{part.reason}
																	</p>
																</div>
															</div>
														</CardContent>
													</Card>
												);
											},
										)}
									</div>
								</div>

								{/* Reasoning */}
								{result.reasoning && result.reasoning.length > 0 && (
									<Card className='border-slate-200 dark:border-slate-800'>
										<CardHeader>
											<CardTitle className='text-base flex items-center gap-2'>
												<TrendingUp className='h-5 w-5 text-blue-600 dark:text-blue-400' />
												Build Reasoning
											</CardTitle>
										</CardHeader>

										<CardContent>
											<ul className='space-y-3'>
												{result.reasoning.map((reason, idx) => (
													<li key={idx} className='flex gap-3'>
														<div className='flex-shrink-0 mt-1'>
															<div className='flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-xs text-blue-600 dark:text-blue-400 font-semibold'>
																{idx + 1}
															</div>
														</div>
														<p className='text-sm text-slate-700 dark:text-slate-300'>
															{reason}
														</p>
													</li>
												))}
											</ul>
										</CardContent>
									</Card>
								)}
							</div>
						)}

						{!result && !loading && !error && (
							<div className='h-96 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50'>
								<Box className='h-12 w-12 text-slate-400 dark:text-slate-600 mb-3' />
								<p className='text-slate-600 dark:text-slate-400'>
									Fill in your preferences and click "Generate Build" to get
									started
								</p>
							</div>
						)}
					</div>
				</div>
			</main>
		</div>
	);
}
