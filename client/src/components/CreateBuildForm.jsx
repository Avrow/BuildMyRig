"use client";

import { useRef, useState } from "react";
import { Loader2, X, Plus, ImageIcon } from "lucide-react";
import { toast } from "sonner";

import { UploadDropzone } from "@/utils/uploadthing";
import { createBuildPost } from "@/app/actions/buildPost";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";

export default function CreateBuildForm() {
	const formRef = useRef(null);
	const [open, setOpen] = useState(false);
	const [imageUrl, setImageUrl] = useState("");
	const [localPreview, setLocalPreview] = useState("");
	const [uploading, setUploading] = useState(false);
	const [isPending, setIsPending] = useState(false);

	function handleClose() {
		if (isPending || uploading) return;
		setOpen(false);
		setImageUrl("");
		if (localPreview) URL.revokeObjectURL(localPreview);
		setLocalPreview("");
		formRef.current?.reset();
	}

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
			handleClose();
		} catch (err) {
			toast.error(err.message || "Something went wrong. Please try again.");
		} finally {
			setIsPending(false);
		}
	}

	return (
		<>
			{/* ── Trigger button ── */}
			<Button
				onClick={() => setOpen(true)}
				className='gap-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25'
			>
				<Plus className='h-4 w-4' />
				Share Your Build
			</Button>

			{/* ── Dialog ── */}
			<Dialog
				open={open}
				onOpenChange={(v) => {
					if (!v) handleClose();
				}}
			>
				<DialogContent className='max-w-lg max-h-[90vh] overflow-y-auto'>
					<DialogHeader>
						<div className='flex items-center gap-2 mb-1'>
							<div className='flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-indigo-600'>
								<ImageIcon className='h-4 w-4 text-white' />
							</div>
							<DialogTitle>Share Your Build</DialogTitle>
						</div>
						<DialogDescription>
							Upload a photo, add your specs, and inspire the community.
						</DialogDescription>
					</DialogHeader>

					<form
					  ref={formRef}
						onSubmit={handleSubmit}
						className='space-y-5 pt-2'
					>
						{/* ── Image upload / preview ── */}
						<div className='space-y-2'>
							<Label>Build Photo</Label>

							{/* Show preview as soon as a file is chosen (local blob or CDN URL) */}
							{localPreview || imageUrl ? (
								<div className='relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700'>
									<img
										src={localPreview || imageUrl}
										alt='Build preview'
										className='w-full h-52 object-cover'
									/>
									{/* Uploading overlay */}
									{uploading && (
										<div className='absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2'>
											<Loader2 className='h-6 w-6 animate-spin text-white' />
											<span className='text-xs text-white font-medium'>
												Uploading…
											</span>
										</div>
									)}
									{/* Remove button — only when not uploading */}
									{!uploading && (
										<button
											type='button'
											onClick={() => {
												setImageUrl("");
												if (localPreview) URL.revokeObjectURL(localPreview);
												setLocalPreview("");
											}}
											className='absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors'
											aria-label='Remove image'
										>
											<X className='h-4 w-4' />
										</button>
									)}
								</div>
							) : (
								<UploadDropzone
									endpoint='imageUploader'
									onBeforeUploadBegin={(files) => {
										// Show local preview immediately on file selection
										const blob = URL.createObjectURL(files[0]);
										setLocalPreview(blob);
										setUploading(true);
										return files;
									}}
									onClientUploadComplete={(res) => {
										const url = res?.[0]?.ufsUrl ?? res?.[0]?.url;
										if (url) {
											setImageUrl(url);
											setUploading(false);
											toast.success("Image uploaded!");
										}
									}}
									onUploadError={(error) => {
										if (localPreview) URL.revokeObjectURL(localPreview);
										setLocalPreview("");
										setUploading(false);
										toast.error(`Upload failed: ${error.message}`);
									}}
									className='border-slate-200 dark:border-slate-700 ut-label:text-slate-700 dark:ut-label:text-slate-200 ut-allowed-content:text-slate-400 ut-button:bg-blue-600 ut-button:hover:bg-blue-700'
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
							/>
						</div>

						{/* ── PC Specs ── */}
						<div className='space-y-3'>
							<p className='text-sm font-medium text-slate-700 dark:text-slate-300'>
								PC Specs
							</p>

							<div className='space-y-1.5'>
								<Label
									htmlFor='cpu'
									className='text-xs text-slate-500 uppercase tracking-wide'
								>
									CPU
								</Label>
								<Input
									id='cpu'
									name='cpu'
									placeholder='AMD Ryzen 9 7950X'
									required
									className='text-sm'
								/>
							</div>

							<div className='space-y-1.5'>
								<Label
									htmlFor='gpu'
									className='text-xs text-slate-500 uppercase tracking-wide'
								>
									GPU
								</Label>
								<Input
									id='gpu'
									name='gpu'
									placeholder='NVIDIA GeForce RTX 4090'
									required
									className='text-sm'
								/>
							</div>

							<div className='space-y-1.5'>
								<Label
									htmlFor='ram'
									className='text-xs text-slate-500 uppercase tracking-wide'
								>
									RAM
								</Label>
								<Input
									id='ram'
									name='ram'
									placeholder='64 GB DDR5 6000 MHz'
									required
									className='text-sm'
								/>
							</div>
						</div>

						{/* ── Submit ── */}
						<Button
							type='submit'
							disabled={isPending || uploading}
							className='w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold'
						>
							{isPending ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Posting...
								</>
							) : uploading ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Uploading image...
								</>
							) : (
								"Post Build"
							)}
						</Button>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
}
