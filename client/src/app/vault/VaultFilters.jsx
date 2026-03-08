"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TYPES = [
	"CPU",
	"GPU",
	"RAM",
	"Storage",
	"Motherboard",
	"PSU",
	"Case",
	"Cooler",
];

const TYPE_COLORS = {
	CPU: "bg-blue-600/20 text-blue-400 border-blue-600/40 hover:bg-blue-600/30",
	GPU: "bg-purple-600/20 text-purple-400 border-purple-600/40 hover:bg-purple-600/30",
	RAM: "bg-green-600/20 text-green-400 border-green-600/40 hover:bg-green-600/30",
	Storage:
		"bg-yellow-600/20 text-yellow-400 border-yellow-600/40 hover:bg-yellow-600/30",
	Motherboard:
		"bg-red-600/20 text-red-400 border-red-600/40 hover:bg-red-600/30",
	PSU: "bg-orange-600/20 text-orange-400 border-orange-600/40 hover:bg-orange-600/30",
	Case: "bg-cyan-600/20 text-cyan-400 border-cyan-600/40 hover:bg-cyan-600/30",
	Cooler: "bg-sky-600/20 text-sky-400 border-sky-600/40 hover:bg-sky-600/30",
};

export { TYPE_COLORS };

export default function VaultFilters() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();

	const currentSearch = searchParams.get("search") ?? "";
	const currentType = searchParams.get("type") ?? "";

	const updateParams = useCallback(
		(updates) => {
			const params = new URLSearchParams(searchParams.toString());
			Object.entries(updates).forEach(([key, value]) => {
				if (value) {
					params.set(key, value);
				} else {
					params.delete(key);
				}
			});
			// Reset to page 1 whenever filters change
			params.delete("page");
			startTransition(() => {
				router.push(`${pathname}?${params.toString()}`);
			});
		},
		[router, pathname, searchParams],
	);

	function handleSearch(e) {
		const value = e.target.value;
		updateParams({ search: value });
	}

	function handleTypeToggle(type) {
		updateParams({ type: currentType === type ? "" : type });
	}

	function clearAll() {
		startTransition(() => {
			router.push(pathname);
		});
	}

	const hasFilters = currentSearch || currentType;

	return (
		<div className='space-y-4'>
			{/* Search bar */}
			<div className='relative'>
				<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none' />
				<Input
					type='search'
					placeholder='Search components… (e.g. Ryzen 9, RTX 4090)'
					defaultValue={currentSearch}
					onChange={handleSearch}
					className='pl-9 bg-gray-900 border-gray-700 focus-visible:ring-blue-500 text-white placeholder:text-gray-500'
				/>
				{isPending && (
					<span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 animate-pulse'>
						Loading…
					</span>
				)}
			</div>

			{/* Type pills */}
			<div className='flex flex-wrap items-center gap-2'>
				<SlidersHorizontal className='h-4 w-4 text-gray-500 shrink-0' />
				{TYPES.map((type) => {
					const isActive = currentType === type;
					return (
						<button
							key={type}
							onClick={() => handleTypeToggle(type)}
							className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors cursor-pointer ${
								isActive
									? TYPE_COLORS[type]
									: "bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500 hover:text-gray-200"
							}`}
						>
							{type}
						</button>
					);
				})}

				{hasFilters && (
					<Button
						variant='ghost'
						size='sm'
						onClick={clearAll}
						className='text-gray-500 hover:text-gray-200 h-7 px-2 gap-1'
					>
						<X className='h-3 w-3' />
						Clear
					</Button>
				)}
			</div>
		</div>
	);
}
