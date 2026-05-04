"use client";
import { useState } from "react";
import { MoreVertical, Trash2, Edit3 } from "lucide-react";
import { toast } from "sonner";
import EditBuildModal from "./EditBuildModal";

export default function PostActions({ post, currentUserId }) {
	const [isOpen, setIsOpen] = useState(false);

	const handleDelete = async () => {
		if (confirm("Are you sure you want to delete this build?")) {
			const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
			const res = await fetch(`${apiUrl}/api/posts/${post.id}`, {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userId: currentUserId }),
			});

			const data = await res.json();
			if (res.ok && data?.success !== false) {
				toast.success("Build deleted successfully!");
				setIsOpen(false);
				window.location.reload();
			} else {
				toast.error(data?.error || "Failed to delete post.");
			}
		}
	};

	return (
		<div className='relative'>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400'
			>
				<MoreVertical size={18} />
			</button>

			{isOpen && (
				<>
					<div
						className='fixed inset-0 z-40'
						onClick={() => setIsOpen(false)}
					></div>
					<div className='absolute right-0 mt-2 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-150'>
						<EditBuildModal
							post={post}
							currentUserId={currentUserId}
							closeMenu={() => setIsOpen(false)}
						/>

						<button
							onClick={handleDelete}
							className='w-full flex items-center gap-2 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors border-t border-slate-100 dark:border-slate-800'
						>
							<Trash2 size={14} /> Delete Post
						</button>
					</div>
				</>
			)}
		</div>
	);
}
