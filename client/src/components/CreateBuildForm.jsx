"use client";

import { useRef, useState, useMemo } from "react";
import {
	Loader2,
	X,
	Plus,
	ImageIcon,
	FileText,
	AlertCircle,
	CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { UploadButton } from "@/utils/uploadthing";
import { useAuth } from "@/context/auth";
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
	const { user } = useAuth();
	const formRef = useRef(null);
	const [open, setOpen] = useState(false);
	const [imageUrl, setImageUrl] = useState("");
	const [description, setDescription] = useState(""); // এটি মিসিং ছিল
	const [uploading, setUploading] = useState(false);
	const [isPending, setIsPending] = useState(false);

	const wordCount = useMemo(() => {
		return description
			.trim()
			.split(/\s+/)
			.filter((word) => word.length > 0).length;
	}, [description]);

	const isTooLong = wordCount > 1500;

	function handleClose() {
		if (isPending || uploading) return;
		setOpen(false);
		setImageUrl("");
		setDescription("");
		formRef.current?.reset();
	}

	async function handleSubmit(e) {
		e.preventDefault();

		if (!user?._id) {
			toast.error("You must be logged in to post!");
			return;
		}

		if (!imageUrl) {
			toast.error("Please upload your build photo first.");
			return;
		}

		if (isTooLong) {
			toast.error("Description is too long! Max 1500 words.");
			return;
		}

		const formData = new FormData(e.currentTarget);
		setIsPending(true);

		try {
			const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
			const res = await fetch(`${apiUrl}/api/posts`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					author: user._id,
					imageUrl,
					caption: formData.get("caption"),
					cpu: formData.get("cpu"),
					gpu: formData.get("gpu"),
					ram: formData.get("ram"),
					description: description,
				}),
			});

			const result = await res.json();
			if (!res.ok || result?.success === false) {
				throw new Error(result?.error || "Failed to post.");
			}

			toast.success("Build published successfully! 🎉");
			handleClose();
			window.location.reload();
		} catch (err) {
			console.error("Post Build Error:", err);
			toast.error(err.message || "Failed to post.");
		} finally {
			setIsPending(false);
		}
	}

	if (!user) return null;

	return (
		<>
			<Button
				onClick={() => setOpen(true)}
				className='gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
			>
				<Plus className='h-4 w-4' />
				Share Your Build
			</Button>

			<Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
				<DialogContent className='max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-950'>
					<DialogHeader>
						<div className='flex items-center gap-2 mb-1'>
							<div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-md'>
								<ImageIcon className='h-4 w-4 text-white' />
							</div>
							<DialogTitle>Share Your Build Showcase</DialogTitle>
						</div>
						<DialogDescription>
							Sharing as{" "}
							<span className='font-bold text-blue-600'>
								{user?.name || "Guest"}
							</span>
							. Maximum 1500 words story.
						</DialogDescription>
					</DialogHeader>

					<form
						ref={formRef}
						onSubmit={handleSubmit}
						className='space-y-5 pt-2'
					>
						{/* Image Upload Area */}
						<div className='space-y-2'>
							<Label className='text-sm font-semibold text-slate-700 dark:text-slate-300'>
								Build Photo
							</Label>
							{imageUrl ? (
								<div className='relative rounded-2xl overflow-hidden border-2 border-blue-100 group'>
									<img
										src={imageUrl}
										alt='Build preview'
										className='w-full h-52 object-cover'
									/>
									<div className='absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white'>
										<button
											type='button'
											onClick={() => setImageUrl("")}
											className='bg-red-500 rounded-full p-2 hover:scale-110 transition-transform'
										>
											<X className='h-5 w-5' />
										</button>
									</div>
									<div className='absolute bottom-2 left-2 bg-green-500 text-white text-[10px] px-2 py-1 rounded-md flex items-center gap-1 font-bold shadow-lg'>
										<CheckCircle2 size={12} /> READY TO POST
									</div>
								</div>
							) : (
								<div className='p-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors'>
									<UploadButton
										endpoint='imageUploader'
										onUploadProgress={() => setUploading(true)}
										onClientUploadComplete={(res) => {
											const url = res?.[0]?.ufsUrl || res?.[0]?.url;
											setImageUrl(url);
											setUploading(false);
											toast.success("Image uploaded!");
										}}
										onUploadError={(error) => {
											setUploading(false);
											toast.error(`Upload Error: ${error.message}`);
										}}
										appearance={{
											button:
												"bg-blue-600 hover:bg-blue-700 transition-all font-bold text-sm h-10 px-6",
											allowedContent:
												"text-slate-400 text-[10px] uppercase mt-2 font-medium",
										}}
									/>
									{uploading && (
										<div className='mt-4 flex items-center gap-2 text-blue-600 font-bold text-xs animate-pulse'>
											<Loader2 size={14} className='animate-spin' /> SENDING TO
											CLOUD...
										</div>
									)}
								</div>
							)}
						</div>

						{/* Specs Grid */}
						<div className='grid grid-cols-3 gap-3'>
							<div className='space-y-1'>
								<Label className='text-[10px] font-black uppercase text-slate-400'>
									CPU
								</Label>
								<Input
									name='cpu'
									placeholder='e.g. i9 14900K'
									required
									className='dark:bg-slate-900'
								/>
							</div>
							<div className='space-y-1'>
								<Label className='text-[10px] font-black uppercase text-slate-400'>
									GPU
								</Label>
								<Input
									name='gpu'
									placeholder='e.g. RTX 4090'
									required
									className='dark:bg-slate-900'
								/>
							</div>
							<div className='space-y-1'>
								<Label className='text-[10px] font-black uppercase text-slate-400'>
									RAM
								</Label>
								<Input
									name='ram'
									placeholder='e.g. 64GB'
									required
									className='dark:bg-slate-900'
								/>
							</div>
						</div>

						<div className='space-y-1'>
							<Label className='text-[10px] font-black uppercase text-slate-400'>
								Build Caption
							</Label>
							<Input
								name='caption'
								placeholder='Give your setup a cool name...'
								required
								className='dark:bg-slate-900'
							/>
						</div>

						{/* Narrative / Story */}
						<div className='space-y-2'>
							<div className='flex justify-between items-center'>
								<Label className='flex items-center gap-1 font-bold dark:text-slate-300'>
									<FileText size={14} className='text-blue-500' /> Build
									Narrative
								</Label>
								<span
									className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isTooLong ? "bg-red-100 text-red-600 border border-red-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}
								>
									{wordCount} / 1500 WORDS
								</span>
							</div>
							<textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder='Describe your choice of parts and the story behind your rig...'
								className={`w-full min-h-[140px] p-3 text-sm rounded-xl border outline-none transition-all dark:bg-slate-900 ${isTooLong ? "border-red-500 focus:ring-4 focus:ring-red-50 text-red-700" : "border-slate-200 focus:ring-4 focus:ring-blue-50 dark:border-slate-800"}`}
								required
							/>
							{isTooLong && (
								<p className='text-[10px] text-red-500 font-black flex items-center gap-1'>
									<AlertCircle size={12} /> RED ALERT: Description is too long.
								</p>
							)}
						</div>

						<Button
							type='submit'
							disabled={isPending || uploading || isTooLong}
							className={`w-full py-7 font-black uppercase tracking-widest transition-all rounded-xl shadow-lg ${isTooLong ? "bg-slate-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 text-white"}`}
						>
							{isPending ? (
								<>
									<Loader2 className='mr-2 animate-spin' /> Publishing...
								</>
							) : (
								"Post Build to Community"
							)}
						</Button>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
}
