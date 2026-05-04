"use client";
import { useState } from "react";
import { Edit3, X, Save } from "lucide-react";
import { toast } from "sonner";

export default function EditBuildModal({ post, currentUserId, closeMenu }) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [formData, setFormData] = useState({
		caption: post.caption,
		cpu: post.cpu,
		gpu: post.gpu,
		ram: post.ram,
		description: post.description,
		imageUrl: post.imageUrl,
	});

	const handleUpdate = async (e) => {
		e.preventDefault();
		const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
		const res = await fetch(`${apiUrl}/api/posts/${post.id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				userId: currentUserId,
				...formData,
			}),
		});

		const data = await res.json();
		if (res.ok && data?.success !== false) {
			toast.success("Build updated successfully!");
			setIsModalOpen(false);
			closeMenu();
			window.location.reload();
		} else {
			toast.error(data?.error || "Update failed.");
		}
	};

	return (
		<>
			<button
				onClick={() => setIsModalOpen(true)}
				className='w-full flex items-center gap-2 px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors'
			>
				<Edit3 size={14} /> Edit Build
			</button>

			{isModalOpen && (
				<div className='fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4'>
					<div className='bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in duration-200'>
						<div className='flex justify-between items-center mb-6'>
							<h2 className='text-xl font-bold dark:text-white'>
								Edit Your Rig
							</h2>
							<button
								onClick={() => setIsModalOpen(false)}
								className='p-2 bg-slate-100 dark:bg-slate-800 rounded-full'
							>
								<X size={18} />
							</button>
						</div>

						<form onSubmit={handleUpdate} className='space-y-4'>
							<input
								className='w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border-none text-sm'
								value={formData.caption}
								onChange={(e) =>
									setFormData({ ...formData, caption: e.target.value })
								}
								placeholder='Build Name'
							/>
							<div className='grid grid-cols-2 gap-3'>
								<input
									className='bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-sm'
									value={formData.cpu}
									onChange={(e) =>
										setFormData({ ...formData, cpu: e.target.value })
									}
									placeholder='CPU'
								/>
								<input
									className='bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-sm'
									value={formData.gpu}
									onChange={(e) =>
										setFormData({ ...formData, gpu: e.target.value })
									}
									placeholder='GPU'
								/>
							</div>
							<input
								className='w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-sm'
								value={formData.ram}
								onChange={(e) =>
									setFormData({ ...formData, ram: e.target.value })
								}
								placeholder='RAM'
							/>
							<textarea
								className='w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-sm h-24'
								value={formData.description}
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
								placeholder='Build Narrative'
							/>

							<button
								type='submit'
								className='w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all'
							>
								<Save size={18} /> Update Build
							</button>
						</form>
					</div>
				</div>
			)}
		</>
	);
}
