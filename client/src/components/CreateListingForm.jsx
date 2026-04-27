"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UploadButton } from "@uploadthing/react";
import { Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";

const CreateListingForm = () => {
	const [type, setType] = useState("component");
	const [loading, setLoading] = useState(false);
	const [imageUrl, setImageUrl] = useState("");
	const [violationMsg, setViolationMsg] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setViolationMsg("");

		// ✅ FIX: store form reference BEFORE await
		const form = e.currentTarget;
		const formData = new FormData(form);

		if (!imageUrl) {
			toast.error("Please upload an image first!");
			setLoading(false);
			return;
		}

		const payload = {
			type,
			image: imageUrl,
			title: String(formData.get("title") || ""),
			price: Number(formData.get("price")),
			location: String(formData.get("location") || ""),
			sellerName: String(formData.get("sellerName") || ""),
			phone: String(formData.get("phone") || ""),
			description: String(formData.get("description") || ""),
		};

		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/api/marketplace`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(payload),
				},
			);

			const data = await res.json();
			console.log(data);

			if (res.ok) {
				toast.success("Post published successfully!");
				setImageUrl("");
				form.reset();
			} else if (data?.violation) {
				setViolationMsg(data.message || data.error);
				toast.error("AI: Image Rejected!");
			} else {
				toast.error(data?.error || "Submission failed");
			}
		} catch (err) {
			console.log(err);
			toast.error("Server connection failed!");
		} finally {
			setLoading(false);
		}
	};;

	return (
		<form
			onSubmit={handleSubmit}
			className='space-y-4 p-3 bg-white dark:bg-slate-900 rounded-xl'
		>
			{/* TYPE SELECT */}
			<div className='flex gap-2'>
				<Button
					type='button'
					variant={type === "component" ? "default" : "outline"}
					className='flex-1 rounded-full font-bold'
					onClick={() => setType("component")}
				>
					Component
				</Button>

				<Button
					type='button'
					variant={type === "full-build" ? "default" : "outline"}
					className='flex-1 rounded-full font-bold'
					onClick={() => setType("full-build")}
				>
					Full Build
				</Button>
			</div>

			{/* VIOLATION */}
			{violationMsg && (
				<div className='bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2 text-xs font-bold animate-pulse'>
					<XCircle size={16} />
					{violationMsg}
				</div>
			)}

			{/* IMAGE UPLOAD */}
			<div className='space-y-2'>
				<Label className='text-sm font-bold'>Product Photo *</Label>

				{imageUrl ? (
					<div className='relative h-44 rounded-2xl overflow-hidden border'>
						<img
							src={imageUrl}
							className='w-full h-full object-cover'
							alt='uploaded'
						/>
						<button
							type='button'
							onClick={() => setImageUrl("")}
							className='absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full'
						>
							✕
						</button>
					</div>
				) : (
					<UploadButton
						endpoint='imageUploader'
						onClientUploadComplete={(res) => {
							if (!res?.[0]?.ufsUrl) {
								toast.error("Upload failed!");
								return;
							}
							setImageUrl(res[0].ufsUrl);
							toast.success("Image uploaded successfully!");
						}}
						onUploadError={() => {
							toast.error("Image upload failed!");
						}}
					/>
				)}
			</div>

			{/* FORM FIELDS */}
			<div className='grid gap-3'>
				<Input name='title' placeholder='e.g. RTX 3060 MSI Gaming X' required />

				<div className='grid grid-cols-2 gap-2'>
					<Input
						name='price'
						type='number'
						placeholder='Price (BDT)'
						required
					/>
					<Input name='location' placeholder='Your City' required />
				</div>

				<Input name='sellerName' placeholder='Seller Name' required />

				<Input name='phone' placeholder='Phone Number' required />

				<textarea
					name='description'
					className='w-full border p-3 rounded-xl h-20 text-sm bg-transparent outline-none focus:ring-2 focus:ring-blue-500'
					placeholder='Condition, Warranty, etc...'
				/>
			</div>

			{/* SUBMIT */}
			<Button
				disabled={loading}
				className='w-full bg-blue-600 hover:bg-blue-700 py-7 rounded-2xl font-black text-white'
			>
				{loading ? (
					<Loader2 className='animate-spin' />
				) : (
					"Publish to Marketplace"
				)}
			</Button>
		</form>
	);
};

export default CreateListingForm;
