"use client";
import { useState, useRef } from "react";
import { Heart, Laugh, Frown, Reply, Star, X, Send } from "lucide-react";
import { useAuth } from "@/context/auth";
import { toast } from "sonner";

export default function BuildDetailsModal({ build }) {
	const { user } = useAuth();
	const [isOpen, setIsOpen] = useState(false);
	const [rating, setRating] = useState(5);
	const [comment, setComment] = useState("");
	const [activeReplyBox, setActiveReplyBox] = useState(null);
	const [replyText, setReplyText] = useState("");
	const replyInputRef = useRef(null);
	const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

	// reaction handler with toggle logic
	const handleReact = async (id, type) => {
		if (!user || !user._id) return toast.error("Please sign in to react!");
		await fetch(`${apiUrl}/api/reviews/react`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ reviewId: id, userId: user._id, type }),
		});
	};

	// reply box opening function with mention support
	const initiateReply = (reviewId, mentionName) => {
		if (!user) return toast.error("Please sign in to reply");
		setActiveReplyBox(reviewId);
		setReplyText(`@${mentionName} `);
		setTimeout(() => replyInputRef.current?.focus(), 50);
	};

	// main feedback submit function with safety checks
	const handlePostFeedback = async () => {
		if (!user || !user._id) {
			toast.error("You must be logged in to post feedback!");
			return;
		}
		if (!comment.trim()) {
			toast.error("Please write something before posting.");
			return;
		}

		const res = await fetch(`${apiUrl}/api/reviews`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				buildId: build.id,
				userId: user._id,
				userName: user.name,
				rating,
				comment,
			}),
		});

		if (res.ok) {
			setComment("");
			toast.success("Review posted!");
		} else {
			toast.error("Failed to post review.");
		}
	};

	// reply submit function with safety check
	const handlePostReply = async (revId) => {
		if (!user || !user._id) return toast.error("Please sign in to reply");
		if (!replyText.trim()) return toast.error("Reply cannot be empty");

		const res = await fetch(`${apiUrl}/api/reviews/${revId}/replies`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				userId: user._id,
				userName: user.name,
				text: replyText,
			}),
		});

		if (res.ok) {
			setReplyText("");
			setActiveReplyBox(null);
			toast.success("Reply added!");
		}
	};

	return (
		<>
			<button
				onClick={() => setIsOpen(true)}
				className='w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-bold mt-2 shadow-md hover:shadow-blue-500/20 hover:-translate-y-1 active:scale-95 transition-all duration-200'
			>
				View Details
			</button>

			{isOpen && (
				<div className='fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] p-4 flex items-center justify-center pointer-events-auto'>
					<div className='bg-slate-950 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-800 p-6 text-white shadow-2xl relative animate-in fade-in zoom-in duration-300'>
						<button
							onClick={() => setIsOpen(false)}
							className='absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 p-2 rounded-full transition-colors'
						>
							<X size={20} />
						</button>
						<img
							src={build.imageUrl}
							className='w-full aspect-video object-cover rounded-2xl mb-6 shadow-lg'
						/>
						<h2 className='text-2xl font-black mb-1'>{build.caption}</h2>
						<p className='text-blue-400 text-sm mb-6 italic opacity-80'>
							"{build.description}"
						</p>

						{/* Rating Form */}
						<div className='bg-slate-900/50 p-5 rounded-2xl border border-slate-800 mb-8'>
							<h4 className='text-sm font-bold mb-3 flex items-center gap-2'>
								<Star size={16} className='text-yellow-500' /> Share your
								feedback
							</h4>
							<div className='flex gap-2 mb-4'>
								{[1, 2, 3, 4, 5].map((s) => (
									<Star
										key={s}
										onClick={() => setRating(s)}
										className={`h-6 w-6 cursor-pointer transition-transform hover:scale-110 ${s <= rating ? "fill-yellow-500 text-yellow-500" : "text-slate-700"}`}
									/>
								))}
							</div>
							<textarea
								value={comment}
								onChange={(e) => setComment(e.target.value)}
								className='w-full bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm mb-4 outline-none focus:border-blue-600'
								placeholder="What's your opinion on this build?"
							/>
							<button
								onClick={handlePostFeedback}
								className='bg-blue-600 hover:bg-blue-700 px-8 py-2 rounded-full text-xs font-black uppercase tracking-widest'
							>
								Post Feedback
							</button>
						</div>

						{/* Reviews & Nested Replies List */}
						<div className='space-y-6'>
							<h3 className='font-bold text-lg border-b border-slate-800 pb-2'>
								Community Rating ({build.commentCount})
							</h3>
							{build.reviews?.map((rev) => (
								<div
									key={rev._id}
									className='bg-slate-900/30 p-5 rounded-2xl border border-slate-800/50'
								>
									<div className='flex justify-between items-center mb-3'>
										<span className='font-bold text-blue-400 text-sm'>
											{rev.userName}
										</span>
										<span className='text-yellow-500 text-xs flex gap-0.5'>
											{[...Array(rev.rating)].map((_, i) => (
												<Star key={i} size={10} fill='currentColor' />
											))}
										</span>
									</div>
									<p className='text-sm text-slate-300 mb-4 leading-relaxed'>
										"{rev.comment}"
									</p>

									<div className='flex gap-5 items-center'>
										<button
											onClick={() => handleReact(rev._id, "love")}
											className={`flex items-center gap-1.5 text-xs transition-all ${rev.reactions?.love?.includes(user?._id) ? "text-red-500 font-bold" : "text-slate-500"}`}
										>
											<Heart
												size={16}
												fill={
													rev.reactions?.love?.includes(user?._id)
														? "currentColor"
														: "none"
												}
											/>
										</button>
										<button
											onClick={() => handleReact(rev._id, "haha")}
											className={`flex items-center gap-1.5 text-xs transition-all ${rev.reactions?.haha?.includes(user?._id) ? "text-yellow-500 font-bold" : "text-slate-500"}`}
										>
											<Laugh size={16} />
										</button>
										<button
											onClick={() => handleReact(rev._id, "sad")}
											className={`flex items-center gap-1.5 text-xs transition-all ${rev.reactions?.sad?.includes(user?._id) ? "text-blue-400 font-bold" : "text-slate-500"}`}
										>
											<Frown size={16} />
										</button>
										<button
											onClick={() => initiateReply(rev._id, rev.userName)}
											className='text-xs text-blue-500 ml-auto font-bold flex items-center gap-1 hover:underline'
										>
											<Reply size={14} /> Reply
										</button>
									</div>

									<div className='space-y-3 mt-4'>
										{rev.replies?.map((r, i) => (
											<div
												key={i}
												className='ml-8 p-3 bg-slate-950/50 rounded-xl border-l-2 border-blue-600 text-[11px] group relative'
											>
												<div className='flex justify-between items-start mb-1'>
													<b className='text-slate-200'>{r.userName}</b>
													<button
														onClick={() => initiateReply(rev._id, r.userName)}
														className='opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 flex items-center gap-1 hover:underline'
													>
														<Reply size={10} /> Reply
													</button>
												</div>
												<p className='text-slate-400'>{r.text}</p>
											</div>
										))}
									</div>

									{activeReplyBox === rev._id && (
										<div className='mt-4 flex gap-2 animate-in slide-in-from-top-2'>
											<input
												ref={replyInputRef}
												value={replyText}
												onChange={(e) => setReplyText(e.target.value)}
												className='flex-1 bg-slate-950 border border-slate-800 p-2 rounded-xl text-xs outline-none focus:border-blue-600'
												placeholder='Write a reply...'
											/>
											<button
												onClick={() => handlePostReply(rev._id)}
												className='bg-blue-600 p-2 rounded-xl hover:bg-blue-700 transition-colors'
											>
												<Send size={14} />
											</button>
										</div>
									)}
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</>
	);
}
