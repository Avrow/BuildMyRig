import { Calendar, Cpu, MonitorPlay, MemoryStick, Users } from "lucide-react";

import connectDB from "@/lib/mongooseClient";
import BuildPost from "@/models/buildPost";
import CreateBuildForm from "@/components/CreateBuildForm";
import Navbar from "@/components/Navbar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export const metadata = {
	title: "Community PC Builds",
	description:
		"Browse custom PC builds shared by the community and post your own.",
};

// Opt out of Next.js static caching so new posts appear after revalidation.
export const dynamic = "force-dynamic";

async function getAllBuilds() {
	await connectDB();

	const raw = await BuildPost.find({}).sort({ createdAt: -1 }).lean();

	// Convert Mongoose documents to plain, serialisable objects.
	return raw.map((b) => ({
		id: b._id.toString(),
		imageUrl: b.imageUrl,
		caption: b.caption,
		cpu: b.cpu,
		gpu: b.gpu,
		ram: b.ram,
		createdAt: b.createdAt.toISOString(),
	}));
}

export default async function CommunityPage() {
	const builds = await getAllBuilds();
	// const builds = []; // Placeholder until backend is implemented

	return (
		<div className='min-h-screen bg-white dark:bg-slate-950'>
			<Navbar />

			<main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16'>
				{/* ── Hero header ── */}
				<div className='text-center mb-14'>
					<Badge
						variant='secondary'
						className='mb-4 inline-flex gap-1.5 rounded-full px-4 py-1 text-sm font-medium'
					>
						<Users className='h-3.5 w-3.5 text-blue-500' />
						Community Showcase
					</Badge>
					<h1 className='text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3'>
						PC Build Gallery
					</h1>
					<p className='text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto leading-relaxed'>
						Show off your custom rig, get inspired, and discover what the
						community has built.
					</p>
					<div className='mt-8 flex justify-center'>
						<CreateBuildForm />
					</div>
				</div>

				<Separator className='mb-10' />

				{/* ── Feed ── */}
				{builds.length === 0 ? (
					<div className='text-center py-28 space-y-3'>
						<p className='text-2xl font-semibold text-slate-400'>
							No builds posted yet
						</p>
						<p className='text-slate-500 text-sm'>
							Be the first to showcase your rig!
						</p>
					</div>
				) : (
					<>
						<p className='text-xs text-slate-400 mb-6 uppercase tracking-widest'>
							{builds.length} build{builds.length !== 1 ? "s" : ""} shared
						</p>

						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
							{builds.map((build) => (
								<article
									key={build.id}
									className='bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-blue-900/10 group'
								>
									{/* Build image */}
									<div className='aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800'>
										<img
											src={build.imageUrl}
											alt={build.caption}
											className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
											loading='lazy'
										/>
									</div>

									<div className='p-4 space-y-3'>
										{/* Caption */}
										<p className='font-semibold text-base text-slate-900 dark:text-white leading-snug line-clamp-2'>
											{build.caption}
										</p>

										<Separator />

										{/* Specs */}
										<ul className='space-y-1.5 text-sm text-slate-500 dark:text-slate-400'>
											<li className='flex items-center gap-2 min-w-0'>
												<Cpu className='h-4 w-4 text-blue-500 shrink-0' />
												<span className='truncate'>{build.cpu}</span>
											</li>
											<li className='flex items-center gap-2 min-w-0'>
												<MonitorPlay className='h-4 w-4 text-violet-500 shrink-0' />
												<span className='truncate'>{build.gpu}</span>
											</li>
											<li className='flex items-center gap-2 min-w-0'>
												<MemoryStick className='h-4 w-4 text-green-500 shrink-0' />
												<span className='truncate'>{build.ram}</span>
											</li>
										</ul>

										{/* Date */}
										<div className='flex items-center gap-1.5 text-xs text-slate-400 pt-1'>
											<Calendar className='h-3 w-3 shrink-0' />
											<time dateTime={build.createdAt}>
												{new Date(build.createdAt).toLocaleDateString("en-US", {
													year: "numeric",
													month: "short",
													day: "numeric",
												})}
											</time>
										</div>
									</div>
								</article>
							))}
						</div>
					</>
				)}
			</main>
		</div>
	);
}
