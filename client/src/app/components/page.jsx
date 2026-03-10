"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
	Cpu,
	Zap,
	MemoryStick,
	HardDrive,
	CircuitBoard,
	BatteryCharging,
	Box,
	Wind,
	Search,
	X,
	ImageOff,
	Loader2,
	ChevronLeft,
	ChevronRight,
	PackageOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";

// ── Constants ────────────────────────────────────────────────────────────────
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const LIMIT = 24;

const TYPES = [
	{ label: "CPU", icon: Cpu },
	{ label: "GPU", icon: Zap },
	{ label: "RAM", icon: MemoryStick },
	{ label: "Storage", icon: HardDrive },
	{ label: "Motherboard", icon: CircuitBoard },
	{ label: "PSU", icon: BatteryCharging },
	{ label: "Case", icon: Box },
	{ label: "Cooler", icon: Wind },
];

const TYPE_COLORS = {
	CPU: "bg-blue-600/20 text-blue-500 border-blue-600/40",
	GPU: "bg-purple-600/20 text-purple-500 border-purple-600/40",
	RAM: "bg-green-600/20 text-green-500 border-green-600/40",
	Storage: "bg-yellow-600/20 text-yellow-600 border-yellow-600/40",
	Motherboard: "bg-red-600/20 text-red-500 border-red-600/40",
	PSU: "bg-orange-600/20 text-orange-500 border-orange-600/40",
	Case: "bg-cyan-600/20 text-cyan-500 border-cyan-600/40",
	Cooler: "bg-sky-600/20 text-sky-500 border-sky-600/40",
};

const TYPE_ACTIVE_COLORS = {
	CPU: "bg-blue-600 text-white border-transparent",
	GPU: "bg-purple-600 text-white border-transparent",
	RAM: "bg-green-600 text-white border-transparent",
	Storage: "bg-yellow-500 text-white border-transparent",
	Motherboard: "bg-red-600 text-white border-transparent",
	PSU: "bg-orange-500 text-white border-transparent",
	Case: "bg-cyan-600 text-white border-transparent",
	Cooler: "bg-sky-500 text-white border-transparent",
};

// ── Image per-card state ─────────────────────────────────────────────────────
// States: "idle" | "loading" | "loaded" | "error"

function formatSpecKey(key) {
	return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}

function formatSpecValue(val) {
	if (typeof val === "number") return val.toLocaleString();
	return String(val);
}

