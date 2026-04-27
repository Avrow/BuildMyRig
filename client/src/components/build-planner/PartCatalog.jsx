"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Loader2, Cpu, Zap, CircuitBoard, MemoryStick, HardDrive, BatteryCharging, Box, Wind } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PartCard from "@/components/build-planner/PartCard";
import { useBuildPlanner } from "@/context/buildPlanner";

const CATEGORY_ICONS = {
	CPU: Cpu,
	GPU: Zap,
	Motherboard: CircuitBoard,
	RAM: MemoryStick,
	Storage: HardDrive,
	PSU: BatteryCharging,
	Case: Box,
	Cooler: Wind,
};

function CatalogSkeleton() {
	return (
		<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
			{Array.from({ length: 6 }).map((_, idx) => (
				<div
					key={idx}
					className='animate-pulse rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900'
				>
					<div className='mb-3 aspect-video rounded-xl bg-slate-100 dark:bg-slate-800' />
					<div className='mb-2 h-4 w-4/5 rounded bg-slate-100 dark:bg-slate-800' />
					<div className='mb-2 h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800' />
					<div className='h-3 w-3/4 rounded bg-slate-100 dark:bg-slate-800' />
				</div>
			))}
		</div>
	);
}

export default function PartCatalog() {
	const {
		categories,
		activeCategory,
		setActiveCategory,
		searchQuery,
		setSearchQuery,
		catalogParts,
		catalogLoading,
		catalogError,
		fetchParts,
		selectedByCategory,
		addPart,
		removePart,
	} = useBuildPlanner();

	const [localSearch, setLocalSearch] = useState(searchQuery);

	useEffect(() => {
		const timer = setTimeout(() => {
			setSearchQuery(localSearch);
		}, 350);
		return () => clearTimeout(timer);
	}, [localSearch, setSearchQuery]);

	useEffect(() => {
		fetchParts(activeCategory, searchQuery);
	}, [activeCategory, searchQuery, fetchParts]);

	const sectionTitle = useMemo(
		() => `${activeCategory} Catalog`,
		[activeCategory],
	);

	return (
		<section className='space-y-5 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/80'>
			<div className='space-y-1'>
				<h2 className='text-xl font-bold text-slate-900 dark:text-white'>Part Catalog</h2>
				<p className='text-sm text-slate-500 dark:text-slate-400'>
					Browse the catalog and add exactly one part per category to your build.
				</p>
			</div>

			<div className='relative'>
				<Search className='pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400' />
				<Input
					value={localSearch}
					onChange={(event) => setLocalSearch(event.target.value)}
					placeholder='Search by name or brand...'
					className='pl-9'
				/>
			</div>

			<div className='flex flex-wrap gap-2'>
				{categories.map((category) => {
					const Icon = CATEGORY_ICONS[category];
					const isActive = category === activeCategory;
					return (
						<Button
							key={category}
							variant={isActive ? "default" : "outline"}
							size='sm'
							onClick={() => setActiveCategory(category)}
							className='rounded-full'
						>
							<Icon className='mr-1.5 h-4 w-4' />
							{category}
						</Button>
					);
				})}
			</div>

			<div className='flex items-center justify-between'>
				<p className='text-sm font-medium text-slate-700 dark:text-slate-200'>{sectionTitle}</p>
				{catalogLoading && <Loader2 className='h-4 w-4 animate-spin text-blue-600' />}
			</div>

			{catalogLoading ? (
				<CatalogSkeleton />
			) : catalogError ? (
				<div className='rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300'>
					{catalogError}
				</div>
			) : catalogParts.length === 0 ? (
				<div className='rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'>
					No components found for this category and search.
				</div>
			) : (
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
					{catalogParts.map((part) => (
						// JSON fallback items may not have _id, so also compare by name.
						<PartCard
							key={part._id || `${part.type}-${part.name}`}
							part={part}
							isSelected={
								Boolean(
									selectedByCategory[part.type] &&
										((selectedByCategory[part.type]?._id &&
											selectedByCategory[part.type]._id === part._id) ||
											selectedByCategory[part.type].name === part.name),
								)
							}
							onAdd={addPart}
							onRemove={removePart}
						/>
					))}
				</div>
			)}
		</section>
	);
}
