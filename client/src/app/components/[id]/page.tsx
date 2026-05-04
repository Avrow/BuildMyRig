"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import { ChevronLeft, ImageOff, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function formatSpecKey(key: string) {
	return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}

function formatSpecValue(val: unknown) {
	if (typeof val === "number") return val.toLocaleString();
	return String(val);
}

type ComponentPrice = {
	source: string;
	price: number;
	url?: string;
	lastUpdated?: string;
};

type ComponentData = {
	_id?: string | null;
	name?: string;
	brand?: string;
	type?: string;
	imageUrl?: string | null;
	specs?: Record<string, unknown>;
	prices?: ComponentPrice[];
	price?: number | null;
	lastPriceUpdate?: string;
};

export default function ComponentDetailsPage() {
	const params = useParams();
	const rawId = params?.id;
	const componentName = useMemo(() => {
		const value = Array.isArray(rawId) ? rawId[0] : rawId;
		return value ? decodeURIComponent(value) : "";
	}, [rawId]);

	const [baseComponent, setBaseComponent] = useState<ComponentData | null>(
		null,
	);
	const [priceComponent, setPriceComponent] = useState<ComponentData | null>(
		null,
	);
	const [priceMessage, setPriceMessage] = useState<string | null>(null);
	const [loadingBase, setLoadingBase] = useState(false);
	const [loadingPrice, setLoadingPrice] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [fetchedImageUrl, setFetchedImageUrl] = useState<string | null>(null);
	const [imageState, setImageState] = useState<
		"idle" | "loading" | "loaded" | "error"
	>("idle");

	useEffect(() => {
		if (!componentName) return;
		setLoadingBase(true);
		setError(null);

		fetch(`${API_URL}/api/components/${encodeURIComponent(componentName)}`, {
			credentials: "include",
		})
			.then((res) => {
				if (!res.ok) throw new Error("Failed to fetch component details");
				return res.json();
			})
			.then((data) => {
				setBaseComponent(data?.component ?? null);
			})
			.catch((err) => {
				setError(err.message);
			})
			.finally(() => setLoadingBase(false));
	}, [componentName]);

	useEffect(() => {
		if (!componentName) return;
		setLoadingPrice(true);
		setError(null);

		const params = new URLSearchParams();
		params.set("name", componentName);

		fetch(`${API_URL}/api/components/price?${params.toString()}`, {
			credentials: "include",
		})
			.then((res) => {
				if (!res.ok) throw new Error("Failed to fetch real-time prices");
				return res.json();
			})
			.then((data) => {
				setPriceComponent(data?.component ?? null);
				setPriceMessage(data?.message ?? null);
			})
			.catch((err) => {
				setError(err.message);
			})
			.finally(() => setLoadingPrice(false));
	}, [componentName]);

	const mergedComponent = useMemo<ComponentData | null>(() => {
		if (!baseComponent && !priceComponent) return null;
		const baseSpecs = baseComponent?.specs;
		const priceSpecs = priceComponent?.specs;

		return {
			...(priceComponent ?? {}),
			...(baseComponent ?? {}),
			specs: baseSpecs ?? priceSpecs ?? {},
			imageUrl: baseComponent?.imageUrl ?? priceComponent?.imageUrl ?? null,
		};
	}, [baseComponent, priceComponent]);

	const displayImageUrl = fetchedImageUrl ?? mergedComponent?.imageUrl ?? null;

	useEffect(() => {
		if (!mergedComponent || displayImageUrl || imageState === "loading") return;
		setImageState("loading");

		const q = encodeURIComponent(
			`${componentName} ${mergedComponent.type ?? "component"} product photo`,
		);
		fetch(`/api/bing-image?q=${q}`)
			.then((res) => {
				if (!res.ok) throw new Error("Image fetch failed");
				return res.json();
			})
			.then((data) => {
				if (!data?.url) throw new Error("No image URL returned");
				setFetchedImageUrl(data.url);
				setImageState("loaded");

				if (mergedComponent?._id) {
					fetch(`${API_URL}/api/components/${mergedComponent._id}/image`, {
						method: "PATCH",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ imageUrl: data.url }),
						credentials: "include",
					}).catch(() => {});
				}
			})
			.catch(() => {
				setImageState("error");
			});
	}, [mergedComponent, componentName, displayImageUrl, imageState]);

	const prices = mergedComponent?.prices ?? [];
	const expectedSources = ["ryans", "startech"];
	const priceBySource = useMemo(() => {
		const map = new Map<string, ComponentPrice>();
		for (const entry of prices) {
			if (entry?.source) {
				map.set(entry.source.toLowerCase(), entry);
			}
		}
		return map;
	}, [prices]);
	const specs = mergedComponent?.specs ?? {};
	const visibleSpecs = Object.entries(specs)
		.filter(
			([k, v]) =>
				!["name", "price", "imageUrl", "type"].includes(k) &&
				v !== null &&
				v !== undefined &&
				v !== "",
		)
		.slice(0, 12);

	const isLoading = loadingBase || loadingPrice;

	return (
		<div className='min-h-screen bg-white dark:bg-slate-950'>
			<Navbar />
			<main className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14'>
				<div className='mb-6'>
					<Link href='/components'>
						<Button variant='outline' className='gap-2'>
							<ChevronLeft className='h-4 w-4' />
							Back to components
						</Button>
					</Link>
				</div>

				{error && !mergedComponent ? (
					<div className='text-center py-24'>
						<p className='text-slate-500'>{error}</p>
					</div>
				) : (
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
						<div className='rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden'>
							<div className='relative aspect-video bg-slate-50 dark:bg-slate-800'>
								{isLoading && !displayImageUrl ? (
									<div className='absolute inset-0 flex items-center justify-center'>
										<Loader2 className='h-8 w-8 text-slate-400 animate-spin' />
									</div>
								) : displayImageUrl ? (
									<Image
										src={displayImageUrl}
										alt={mergedComponent?.name ?? componentName}
										fill
										sizes='(max-width: 1024px) 100vw, 50vw'
										className='object-contain p-4'
										unoptimized
									/>
								) : (
									<div className='absolute inset-0 flex flex-col items-center justify-center gap-2'>
										<ImageOff className='h-8 w-8 text-slate-400 dark:text-slate-600' />
										<span className='text-xs text-slate-500 text-center px-4 line-clamp-2'>
											{mergedComponent?.name ?? componentName}
										</span>
									</div>
								)}
							</div>
						</div>

						<div className='flex flex-col gap-6'>
							<div>
								<div className='flex items-start justify-between gap-4'>
									<div>
										<h1 className='text-3xl font-bold text-slate-900 dark:text-white'>
											{mergedComponent?.name ?? componentName}
										</h1>
										<p className='text-slate-500 dark:text-slate-400 mt-1'>
											{mergedComponent?.brand ?? "Unknown brand"}
										</p>
									</div>
									{mergedComponent?.type && (
										<Badge variant='outline' className=''>
											{mergedComponent.type}
										</Badge>
									)}
								</div>
							</div>

							<div className='rounded-xl border border-slate-200 dark:border-slate-800 p-4'>
								<div className='flex items-center justify-between'>
									<h2 className='text-sm font-semibold text-slate-700 dark:text-slate-200'>
										Real-time prices
									</h2>
									{isLoading && (
										<Loader2 className='h-4 w-4 text-slate-400 animate-spin' />
									)}
								</div>
								{priceMessage && (
									<p className='text-xs text-slate-500 mt-1'>{priceMessage}</p>
								)}

								<Separator className='my-3' />

								<div className='space-y-2'>
									{expectedSources.map((source) => {
										const entry = priceBySource.get(source);
										return (
											<div
												key={source}
												className='flex items-center justify-between text-sm'
											>
												<span className='text-slate-600 dark:text-slate-300 capitalize'>
													{source}
												</span>
												{entry ? (
													<span className='font-semibold text-slate-900 dark:text-white'>
														BDT {entry.price.toLocaleString()}
													</span>
												) : (
													<span className='text-xs font-semibold text-slate-400'>
														Unavailable
													</span>
												)}
											</div>
										);
									})}
								</div>
							</div>

							<div className='rounded-xl border border-slate-200 dark:border-slate-800 p-4'>
								<h2 className='text-sm font-semibold text-slate-700 dark:text-slate-200'>
									Component details
								</h2>
								<Separator className='my-3' />
								{visibleSpecs.length === 0 ? (
									<p className='text-sm text-slate-500'>No specs available.</p>
								) : (
									<ul className='space-y-2'>
										{visibleSpecs.map(([key, val]) => (
											<li
												key={key}
												className='flex items-center justify-between text-sm'
											>
												<span className='text-slate-500 dark:text-slate-400'>
													{formatSpecKey(key)}
												</span>
												<span className='text-slate-900 dark:text-white font-medium text-right max-w-[60%] truncate'>
													{formatSpecValue(val)}
												</span>
											</li>
										))}
									</ul>
								)}
							</div>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
