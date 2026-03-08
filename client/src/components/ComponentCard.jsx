"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
	Cpu,
	Zap,
	Flame,
	CircuitBoard,
	MemoryStick,
	MonitorPlay,
	HardDrive,
	Tag,
	ImageOff,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// ── Type badge colour map (must match VaultFilters) ──────────────────────────
const TYPE_COLORS = {
	CPU: "bg-blue-600/20 text-blue-400 border-blue-600/40",
	GPU: "bg-purple-600/20 text-purple-400 border-purple-600/40",
	RAM: "bg-green-600/20 text-green-400 border-green-600/40",
	Storage: "bg-yellow-600/20 text-yellow-400 border-yellow-600/40",
	Motherboard: "bg-red-600/20 text-red-400 border-red-600/40",
	PSU: "bg-orange-600/20 text-orange-400 border-orange-600/40",
	Case: "bg-cyan-600/20 text-cyan-400 border-cyan-600/40",
	Cooler: "bg-sky-600/20 text-sky-400 border-sky-600/40",
};

// ── Icon per spec key ────────────────────────────────────────────────────────
const SPEC_ICONS = {
	cores: Cpu,
	threads: Cpu,
	baseClock: Zap,
	boostClock: Zap,
	tdp: Flame,
	socket: CircuitBoard,
	cache: MemoryStick,
	architecture: MonitorPlay,
	capacity: HardDrive,
};

function SpecIcon({ specKey }) {
	const Icon = SPEC_ICONS[specKey] ?? Tag;
	return <Icon className='h-3.5 w-3.5 shrink-0 text-gray-500' />;
}

// ── Skeleton image placeholder ───────────────────────────────────────────────
function ImageSkeleton() {
	return (
		<div className='aspect-video bg-gray-800 animate-pulse flex items-center justify-center'>
			<span className='text-gray-600 text-xs'>Loading image…</span>
		</div>
	);
}

// ── Image error fallback ─────────────────────────────────────────────────────
function ImageFallback({ name }) {
	return (
		<div className='aspect-video bg-gray-800 flex flex-col items-center justify-center gap-2'>
			<ImageOff className='h-8 w-8 text-gray-600' />
			<span className='text-xs text-gray-600 text-center px-4 line-clamp-2'>
				{name}
			</span>
		</div>
	);
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatSpecKey(key) {
	return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}

function formatSpecValue(value) {
	if (typeof value === "number") return value.toLocaleString();
	return String(value);
}

// ── Main component ───────────────────────────────────────────────────────────
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ComponentCard({ component }) {
	const { _id, name, type, brand, specs = {}, price, imageUrl } = component;

	const [imgSrc, setImgSrc] = useState(imageUrl ?? null);
	const [imgLoading, setImgLoading] = useState(!imageUrl);
	const [imgError, setImgError] = useState(false);

	// Prevent double-fetch in React Strict Mode / concurrent renders
	const hasFetched = useRef(false);

	useEffect(() => {
		if (imageUrl || hasFetched.current) return;
		hasFetched.current = true;

		async function loadImage() {
			try {
				// 1. Fetch image URL from our server-side Bing proxy
				const searchQuery = `${name} ${type} product box`;
				const res = await fetch(
					`/api/bing-image?q=${encodeURIComponent(searchQuery)}`,
				);

				if (!res.ok) throw new Error("No image returned");

				const { url } = await res.json();
				setImgSrc(url);

				// 2. Persist the URL to MongoDB so future users see it instantly
				fetch(`${API_URL}/api/components/${_id}/image`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ imageUrl: url }),
				}).catch((err) =>
					console.warn("[ComponentCard] Failed to persist imageUrl:", err),
				);
			} catch {
				setImgError(true);
			} finally {
				setImgLoading(false);
			}
		}

		loadImage();
	}, [_id, name, type, imageUrl]);

	// Show only a subset of specs to keep the card readable (max 4)
	const specEntries = Object.entries(specs).slice(0, 4);

	return (
		<article className='bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-blue-950/40 group flex flex-col'>
			{/* ── Image area ── */}
			{imgLoading ? (
				<ImageSkeleton />
			) : imgError || !imgSrc ? (
				<ImageFallback name={name} />
			) : (
				<div className='aspect-video relative overflow-hidden bg-gray-800'>
					<Image
						src={imgSrc}
						alt={`${name} product photo`}
						fill
						unoptimized
						className='object-cover group-hover:scale-105 transition-transform duration-500'
						loading='lazy'
						onError={() => {
							setImgError(true);
							setImgSrc(null);
						}}
					/>
				</div>
			)}

			<div className='p-4 flex flex-col flex-1 gap-3'>
				{/* ── Header ── */}
				<div className='space-y-1.5'>
					<div className='flex items-start justify-between gap-2'>
						<Badge
							className={`text-[10px] font-semibold tracking-wide border shrink-0 ${TYPE_COLORS[type] ?? "bg-gray-700 text-gray-300 border-gray-600"}`}
						>
							{type}
						</Badge>
						{price != null && (
							<span className='text-sm font-bold text-white'>
								${price.toLocaleString()}
							</span>
						)}
					</div>

					<h3 className='font-semibold text-sm leading-snug line-clamp-2 text-white'>
						{name}
					</h3>
					<p className='text-xs text-gray-500'>{brand}</p>
				</div>

				{/* ── Specs ── */}
				{specEntries.length > 0 && (
					<>
						<Separator className='bg-gray-800' />
						<ul className='space-y-1.5 flex-1'>
							{specEntries.map(([key, value]) => (
								<li
									key={key}
									className='flex items-center gap-2 text-xs text-gray-400 min-w-0'
								>
									<SpecIcon specKey={key} />
									<span className='text-gray-600 shrink-0'>
										{formatSpecKey(key)}:
									</span>
									<span className='truncate text-gray-300'>
										{formatSpecValue(value)}
									</span>
								</li>
							))}
						</ul>
					</>
				)}
			</div>
		</article>
	);
}
