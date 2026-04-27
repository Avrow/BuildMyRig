"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Check, ImageOff } from "lucide-react";

const TYPE_COLORS = {
	CPU: "bg-blue-600/20 text-blue-600 border-blue-600/30",
	GPU: "bg-violet-600/20 text-violet-600 border-violet-600/30",
	RAM: "bg-emerald-600/20 text-emerald-600 border-emerald-600/30",
	Storage: "bg-amber-600/20 text-amber-600 border-amber-600/30",
	Motherboard: "bg-rose-600/20 text-rose-600 border-rose-600/30",
	PSU: "bg-orange-600/20 text-orange-600 border-orange-600/30",
	Case: "bg-cyan-600/20 text-cyan-600 border-cyan-600/30",
	Cooler: "bg-sky-600/20 text-sky-600 border-sky-600/30",
};

function formatSpecValue(value) {
	if (typeof value === "number") return value.toLocaleString();
	return String(value);
}

export default function PartCard({ part, isSelected, onAdd, onRemove }) {
	const [imgError, setImgError] = useState(false);
	const visibleSpecs = Object.entries(part.specs || {})
		.filter(([, value]) => value !== null && value !== undefined && value !== "")
		.slice(0, 3);

	return (
		<article className='group rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900'>
			<div className='relative aspect-video overflow-hidden rounded-t-2xl bg-slate-100 dark:bg-slate-800'>
				{part.imageUrl && !imgError ? (
					<Image
						src={part.imageUrl}
						alt={part.name}
						fill
						unoptimized
						className='object-contain p-3 transition-transform duration-300 group-hover:scale-105'
						onError={() => setImgError(true)}
					/>
				) : (
					<div className='flex h-full flex-col items-center justify-center gap-2 text-slate-500'>
						<ImageOff className='h-6 w-6' />
						<span className='px-3 text-center text-xs'>{part.name}</span>
					</div>
				)}
			</div>

			<div className='space-y-3 p-4'>
				<div className='flex items-start justify-between gap-2'>
					<div>
						<p className='line-clamp-2 text-sm font-semibold text-slate-900 dark:text-white'>
							{part.name}
						</p>
						<p className='text-xs text-slate-500 dark:text-slate-400'>{part.brand}</p>
					</div>
					<Badge variant='outline' className={TYPE_COLORS[part.type] || ""}>
						{part.type}
					</Badge>
				</div>

				{visibleSpecs.length > 0 && (
					<ul className='space-y-1'>
						{visibleSpecs.map(([key, value]) => (
							<li key={key} className='text-xs text-slate-600 dark:text-slate-300'>
								<span className='mr-1 capitalize text-slate-400'>{key}:</span>
								{formatSpecValue(value)}
							</li>
						))}
					</ul>
				)}

				<div className='flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800'>
					<span className='text-base font-bold text-slate-900 dark:text-white'>
						${Number(part.price || 0).toLocaleString()}
					</span>

					{isSelected ? (
						<Button
							variant='outline'
							size='sm'
							onClick={() => onRemove(part.type)}
							className='border-emerald-300 text-emerald-700 hover:bg-emerald-50'
						>
							<Check className='mr-1 h-4 w-4' />
							Selected
						</Button>
					) : (
						<Button size='sm' onClick={() => onAdd(part)}>
							<Plus className='mr-1 h-4 w-4' />
							Add
						</Button>
					)}
				</div>
			</div>
		</article>
	);
}
