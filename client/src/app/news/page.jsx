import Navbar from "@/components/Navbar";

export const metadata = {
	title: "News",
	description: "Latest technology and PC building news",
};

// force dynamic so updates from API always show
export const dynamic = "force-dynamic";

export default async function NewsPage() {
	const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
	let articles = [];

	try {
		const res = await fetch(`${API_URL}/api/news`, { cache: "no-store" });
		if (res.ok) {
			articles = await res.json();
		}
	} catch (err) {
		// swallow; front end will just render empty list
	}

	return (
		<div className='min-h-screen bg-white dark:bg-slate-950'>
			<Navbar />
			<main className='max-w-6xl mx-auto px-4 sm:px-6 py-12'>
				<h1 className='text-4xl font-bold mb-6 text-slate-900 dark:text-white'>
					Latest News
				</h1>
				{articles.length === 0 ? (
					<p className='text-slate-500 dark:text-slate-400'>
						No news available right now.
					</p>
				) : (
					<div className='space-y-8'>
						{articles.map((item) => (
							<article key={item.id} className='prose dark:prose-invert'>
								<h2 className='text-2xl font-semibold text-blue-600 dark:text-blue-400'>
									{item.title}
								</h2>
								<p className='text-sm text-slate-500 dark:text-slate-400'>
									{new Date(item.publishedAt).toLocaleDateString()}
								</p>
								<p className='mt-2 text-slate-700 dark:text-slate-300'>
									{item.summary}
								</p>
							</article>
						))}
					</div>
				)}
			</main>
		</div>
	);
}
