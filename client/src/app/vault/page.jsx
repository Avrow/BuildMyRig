import { Suspense } from "react";
import { ChevronLeft, ChevronRight, PackageOpen } from "lucide-react";
import Link from "next/link";

import ComponentCard from "@/components/ComponentCard";
import VaultFilters from "./VaultFilters";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { fetchSerperImage } from "@/lib/fetchBingImage";



// Always fetch live so search/filter/pagination works correctly
export const dynamic = "force-dynamic";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchComponents({ search, type, page, limit = 24 }) {
	const params = new URLSearchParams();
	if (search) params.set("search", search);
	if (type) params.set("type", type);
	if (page && page !== "1") params.set("page", page);
	params.set("limit", String(limit));

	const res = await fetch(`${API_URL}/api/components?${params.toString()}`, {
		cache: "no-store",
	});

	if (!res.ok) throw new Error("Failed to fetch components from API");
	return res.json();
}

/**
 * For every component on the current page that has no imageUrl yet:
 *  1. Call Serper to get an image URL
 *  2. Persist it to MongoDB via the Express API (fire-and-forget)
 *  3. Return the enriched component list so the first render already has images
 */
async function enrichWithImages(components) {
	const missing = components.filter((c) => !c.imageUrl);
	if (missing.length === 0) return components;

	const results = await Promise.allSettled(
		missing.map(async (c) => {
			const imageUrl = await fetchSerperImage(
				`${c.name} ${c.type} product photo`,
			);
			if (imageUrl) {
				// Persist asynchronously – don't block the render on this
				fetch(`${API_URL}/api/components/${c._id}/image`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ imageUrl }),
				}).catch(() => {});
			}
			return { _id: c._id, imageUrl: imageUrl ?? null };
		}),
	);

	// Build a lookup of newly fetched URLs
	const imageMap = {};
	for (const r of results) {
		if (r.status === "fulfilled" && r.value.imageUrl) {
			imageMap[r.value._id] = r.value.imageUrl;
		}
	}

	return components.map((c) => ({
		...c,
		imageUrl: c.imageUrl ?? imageMap[c._id] ?? null,
	}));
}

// ── Card skeleton for Suspense fallback ─────────────────────────────────────
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

// ── Pagination controls ──────────────────────────────────────────────────────
function Pagination({ pagination, searchParams }) {
	const { page, pages, total } = pagination;

	function pageHref(p) {
		const params = new URLSearchParams(searchParams);
		params.set("page", String(p));
		return `/vault?${params.toString()}`;
	}

	if (pages <= 1) return null;

	return (
		<div className='flex items-center justify-center gap-3 mt-12'>
			<Link
				href={pageHref(page - 1)}
				aria-disabled={page <= 1}
				className={`flex items-center gap-1 px-4 py-2 rounded-lg border text-sm transition-colors ${
					page <= 1
						? "pointer-events-none border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-700"
						: "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-white"
				}`}
			>
				<ChevronLeft className='h-4 w-4' />
				Prev
			</Link>

			<span className='text-sm text-slate-500'>
				Page {page} of {pages} &nbsp;·&nbsp; {total} components
			</span>

			<Link
				href={pageHref(page + 1)}
				aria-disabled={page >= pages}
				className={`flex items-center gap-1 px-4 py-2 rounded-lg border text-sm transition-colors ${
					page >= pages
						? "pointer-events-none border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-700"
						: "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-white"
				}`}
			>
				Next
				<ChevronRight className='h-4 w-4' />
			</Link>
		</div>
	);
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function VaultPage({ searchParams }) {
	const params = await searchParams;
	const search = params?.search ?? "";
	const type = params?.type ?? "";
	const page = params?.page ?? "1";

	let data = { components: [], pagination: { total: 0, page: 1, pages: 0 } };
	let error = null;

	try {
		data = await fetchComponents({ search, type, page });
		data.components = await enrichWithImages(data.components);
	} catch (err) {
		error = err.message;
	}

	const { components, pagination } = data;

	return (
		<div className='min-h-screen bg-white dark:bg-slate-950'>
			<Navbar />
			<main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16'>
				{/* ── Hero ── */}
				<div className='text-center mb-14'>
					<Badge
						variant='secondary'
						className='mb-4 inline-flex gap-1.5 rounded-full px-4 py-1 text-sm font-medium'
					>
						<PackageOpen className='h-3.5 w-3.5 text-blue-500' />
						Component Vault
					</Badge>
					<h1 className='text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3'>
						PC Parts Catalog
					</h1>
					<p className='text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto leading-relaxed'>
						Browse CPUs, GPUs, RAM, and more. Filter, search, and discover specs
						for every component in your dream build.
					</p>
				</div>

				{/* ── Filters ── */}
				<div className='mb-10 max-w-3xl mx-auto'>
					<Suspense>
						<VaultFilters />
					</Suspense>
				</div>

				{/* ── Error state ── */}
				{error && (
					<div className='text-center py-20 space-y-2'>
						<p className='text-red-500 font-semibold'>
							Could not load components
						</p>
						<p className='text-slate-500 text-sm'>{error}</p>
					</div>
				)}

				{/* ── Empty state ── */}
				{!error && components.length === 0 && (
					<div className='text-center py-28 space-y-4'>
						<PackageOpen className='mx-auto h-12 w-12 text-slate-400 dark:text-slate-600' />
						<p className='text-xl font-semibold text-slate-500 dark:text-slate-400'>
							No components found
						</p>
						<p className='text-slate-500 text-sm'>
							Try a different search term or clear the type filter.
						</p>
					</div>
				)}

				{/* ── Grid ── */}
				{!error && components.length > 0 && (
					<>
						<p className='text-xs text-slate-400 mb-6 uppercase tracking-widest'>
							{pagination.total} component
							{pagination.total !== 1 ? "s" : ""}
						</p>

						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
							{components.map((component) => (
								<ComponentCard key={component._id} component={component} />
							))}
						</div>

						<Pagination
							pagination={pagination}
							searchParams={new URLSearchParams(
								Object.fromEntries(
									Object.entries({ search, type, page }).filter(([, v]) => v),
								),
							).toString()}
						/>
					</>
				)}
			</main>
		</div>
	);
}
