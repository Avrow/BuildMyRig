"use client";

import { useRef, useState } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { UploadDropzone } from "@/utils/uploadthing";
import { createBuildPost } from "@/app/actions/buildPost";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreateBuildForm() {
	const formRef = useRef(null);
	const [imageUrl, setImageUrl] = useState("");
	const [isPending, setIsPending] = useState(false);

	async function handleSubmit(e) {
		e.preventDefault();

		if (!imageUrl) {
			toast.error("Please upload a photo of your build first.");
			return;
		}

		const formData = new FormData(e.currentTarget);
		setIsPending(true);

		try {
			const result = await createBuildPost({
				imageUrl,
				caption: formData.get("caption"),
				cpu: formData.get("cpu"),
				gpu: formData.get("gpu"),
				ram: formData.get("ram"),
			});

			if (result?.error) throw new Error(result.error);

			toast.success("Build posted! 🎉");
			setImageUrl("");
			formRef.current?.reset();
		} catch (err) {
			toast.error(err.message || "Something went wrong. Please try again.");
		} finally {
			setIsPending(false);
		}
	}

	return (
		<form ref={formRef} onSubmit={handleSubmit} className='space-y-5'>
			{/* ── Image upload ── */}
			<div className='space-y-2'>
				<Label>Build Photo</Label>

				{imageUrl ? (
					/* Preview with remove button */
					<div className='relative rounded-xl overflow-hidden border border-gray-700'>
						<img
							src={imageUrl}
							alt='Your PC build preview'
							className='w-full h-52 object-cover'
						/>
						<button
							type='button'
							onClick={() => setImageUrl("")}
							className='absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors'
							aria-label='Remove image'
						>
							<X className='h-4 w-4' />
						</button>
					</div>
				) : (
					<UploadDropzone
						endpoint='imageUploader'
						onClientUploadComplete={(res) => {
							// UploadThing v7 returns ufsUrl; fall back to url for older SDKs.
							const url = res?.[0]?.ufsUrl ?? res?.[0]?.url;
							if (url) {
								setImageUrl(url);
								toast.success("Image uploaded!");
							}
						}}
						onUploadError={(error) => {
							toast.error(`Upload failed: ${error.message}`);
						}}
						className='border-gray-700 ut-label:text-gray-200 ut-allowed-content:text-gray-400 ut-button:bg-blue-600 ut-button:hover:bg-blue-700 ut-button:ut-readying:bg-blue-600/50'
					/>
				)}
			</div>

			{/* ── Caption ── */}
			<div className='space-y-1.5'>
				<Label htmlFor='caption'>Caption</Label>
				<Input
					id='caption'
					name='caption'
					placeholder='My dream battlestation...'
					maxLength={280}
					required
					className='bg-gray-800 border-gray-700 focus-visible:ring-blue-500'
				/>
			</div>

			{/* ── PC Specs ── */}
			<div className='space-y-3'>
				<p className='text-sm font-medium text-gray-300'>PC Specs</p>

				<div className='space-y-1.5'>
					<Label
						htmlFor='cpu'
						className='text-xs text-gray-400 uppercase tracking-wide'
					>
						CPU
					</Label>
					<Input
						id='cpu'
						name='cpu'
						placeholder='AMD Ryzen 9 7950X'
						required
						className='bg-gray-800 border-gray-700 focus-visible:ring-blue-500 text-sm'
					/>
				</div>

				<div className='space-y-1.5'>
					<Label
						htmlFor='gpu'
						className='text-xs text-gray-400 uppercase tracking-wide'
					>
						GPU
					</Label>
					<Input
						id='gpu'
						name='gpu'
						placeholder='NVIDIA GeForce RTX 4090'
						required
						className='bg-gray-800 border-gray-700 focus-visible:ring-blue-500 text-sm'
					/>
				</div>

				<div className='space-y-1.5'>
					<Label
						htmlFor='ram'
						className='text-xs text-gray-400 uppercase tracking-wide'
					>
						RAM
					</Label>
					<Input
						id='ram'
						name='ram'
						placeholder='64 GB DDR5 6000 MHz'
						required
						className='bg-gray-800 border-gray-700 focus-visible:ring-blue-500 text-sm'
					/>
				</div>
			</div>

			{/* ── Submit ── */}
			<Button
				type='submit'
				disabled={isPending}
				className='w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold'
			>
				{isPending ? (
					<>
						<Loader2 className='mr-2 h-4 w-4 animate-spin' />
						Posting...
					</>
				) : (
					"Post Build"
				)}
			</Button>
		</form>
	);
}
