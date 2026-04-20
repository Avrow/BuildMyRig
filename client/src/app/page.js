import Link from "next/link";
import { ArrowRight, Zap, ShieldCheck, RefreshCw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import Navbar from "@/components/Navbar";

const features = [
	{
		icon: Zap,
		title: "Fast & Modern",
		description:
			"Built with Next.js 16 and a Node.js backend delivering blazing-fast performance out of the box.",
		color: "text-yellow-500",
		bg: "bg-yellow-50 dark:bg-yellow-900/20",
	},
	{
		icon: ShieldCheck,
		title: "Secure Auth",
		description:
			"JWT tokens in httpOnly cookies protect every session with industry-standard security.",
		color: "text-green-500",
		bg: "bg-green-50 dark:bg-green-900/20",
	},
	{
		icon: RefreshCw,
		title: "Token Refresh",
		description:
			"Seamless session refresh keeps users authenticated without interrupting their workflow.",
		color: "text-blue-500",
		bg: "bg-blue-50 dark:bg-blue-900/20",
	},
	{
		icon: Users,
		title: "User Management",
		description:
			"Full register, login, and logout flow connected to a MongoDB database.",
		color: "text-violet-500",
		bg: "bg-violet-50 dark:bg-violet-900/20",
	},
];

export default function LandingPage() {
	return (
		<div className='min-h-screen bg-white dark:bg-slate-950'>
			<Navbar />

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
						Full-stack Next.js + Express starter
					</Badge>

					<h1 className='mx-auto max-w-3xl text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight'>
						Build{" "}
						<span className='bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
							faster
						</span>{" "}
						with a solid foundation
					</h1>

					<p className='mx-auto mt-6 max-w-xl text-lg sm:text-xl text-slate-500 dark:text-slate-400 leading-relaxed'>
						A production-ready authentication starter kit. Sign up, sign in,
						manage sessions — all wired up and ready to go.
					</p>

					<div className='mt-10 flex flex-col sm:flex-row items-center justify-center gap-4'>
						<Button
							size='lg'
							className='w-full sm:w-auto bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 px-8'
							asChild
						>
							<Link href='/signup'>
								Get started free <ArrowRight className='ml-2 h-4 w-4' />
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
							Everything you need
						</h2>
						<p className='mt-3 text-slate-500 max-w-lg mx-auto'>
							Authentication, session management, and modern UI — all included.
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
							Ready to get started?
						</h2>
						<p className='relative mt-3 text-blue-100 max-w-md mx-auto'>
							Create your account in seconds and explore the dashboard.
						</p>
						<Button
							size='lg'
							className='relative mt-8 bg-white text-blue-700 hover:bg-blue-50 shadow-lg font-semibold px-10'
							asChild
						>
							<Link href='/signup'>
								Create free account <ArrowRight className='ml-2 h-4 w-4' />
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
							MyApp
						</span>
					</div>
					<p>© {new Date().getFullYear()} MyApp. All rights reserved.</p>
				</div>
			</footer>
		</div>
	);
}
