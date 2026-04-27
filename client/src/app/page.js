import Link from "next/link";
import { ArrowRight, Zap, ShieldCheck, Cpu, ShoppingCart, MessageSquare, Sparkles, Eye, Bolt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

const features = [
	{
		icon: Sparkles,
		title: "AI Builder",
		description:
			"Tell our AI your budget and use case, and it will generate the perfect part list instantly.",
		color: "text-yellow-500",
		bg: "bg-yellow-50 dark:bg-yellow-900/20",
	},
	{
		icon: ShieldCheck,
		title: "Smart Compatibility",
		description:
			"Never worry about buying incompatible parts or wrong socket types again.",
		color: "text-green-500",
		bg: "bg-green-50 dark:bg-green-900/20",
	},
	{
		icon: Eye,
		title: "Virtual Build Look",
		description:
			"Generate an AI visual mockup of what your completed PC will actually look like.",
		color: "text-blue-500",
		bg: "bg-blue-50 dark:bg-blue-900/20",
	},
	{
		icon: Bolt,
		title: "Accurate Wattage",
		description:
			"Automatically calculate system power draw and get smart Power Supply recommendations.",
		color: "text-violet-500",
		bg: "bg-violet-50 dark:bg-violet-900/20",
	},
];

export default function LandingPage() {
    return (
        <div className='min-h-screen bg-white dark:bg-slate-950'>
            <Navbar />
            <section className='relative overflow-hidden'>
                <div className='pointer-events-none absolute inset-0 -z-10'>
                    <div className='absolute left-1/2 top-0 h-150 w-225 -translate-x-1/2 rounded-full bg-linear-to-b from-blue-100/60 to-transparent dark:from-blue-900/20 blur-3xl' />
                </div>
                <div className='mx-auto max-w-6xl px-4 py-24 sm:py-36 text-center'>
                    <Badge variant='secondary' className='mb-6 rounded-full px-4 py-1 text-sm'>
                        <Zap className='h-3.5 w-3.5 text-blue-500 mr-1' /> The Ultimate PC Enthusiast Community
                    </Badge>
                    <h1 className='text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight'>
                        Build Your <span className='text-blue-600'>Dream Rig</span> with Confidence
                    </h1>
                    <p className='mt-6 text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-medium'>
                        Join BuildMyRig to showcase your setup, find deals, and connect with builders across Bangladesh.
                    </p>
                    <div className='mt-10 flex flex-wrap justify-center gap-4'>
                        <Button size='lg' className='bg-blue-600 text-white px-8 rounded-full' asChild>
                            <Link href='/signup'>Join Community <ArrowRight className='ml-2 h-4 w-4' /></Link>
                        </Button>
                        <Button size='lg' variant='outline' className='px-8 rounded-full' asChild>
                            <Link href='/marketplace'>Explore Market</Link>
                        </Button>
                    </div>
                </div>
            </section>

			{/* Hero */}
			<section className='relative overflow-hidden'>
				{/* Background gradients */}
				<div className='pointer-events-none absolute inset-0 -z-10'>
					<div className='absolute left-1/2 top-0 h-150 w-225 -translate-x-1/2 rounded-full bg-linear-to-b from-blue-100/60 to-transparent dark:from-blue-900/20 blur-3xl' />
				</div>

				<div className='mx-auto max-w-6xl px-4 sm:px-6 py-24 sm:py-36 text-center'>
					<Badge
						variant='secondary'
						className='mb-6 inline-flex gap-1.5 rounded-full px-4 py-1 text-sm font-medium'
					>
						<Zap className='h-3.5 w-3.5 text-blue-500' />
						The Ultimate PC Building Platform
					</Badge>

					<h1 className='mx-auto max-w-3xl text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight'>
						Design your dream rig with confidence
					</h1>

					<p className='mx-auto mt-6 max-w-xl text-lg sm:text-xl text-slate-500 dark:text-slate-400 leading-relaxed'>
						Plan your custom PC, check part compatibility, and visualize your final build with AI — all in one place.
					</p>

					<div className='mt-10 flex flex-col sm:flex-row items-center justify-center gap-4'>
						<Button
							size='lg'
							className='w-full sm:w-auto bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 px-8'
							asChild
						>
							<Link href='/build-planner'>
								Start Building <ArrowRight className='ml-2 h-4 w-4' />
							</Link>
						</Button>
						<Button
							size='lg'
							variant='outline'
							className='w-full sm:w-auto px-8 border-slate-200 dark:border-slate-700'
							asChild
						>
							<Link href='/signin'>Sign in</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* Features */}
			<section className='bg-slate-50 dark:bg-slate-900/50 py-20 sm:py-28'>
				<div className='mx-auto max-w-6xl px-4 sm:px-6'>
					<div className='text-center mb-16'>
						<h2 className='text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white'>
							Everything you need to build smarter
						</h2>
						<p className='mt-3 text-slate-500 max-w-lg mx-auto'>
							AI guidance, part compatibility checks, visual previews, and wattage planning — all included.
						</p>
					</div>

					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
						{features.map(({ icon: Icon, title, description, color, bg }) => (
							<Card
								key={title}
								className='border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow'
							>
								<CardHeader className='pb-3'>
									<div
										className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}
									>
										<Icon className={`h-5 w-5 ${color}`} />
									</div>
									<CardTitle className='text-base font-semibold text-slate-900 dark:text-white'>
										{title}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<CardDescription className='text-sm leading-relaxed'>
										{description}
									</CardDescription>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className='py-20 sm:py-28'>
				<div className='mx-auto max-w-6xl px-4 sm:px-6'>
					<div className='relative rounded-3xl overflow-hidden bg-linear-to-br from-blue-600 via-indigo-600 to-violet-600 p-12 text-center shadow-2xl'>
						<div className='pointer-events-none absolute inset-0'>
							<div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
						</div>
						<h2 className='relative text-3xl sm:text-4xl font-bold text-white'>
							Ready to build your ultimate rig?
						</h2>
						<p className='relative mt-3 text-blue-100 max-w-md mx-auto'>
							Join the community and save your custom PC builds today.
						</p>
						<Button
							size='lg'
							className='relative mt-8 bg-white text-blue-700 hover:bg-blue-50 shadow-lg font-semibold px-10'
							asChild
						>
							<Link href='/build-planner'>
								Go to Build Planner <ArrowRight className='ml-2 h-4 w-4' />
							</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className='border-t border-slate-200 dark:border-slate-800 py-8'>
				<div className='mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400'>
					<div className='flex items-center gap-2'>
						<div className='flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-indigo-600'>
							<Zap className='h-3.5 w-3.5 text-white' />
						</div>
						<span className='font-semibold text-slate-600 dark:text-slate-300'>
							BuildMyRig
						</span>
					</div>
					<p>© {new Date().getFullYear()} BuildMyRig. All rights reserved.</p>
				</div>
			</footer>
		</div>
	);
}
