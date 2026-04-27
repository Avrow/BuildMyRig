"use client";

import React, { useEffect, useState } from "react";
import { Plus, LayoutGrid } from "lucide-react";
import MarketplaceCard from "@/components/MarketplaceCard";
import CreateListingForm from "@/components/CreateListingForm";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function MarketplacePage() {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);

	const fetchItems = async () => {
		try {
			// URL logic: .env এ /api থাকলে এখানে ডাবল হবে না
			const apiUrl =
				process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
			const res = await fetch(`${apiUrl}/api/marketplace`);

			if (res.ok) {
				const data = await res.json();
				setItems(Array.isArray(data) ? data : []);
			}
		} catch (error) {
			console.error("Failed to fetch:", error);
			setItems([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchItems();
	}, []);

	return (
		<div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
			{/* Navbar Section */}
			<div className='bg-white dark:bg-slate-900 border-b sticky top-0 z-10 px-6 py-4 shadow-sm'>
				<div className='max-w-6xl mx-auto flex justify-between items-center'>
					<h1 className='text-xl font-black flex items-center gap-2'>
						<LayoutGrid className='text-blue-600' /> Marketplace
					</h1>

					<Dialog>
						<DialogTrigger asChild>
							<Button className='bg-blue-600 text-white rounded-full px-6 shadow-lg hover:bg-blue-700 transition-all'>
								<Plus size={18} className='mr-1' /> Create Listing
							</Button>
						</DialogTrigger>
						<DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
							<DialogHeader>
								<DialogTitle>Post Your Product</DialogTitle>
								<DialogDescription>
									Enter your PC component details below. Our AI will scan the
									image for safety.
								</DialogDescription>
							</DialogHeader>
							{/* Create Listing Form Component */}
							<CreateListingForm />
						</DialogContent>
					</Dialog>
				</div>
			</div>

			{/* Content Section */}
			<div className='max-w-6xl mx-auto p-6'>
				<h2 className='text-3xl font-bold mb-8'>Today{"'"}s Picks</h2>

				{loading ? (
					<div className='text-center py-20 font-bold text-slate-500 animate-pulse'>
						Connecting to server...
					</div>
				) : (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
						{items.length > 0 ? (
							items.map((item) => (
								<MarketplaceCard key={item._id} item={item} />
							))
						) : (
							<div className='col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white/50'>
								<p className='text-slate-500 mb-4'>
									No items found in the marketplace.
								</p>
								<Button
									variant='outline'
									onClick={fetchItems}
									className='rounded-full'
								>
									Refresh Marketplace
								</Button>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
