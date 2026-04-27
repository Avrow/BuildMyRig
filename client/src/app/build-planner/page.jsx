"use client";

import { BuildPlannerProvider } from "@/context/buildPlanner";
import Navbar from "@/components/Navbar";
import PartCatalog from "@/components/build-planner/PartCatalog";
import BuildSummary from "@/components/build-planner/BuildSummary";
import VirtualLookViewer from "@/components/build-planner/VirtualLookViewer";

export default function BuildPlannerPage() {
	return (
		<BuildPlannerProvider>
			<div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'>
				<Navbar />

				<main className='mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10'>
					<div className='mb-6'>
						<h1 className='text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl'>
							Build Planner
						</h1>
						<p className='mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300 sm:text-base'>
							Build your rig part-by-part, preview an AI-generated visual mockup,
							and save the generated image.
						</p>
					</div>

					<div className='grid grid-cols-1 gap-5 lg:grid-cols-12'>
						<div className='lg:col-span-7'>
							<PartCatalog />
						</div>
						<div className='space-y-5 lg:col-span-5'>
							<BuildSummary />
							<VirtualLookViewer />
						</div>
					</div>
				</main>
			</div>
		</BuildPlannerProvider>
	);
}
