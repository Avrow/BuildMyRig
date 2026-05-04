"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MapPin, Phone, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function MarketplaceDetailsPage() {
	const params = useParams();
	const itemId = Array.isArray(params?.id) ? params.id[0] : params?.id;
	const [item, setItem] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!itemId) return;

		const fetchItem = async () => {
			try {
				const apiUrl =
					process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
				const res = await fetch(`${apiUrl}/api/marketplace/${itemId}`);

				if (!res.ok) {
					throw new Error("Item not found");
				}

				const data = await res.json();
				const payload = data?.data ?? data;
				setItem(payload || null);
			} catch (fetchError) {
				console.error("Failed to fetch item:", fetchError);
				setError("Unable to load this listing.");
			} finally {
				setLoading(false);
			}
		};

		fetchItem();
	}, [itemId]);

	if (loading) {
		return (
			<div className='min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center'>
				<div className='text-slate-500 font-bold animate-pulse'>
					Loading item...
				</div>
			</div>
		);
	}

	if (error || !item) {
		return (
			<div className='min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4'>
				<div className='text-slate-500 font-bold'>
					{error || "Item not found."}
				</div>
				<Button asChild variant='outline' className='rounded-full'>
					<Link href='/marketplace'>Back to Marketplace</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
			<div className='bg-white dark:bg-slate-900 border-b sticky top-0 z-10 px-6 py-4 shadow-sm'>
				<div className='max-w-6xl mx-auto flex items-center justify-between'>
					<div>
						<h1 className='text-xl font-black'>Marketplace Details</h1>
						<p className='text-xs text-slate-500'>Listing preview</p>
					</div>
					<Button asChild variant='outline' className='rounded-full'>
						<Link href='/marketplace'>Back</Link>
					</Button>
				</div>
			</div>

			<div className='max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10'>
				<div className='bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800'>
					<div className='relative aspect-[4/3] bg-slate-100'>
						<img
							src={
								item.imageUrl ||
								"https://via.placeholder.com/800x600?text=BuildMyRig"
							}
							alt={item.title}
							className='object-cover w-full h-full'
						/>
					</div>
					<div className='p-6'>
						<div className='flex flex-wrap items-center justify-between gap-4 mb-4'>
							<h2 className='text-2xl font-black'>{item.title}</h2>
							<Badge
								variant='outline'
								className='text-[11px] border-blue-200 text-blue-600 uppercase'
							>
								{item.type}
							</Badge>
						</div>
						<p className='text-3xl font-black text-blue-600 mb-4'>
							BDT {item.price?.toLocaleString()}
						</p>
						<p className='text-slate-600 dark:text-slate-300 leading-relaxed'>
							{item.description || "No description provided."}
						</p>
					</div>
				</div>

				<div className='bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 h-fit'>
					<h3 className='text-lg font-bold mb-4'>Seller Info</h3>
					<div className='space-y-3 text-sm text-slate-600 dark:text-slate-300'>
						<div className='flex items-center gap-2'>
							<Tag size={16} className='text-slate-400' />
							<span>{item.sellerName || "Enthusiast"}</span>
						</div>
						<div className='flex items-center gap-2'>
							<MapPin size={16} className='text-slate-400' />
							<span>{item.location || "Unknown"}</span>
						</div>
						<div className='flex items-center gap-2'>
							<Phone size={16} className='text-slate-400' />
							<span>{item.phone || "Not provided"}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
