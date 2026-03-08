import { Calendar, Cpu, MonitorPlay, MemoryStick } from "lucide-react";

import connectDB from "@/lib/mongooseClient";
import BuildPost from "@/models/buildPost";
import CreateBuildForm from "@/components/CreateBuildForm";
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

	return (
		<main className='min-h-screen bg-gray-950 text-white'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16'>
				{/* ── Hero header ── */}
				<div className='text-center mb-14'>
					<Badge className='mb-4 bg-blue-600/20 text-blue-400 border-blue-600/40 hover:bg-blue-600/20'>
						Community Showcase
					</Badge>
					<h1 className='text-4xl sm:text-5xl font-bold tracking-tight mb-3'>
						PC Build Gallery
					</h1>
					<p className='text-gray-400 text-lg max-w-xl mx-auto leading-relaxed'>
						Show off your custom rig, get inspired, and discover what the
						community has built.
					</p>
				</div>

				{/* ── Create form card ── */}
				<div className='bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 max-w-lg mx-auto mb-16 shadow-xl shadow-black/30'>
					<h2 className='text-xl font-semibold mb-1'>Share Your Build</h2>
					<p className='text-sm text-gray-400 mb-6'>
						Upload a photo, add your specs, and inspire the community.
					</p>
					<CreateBuildForm />
				</div>

				<Separator className='bg-gray-800 mb-10' />

				{/* ── Feed ── */}
				{builds.length === 0 ? (
					<div className='text-center py-28 space-y-3'>
						<p className='text-2xl font-semibold text-gray-400'>
							No builds posted yet
						</p>
						<p className='text-gray-600 text-sm'>
							Be the first to showcase your rig!
						</p>
					</div>
				) : (
					<>
						<p className='text-xs text-gray-600 mb-6 uppercase tracking-widest'>
							{builds.length} build{builds.length !== 1 ? "s" : ""} shared
						</p>

						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
							{builds.map((build) => (
								<article
									key={build.id}
									className='bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-blue-900/10 group'
								>
									{/* Build image */}
									<div className='aspect-video overflow-hidden bg-gray-800'>
										<img
											src={build.imageUrl}
											alt={build.caption}
											className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
											loading='lazy'
										/>
									</div>

									<div className='p-4 space-y-3'>
										{/* Caption */}
										<p className='font-semibold text-base leading-snug line-clamp-2'>
											{build.caption}
										</p>

										<Separator className='bg-gray-800' />

										{/* Specs */}
										<ul className='space-y-1.5 text-sm text-gray-400'>
											<li className='flex items-center gap-2 min-w-0'>
												<Cpu className='h-4 w-4 text-blue-400 shrink-0' />
												<span className='truncate'>{build.cpu}</span>
											</li>
											<li className='flex items-center gap-2 min-w-0'>
												<MonitorPlay className='h-4 w-4 text-purple-400 shrink-0' />
												<span className='truncate'>{build.gpu}</span>
											</li>
											<li className='flex items-center gap-2 min-w-0'>
												<MemoryStick className='h-4 w-4 text-green-400 shrink-0' />
												<span className='truncate'>{build.ram}</span>
											</li>
										</ul>

										{/* Date */}
										<div className='flex items-center gap-1.5 text-xs text-gray-600 pt-1'>
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
			</div>
		</main>
	);
}