// ── Component card ───────────────────────────────────────────────────────────
function ComponentCard({ component, imageState }) {
	const { name, type, brand, specs = {}, price, imageUrl } = component;
	const [imgError, setImgError] = useState(false);

	const displayUrl = component._fetchedImageUrl ?? imageUrl;

	const visibleSpecs = Object.entries(specs ?? {})
		.filter(
			([k, v]) =>
				!["name", "price", "imageUrl", "type"].includes(k) &&
				v !== null &&
				v !== undefined &&
				v !== "",
		)
		.slice(0, 4);

	return (
		<div className='group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200'>
			{/* Image area */}
			<div className='relative aspect-video bg-slate-50 dark:bg-slate-800 overflow-hidden'>
				{imageState === "loading" ? (
					<div className='absolute inset-0 flex items-center justify-center'>
						<Loader2 className='h-8 w-8 text-slate-400 animate-spin' />
					</div>
				) : displayUrl && !imgError ? (
					<Image
						src={displayUrl}
						alt={name}
						fill
						sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
						className='object-contain p-2 group-hover:scale-105 transition-transform duration-300'
						onError={() => setImgError(true)}
						unoptimized
					/>
				) : (
					<div className='absolute inset-0 flex flex-col items-center justify-center gap-2'>
						<ImageOff className='h-8 w-8 text-slate-400 dark:text-slate-600' />
						<span className='text-xs text-slate-500 text-center px-4 line-clamp-2'>
							{name}
						</span>
					</div>
				)}
			</div>

			{/* Info */}
			<div className='flex flex-col flex-1 p-4 gap-3'>
				<div className='flex items-start justify-between gap-2'>
					<div>
						<p className='text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug'>
							{name}
						</p>
						<p className='text-xs text-slate-500 dark:text-slate-400 mt-0.5'>
							{brand}
						</p>
					</div>
					<Badge
						variant='outline'
						className={`shrink-0 text-xs font-medium border px-2 py-0.5 ${TYPE_COLORS[type] ?? ""}`}
					>
						{type}
					</Badge>
				</div>

				{visibleSpecs.length > 0 && (
					<>
						<Separator className='opacity-50' />
						<ul className='space-y-1.5'>
							{visibleSpecs.map(([key, val]) => (
								<li
									key={key}
									className='flex items-center justify-between text-xs'
								>
									<span className='text-slate-500 dark:text-slate-400 capitalize'>
										{formatSpecKey(key)}
									</span>
									<span className='text-slate-700 dark:text-slate-200 font-medium text-right max-w-[55%] truncate'>
										{formatSpecValue(val)}
									</span>
								</li>
							))}
						</ul>
					</>
				)}

				{price !== null && price !== undefined && (
					<div className='mt-auto pt-2 border-t border-slate-100 dark:border-slate-800'>
						<span className='text-sm font-bold text-slate-900 dark:text-white'>
							${price.toLocaleString()}
						</span>
					</div>
				)}
			</div>
		</div>
	);
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function CardSkeleton() {
	return (
		<div className='bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden animate-pulse'>
			<div className='aspect-video bg-slate-100 dark:bg-slate-800' />
			<div className='p-4 space-y-3'>
				<div className='h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4' />
				<div className='h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2' />
				<div className='space-y-2 pt-2'>
					<div className='h-3 bg-slate-100 dark:bg-slate-800 rounded w-full' />
					<div className='h-3 bg-slate-100 dark:bg-slate-800 rounded w-5/6' />
					<div className='h-3 bg-slate-100 dark:bg-slate-800 rounded w-4/6' />
				</div>
			</div>
		</div>
	);
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ComponentsPage() {
	const [activeType, setActiveType] = useState("CPU");
	const [search, setSearch] = useState("");
	const [inputValue, setInputValue] = useState("");
	const [page, setPage] = useState(1);

	const [components, setComponents] = useState([]);
	const [pagination, setPagination] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Per-component image fetch state: { [componentKey]: "idle"|"loading"|"loaded"|"error" }
	const [imageStates, setImageStates] = useState({});

	const debounceRef = useRef(null);
	// Tracks which components we've already started fetching images for
	const fetchedIdsRef = useRef(new Set());
	// Abort controller to cancel in-flight image fetches when type/page changes
	const abortRef = useRef(null);

	// ── Fetch components from the backend ──────────────────────────────────
	const fetchComponents = useCallback(async (type, searchVal, pageNum) => {
		setLoading(true);
		setError(null);
		setComponents([]);
		fetchedIdsRef.current = new Set();

		const params = new URLSearchParams();
		params.set("type", type);
		params.set("page", String(pageNum));
		params.set("limit", String(LIMIT));
		if (searchVal) params.set("search", searchVal);

		try {
			const res = await fetch(
				`${API_URL}/api/components?${params.toString()}`,
				{ credentials: "include" },
			);
			if (!res.ok) throw new Error("Failed to fetch components");
			const data = await res.json();
			setComponents(data.components ?? []);
			setPagination(data.pagination ?? null);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}, []);

	// ── On type / page / search change → re-fetch ──────────────────────────
	useEffect(() => {
		// Cancel any pending image fetches from the previous batch
		if (abortRef.current) abortRef.current.abort();
		abortRef.current = new AbortController();
		setImageStates({});
		fetchComponents(activeType, search, page);
	}, [activeType, search, page, fetchComponents]);

	// ── After components load → fetch missing images ───────────────────────
	useEffect(() => {
		if (loading || components.length === 0) return;

		const signal = abortRef.current?.signal;
		const missing = components.filter((c) => !c.imageUrl);
		if (missing.length === 0) return;

		// Mark them all as "loading" upfront
		setImageStates((prev) => {
			const next = { ...prev };
			for (const c of missing) {
				const key = c._id ?? c.name;
				if (!fetchedIdsRef.current.has(key)) {
					next[key] = "loading";
				}
			}
			return next;
		});

		// Fire all image fetches concurrently (capped to avoid quota exhaustion)
		const batch = missing.filter((c) => {
			const key = c._id ?? c.name;
			if (fetchedIdsRef.current.has(key)) return false;
			fetchedIdsRef.current.add(key);
			return true;
		});

		batch.forEach(async (component) => {
			const key = component._id ?? component.name;
			const q = encodeURIComponent(
				`${component.name} ${component.type} product photo`,
			);
			try {
				const res = await fetch(`/api/bing-image?q=${q}`, { signal });
				if (!res.ok) throw new Error("Image fetch failed");
				const { url } = await res.json();

				if (!url) throw new Error("No URL returned");

				// Update the component in state with the fetched image
				setComponents((prev) =>
					prev.map((c) =>
						(c._id ?? c.name) === key ? { ...c, _fetchedImageUrl: url } : c,
					),
				);
				setImageStates((prev) => ({ ...prev, [key]: "loaded" }));

				// Persist to DB if component has a real _id
				if (component._id) {
					fetch(`${API_URL}/api/components/${component._id}/image`, {
						method: "PUT",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ imageUrl: url }),
						credentials: "include",
					}).catch(() => {});
				}
			} catch (err) {
				if (err.name === "AbortError") return;
				setImageStates((prev) => ({ ...prev, [key]: "error" }));
			}
		});
	}, [components, loading]);

	// ── Type filter click ──────────────────────────────────────────────────
	function handleTypeChange(type) {
		if (type === activeType) return;
		setActiveType(type);
		setPage(1);
		setSearch("");
		setInputValue("");
	}

	// ── Search with debounce ───────────────────────────────────────────────
	function handleSearchInput(e) {
		const val = e.target.value;
		setInputValue(val);
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			setSearch(val);
			setPage(1);
		}, 400);
	}

	function clearSearch() {
		setInputValue("");
		setSearch("");
		setPage(1);
	}

	// ── Derived ────────────────────────────────────────────────────────────
	const totalPages = pagination?.pages ?? 1;

	return (
		<div className='min-h-screen bg-white dark:bg-slate-950'>
			<Navbar />

			<main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16'>
				{/* Header */}
				<div className='text-center mb-12'>
					<Badge
						variant='secondary'
						className='mb-4 inline-flex gap-1.5 rounded-full px-4 py-1 text-sm font-medium'
					>
						<Cpu className='h-3.5 w-3.5 text-blue-500' />
						Component Catalog
					</Badge>
					<h1 className='text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3'>
						Browse PC Components
					</h1>
					<p className='text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto'>
						Explore CPUs, GPUs, RAM, storage and more. Images are fetched and
						cached automatically.
					</p>
				</div>

				{/* Type filter tabs */}
				<div className='flex flex-wrap justify-center gap-2 mb-8'>
					{TYPES.map(({ label, icon: Icon }) => {
						const isActive = activeType === label;
						return (
							<button
								key={label}
								onClick={() => handleTypeChange(label)}
								className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-150 cursor-pointer ${
									isActive
										? TYPE_ACTIVE_COLORS[label]
										: `${TYPE_COLORS[label]} hover:opacity-80`
								}`}
							>
								<Icon className='h-4 w-4' />
								{label}
							</button>
						);
					})}
				</div>

				{/* Search */}
				<div className='relative max-w-md mx-auto mb-10'>
					<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none' />
					<Input
						value={inputValue}
						onChange={handleSearchInput}
						placeholder={`Search ${activeType}s…`}
						className='pl-9 pr-8'
					/>
					{inputValue && (
						<button
							onClick={clearSearch}
							className='absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600'
						>
							<X className='h-4 w-4' />
						</button>
					)}
				</div>

				{/* Results */}
				{error ? (
					<div className='text-center py-24'>
						<PackageOpen className='h-12 w-12 text-slate-400 mx-auto mb-4' />
						<p className='text-slate-500'>{error}</p>
						<Button
							variant='outline'
							className='mt-4'
							onClick={() => fetchComponents(activeType, search, page)}
						>
							Retry
						</Button>
					</div>
				) : loading ? (
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
						{Array.from({ length: 12 }).map((_, i) => (
							<CardSkeleton key={i} />
						))}
					</div>
				) : components.length === 0 ? (
					<div className='text-center py-24'>
						<PackageOpen className='h-12 w-12 text-slate-400 mx-auto mb-4' />
						<p className='text-slate-500'>No components found.</p>
					</div>
				) : (
					<>
						{pagination && (
							<p className='text-sm text-slate-500 dark:text-slate-400 mb-4 text-center'>
								{pagination.total.toLocaleString()} result
								{pagination.total !== 1 ? "s" : ""}
							</p>
						)}
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
							{components.map((c) => {
								const key = c._id ?? c.name;
								return (
									<ComponentCard
										key={key}
										component={c}
										imageState={
											imageStates[key] ?? (c.imageUrl ? "loaded" : "idle")
										}
									/>
								);
							})}
						</div>

						{/* Pagination */}
						{totalPages > 1 && (
							<div className='flex items-center justify-center gap-3 mt-12'>
								<button
									disabled={page <= 1}
									onClick={() => setPage((p) => p - 1)}
									className={`flex items-center gap-1 px-4 py-2 rounded-lg border text-sm transition-colors ${
										page <= 1
											? "pointer-events-none border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-700"
											: "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-white cursor-pointer"
									}`}
								>
									<ChevronLeft className='h-4 w-4' />
									Prev
								</button>
								<span className='text-sm text-slate-500 dark:text-slate-400'>
									Page {page} of {totalPages}
								</span>
								<button
									disabled={page >= totalPages}
									onClick={() => setPage((p) => p + 1)}
									className={`flex items-center gap-1 px-4 py-2 rounded-lg border text-sm transition-colors ${
										page >= totalPages
											? "pointer-events-none border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-700"
											: "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-white cursor-pointer"
									}`}
								>
									Next
									<ChevronRight className='h-4 w-4' />
								</button>
							</div>
						)}
					</>
				)}
			</main>
		</div>
	);
}
