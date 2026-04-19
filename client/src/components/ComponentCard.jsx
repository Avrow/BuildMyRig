"use client";

import { useState } from "react";
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
	CPU: "bg-blue-600/20 text-blue-500 dark:text-blue-400 border-blue-600/40",
	GPU: "bg-purple-600/20 text-purple-500 dark:text-purple-400 border-purple-600/40",
	RAM: "bg-green-600/20 text-green-500 dark:text-green-400 border-green-600/40",
	Storage:
		"bg-yellow-600/20 text-yellow-600 dark:text-yellow-400 border-yellow-600/40",
	Motherboard: "bg-red-600/20 text-red-500 dark:text-red-400 border-red-600/40",
	PSU: "bg-orange-600/20 text-orange-500 dark:text-orange-400 border-orange-600/40",
	Case: "bg-cyan-600/20 text-cyan-500 dark:text-cyan-400 border-cyan-600/40",
	Cooler: "bg-sky-600/20 text-sky-500 dark:text-sky-400 border-sky-600/40",
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
	return (
		<Icon className='h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500' />
	);
}

// ── Image error fallback ─────────────────────────────────────────────────────
function ImageFallback({ name }) {
	return (
		<div className='aspect-video bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center gap-2'>
			<ImageOff className='h-8 w-8 text-slate-400 dark:text-slate-600' />
			<span className='text-xs text-slate-500 dark:text-slate-400 text-center px-4 line-clamp-2'>
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
export default function ComponentCard({ component }) {
	const { name, type, brand, specs = {}, price, imageUrl } = component;

	const [imgError, setImgError] = useState(false);

	// Show only a subset of specs to keep the card readable (max 4)
	const specEntries = Object.entries(specs).slice(0, 4);

	return (
		<article className='bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-blue-900/10 group flex flex-col'>
			{/* ── Image area ── */}
			{imgError || !imageUrl ? (
				<ImageFallback name={name} />
			) : (
				<div className='aspect-video relative overflow-hidden bg-slate-100 dark:bg-slate-800'>
					<Image
						src={imageUrl}
						alt={`${name} product photo`}
						fill
						unoptimized
						className='object-cover group-hover:scale-105 transition-transform duration-500'
						loading='lazy'
						onError={() => setImgError(true)}
					/>
				</div>
			)}

			<div className='p-4 flex flex-col flex-1 gap-3'>
				{/* ── Header ── */}
				<div className='space-y-1.5'>
					<div className='flex items-start justify-between gap-2'>
						<Badge
							className={`text-[10px] font-semibold tracking-wide border shrink-0 ${TYPE_COLORS[type] ?? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600"}`}
						>
							{type}
						</Badge>
						{price != null && (
							<span className='text-sm font-bold text-slate-900 dark:text-white'>
								${price.toLocaleString()}
							</span>
						)}
					</div>

					<h3 className='font-semibold text-sm leading-snug line-clamp-2 text-slate-900 dark:text-white'>
						{name}
					</h3>
					<p className='text-xs text-slate-500 dark:text-slate-400'>{brand}</p>
				</div>

				{/* ── Specs ── */}
				{specEntries.length > 0 && (
					<>
						<Separator className='bg-slate-200 dark:bg-slate-800' />
						<ul className='space-y-1.5 flex-1'>
							{specEntries.map(([key, value]) => (
								<li
									key={key}
									className='flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 min-w-0'
								>
									<SpecIcon specKey={key} />
									<span className='text-slate-400 dark:text-slate-500 shrink-0'>
										{formatSpecKey(key)}:
									</span>
									<span className='truncate text-slate-700 dark:text-slate-300'>
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
