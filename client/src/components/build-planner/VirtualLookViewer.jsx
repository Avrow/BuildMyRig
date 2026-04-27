"use client";

import Image from "next/image";
import { Sparkles, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBuildPlanner } from "@/context/buildPlanner";

export default function VirtualLookViewer() {
	const { selectedParts, virtualLookUrl, generatingLook, generateVirtualLook } =
		useBuildPlanner();

	const selectedKeyParts = selectedParts.filter((part) =>
		["Case", "GPU", "Cooler"].includes(part.type),
	);

	return (
		<section className='space-y-4 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/80'>
			<div className='space-y-1'>
				<h2 className='text-xl font-bold text-slate-900 dark:text-white'>Virtual Build Look</h2>
				<p className='text-sm text-slate-500 dark:text-slate-400'>
					Generate an AI mockup from your selected case, cooler and graphics card.
				</p>
			</div>

			<div className='overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900'>
				{generatingLook ? (
					<div className='flex aspect-video items-center justify-center'>
						<div className='text-center'>
							<Loader2 className='mx-auto mb-2 h-8 w-8 animate-spin text-blue-600' />
							<p className='text-sm text-slate-500'>Generating your virtual look...</p>
						</div>
					</div>
				) : virtualLookUrl ? (
					<div className='relative aspect-video'>
						<Image
							src={virtualLookUrl}
							alt='Generated virtual PC build look'
							fill
							unoptimized
							className='object-cover'
						/>
					</div>
				) : (
					<div className='flex aspect-video flex-col items-center justify-center gap-2 p-6 text-center text-slate-500'>
						<ImageIcon className='h-7 w-7' />
						<p className='text-sm'>
							No virtual look yet. Add parts and click generate.
						</p>
					</div>
				)}
			</div>

			{selectedKeyParts.length > 0 && (
				<div className='rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'>
					Using key visual parts: {selectedKeyParts.map((part) => part.type).join(", ")}.
				</div>
			)}

			<Button
				onClick={generateVirtualLook}
				disabled={generatingLook || selectedParts.length === 0}
				className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
			>
				{generatingLook ? (
					<Loader2 className='mr-2 h-4 w-4 animate-spin' />
				) : (
					<Sparkles className='mr-2 h-4 w-4' />
				)}
				Generate Virtual Look
			</Button>
		</section>
	);
}
