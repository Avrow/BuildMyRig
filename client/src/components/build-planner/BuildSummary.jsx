"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBuildPlanner } from "@/context/buildPlanner";

export default function BuildSummary() {
	const {
		categories,
		selectedByCategory,
		removePart,
		clearBuild,
		totalRequiredWattage,
		requiredWattageWithBuffer,
		suggestedPsuWattage,
		compatibilityWarnings,
		hasSelectedPsu,
		isPsuSufficient,
		hasPsuHeadroomWarning,
		psuWattage,
		virtualLookUrl,
	} = useBuildPlanner();

	const selectedCount = Object.keys(selectedByCategory).length;

	return (
		<section className='space-y-5 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/80'>
			<div className='space-y-1'>
				<h2 className='text-xl font-bold text-slate-900 dark:text-white'>Current Build</h2>
				<p className='text-sm text-slate-500 dark:text-slate-400'>
					Track selected parts, wattage and compatibility status.
				</p>
			</div>

			{selectedCount === 0 ? (
				<div className='rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'>
					Your build is empty, add some parts!
				</div>
			) : (
				<ul className='space-y-2'>
					{categories.map((category) => {
						const part = selectedByCategory[category];
						if (!part) return null;
						return (
							<li
								key={category}
								className='flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900'
							>
								<div className='min-w-0'>
									<div className='flex items-center gap-2'>
										<Badge variant='outline' className='text-[10px]'>
											{category}
										</Badge>
										<span className='text-xs text-slate-500'>
											${Number(part.price || 0).toLocaleString()}
										</span>
									</div>
									<p className='truncate text-sm font-medium text-slate-900 dark:text-white'>
										{part.name}
									</p>
								</div>
								<Button variant='ghost' size='sm' onClick={() => removePart(category)}>
									Remove
								</Button>
							</li>
						);
					})}
				</ul>
			)}

			<div className='space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900'>
				<div className='flex items-center justify-between text-sm'>
					<span className='text-slate-500'>Estimated Draw</span>
					<span className='font-semibold text-slate-900 dark:text-white'>
						{Math.round(totalRequiredWattage)}W
					</span>
				</div>
				<div className='flex items-center justify-between text-sm'>
					<span className='text-slate-500'>Required +20% buffer</span>
					<span className='font-semibold text-slate-900 dark:text-white'>
						{Math.round(requiredWattageWithBuffer)}W
					</span>
				</div>
				{psuWattage > 0 && (
					<div className='flex items-center justify-between text-sm'>
						<span className='text-slate-500'>Selected PSU</span>
						<span className='font-semibold text-slate-900 dark:text-white'>
							{Math.round(psuWattage)}W
						</span>
					</div>
				)}
			</div>

			<div className='space-y-2'>
				{!hasSelectedPsu && totalRequiredWattage > 0 && (
					<div className='rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300'>
						Estimated Draw: {Math.round(totalRequiredWattage)}W. Suggested PSU: {suggestedPsuWattage}W or higher.
					</div>
				)}

				{hasSelectedPsu && isPsuSufficient && (
					<div className='rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'>
						PSU capacity is sufficient.
					</div>
				)}

				{compatibilityWarnings.map((warning) => (
					<div
						key={warning}
						className='flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300'
					>
						<AlertTriangle className='mt-0.5 h-4 w-4 shrink-0' />
						<span>{warning}</span>
					</div>
				))}
				{hasPsuHeadroomWarning && (
					<div className='flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'>
						<AlertTriangle className='mt-0.5 h-4 w-4 shrink-0' />
						<span>
							Warning: Selected PSU may not provide enough power. Aim for at least {suggestedPsuWattage}W.
						</span>
					</div>
				)}
			</div>

			<div>
				<Button
					variant='outline'
					onClick={clearBuild}
					disabled={selectedCount === 0 && !virtualLookUrl}
					className='w-full'
				>
					<Trash2 className='mr-1.5 h-4 w-4' />
					Clear
				</Button>
			</div>
		</section>
	);
}
