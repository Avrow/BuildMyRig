import {
	Calendar,
	Cpu,
	MonitorPlay,
	MemoryStick,
	Users,
	Star,
	MessageSquare,
} from "lucide-react";
import CreateBuildForm from "@/components/CreateBuildForm";
import Navbar from "@/components/Navbar";
import BuildDetailsModal from "@/components/BuildDetailsModal";
import PostActions from "@/components/PostActions";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * retrive from database with author details and reviews for each build post
 * and also calculate average rating and review count for better UX
 * this function is server-only and will not be included in client bundle, so we can safely use mongoose models and server-side logic here without worrying about client-side compatibility
 */
async function getAllBuilds() {
	const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
	const res = await fetch(`${apiUrl}/api/posts`, { cache: "no-store" });
	if (!res.ok) return [];

	const data = await res.json();
	return Array.isArray(data?.data) ? data.data : [];
}

export default async function CommunityPage() {
	const builds = await getAllBuilds();

	// user id read fro dynamic session cookie for permission checks (like showing edit/delete buttons only to post authors)
	const session = await getSessionUser();
	const currentUserId = session?.id;

	return (
		<div className='min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300'>
			<Navbar />
			<main className='max-w-7xl mx-auto px-4 py-12'>
				<div className='text-center mb-14'>
					<h1 className='text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight'>
						PC Build Gallery
					</h1>
					<div className='mt-8 flex justify-center'>
						<CreateBuildForm />
					</div>
				</div>

				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
					{builds.map((build) => (
						<article
							key={build.id}
							className='group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300'
						>
							<div className='aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800 relative'>
								<img
									src={build.imageUrl}
									alt={build.caption}
									className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
								/>
							</div>

							<div className='p-6 flex flex-col flex-1'>
								<div className='flex justify-between items-start mb-2'>
									<div className='flex-1'>
										<h3 className='font-bold text-xl text-slate-900 dark:text-white line-clamp-1'>
											{build.caption}
										</h3>
										<p className='text-xs text-blue-500 font-bold mt-1'>
											By: {build.authorName}
										</p>
									</div>

									<div className='flex items-center gap-2'>
										{/* 3 dot menu show when user is the author */}
										{currentUserId &&
											String(currentUserId) === String(build.authorId) && (
												<PostActions
													post={build}
													currentUserId={String(currentUserId)}
												/>
											)}
										<span className='flex items-center gap-1 text-yellow-500 font-bold bg-yellow-500/10 px-2 py-0.5 rounded-lg text-sm'>
											<Star size={14} fill='currentColor' /> {build.avgRating}
										</span>
									</div>
								</div>

								<div className='grid grid-cols-3 gap-2 my-5'>
									<div className='bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl text-center flex flex-col items-center border border-slate-100 dark:border-slate-800 transition-colors group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/10'>
										<Cpu size={14} className='text-blue-500 mb-1' />
										<span className='text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate w-full'>
											{build.cpu}
										</span>
									</div>
									<div className='bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl text-center flex flex-col items-center border border-slate-200 dark:border-slate-800 transition-colors group-hover:bg-purple-50/50 dark:group-hover:bg-purple-900/10'>
										<MonitorPlay size={14} className='text-purple-500 mb-1' />
										<span className='text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate w-full'>
											{build.gpu}
										</span>
									</div>
									<div className='bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl text-center flex flex-col items-center border border-slate-100 dark:border-slate-800 transition-colors group-hover:bg-green-50/50 dark:group-hover:bg-green-900/10'>
										<MemoryStick size={14} className='text-green-500 mb-1' />
										<span className='text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate w-full'>
											{build.ram}
										</span>
									</div>
								</div>

								<Separator className='mb-4 opacity-50' />

								<div className='mt-auto flex justify-between items-center text-[10px] text-slate-400 font-semibold uppercase tracking-wider'>
									<span className='flex items-center gap-1.5'>
										<MessageSquare size={13} className='text-blue-500' />{" "}
										{build.commentCount} Feedback
									</span>

									{/* Hydration Error fix uppressHydrationWarning */}
									<span suppressHydrationWarning>
										{new Date(build.createdAt).toLocaleDateString()}
									</span>
								</div>

								<div className='mt-4'>
									<BuildDetailsModal build={build} />
								</div>
							</div>
						</article>
					))}
				</div>
			</main>
		</div>
	);
}
