"use client";

import { useEffect, useState, Suspense } from "react";
import { Search, RefreshCw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NewsModal from "@/components/NewsModal";
import Navbar from "@/components/Navbar";

const NEWS_CATEGORIES = [
	"All",
	"PC Components & Prices",
	"Software News",
	"Tech Discoveries",
	"GPU/Graphics News",
	"CPU News",
];

// 🔍 Simple category detector
const detectCategory = (title = "") => {
	const t = title.toLowerCase();

	if (t.includes("gpu") || t.includes("graphics")) return "GPU/Graphics News";
	if (t.includes("cpu") || t.includes("intel") || t.includes("amd"))
		return "CPU News";
	if (t.includes("software") || t.includes("app")) return "Software News";
	if (t.includes("price") || t.includes("market"))
		return "PC Components & Prices";

	return "Tech Discoveries";
};

// 🔄 Normalize API response → UI format
const normalizeArticle = (item) => ({
	title: item.title || "No title",
	summary: item.description || "No description available",
	imageUrl: item.urlToImage || null,
	category: detectCategory(item.title),
	source: item.source?.name || "Unknown",
	publishedAt: item.publishedAt || new Date().toISOString(),
	url: item.url,
});

function NewsCard({ article, onClick }) {
	const formatDate = (dateString) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

		if (diffInHours < 1) return "Just now";
		if (diffInHours < 24) return `${diffInHours}h ago`;

		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
		});
	};

	return (
		<article
			onClick={onClick}
			className='group cursor-pointer overflow-hidden rounded-lg border bg-card hover:shadow-lg transition'
		>
			{/* Image */}
			{article.imageUrl && (
				<div className='h-48 overflow-hidden bg-muted'>
					<img
						src={article.imageUrl}
						alt={article.title}
						className='w-full h-full object-cover group-hover:scale-105 transition'
						onError={(e) => {
							e.target.src = "/fallback.jpg"; // optional fallback
						}}
					/>
				</div>
			)}

			{/* Content */}
			<div className='p-4'>
				<div className='flex justify-between text-xs mb-2'>
					<span className='bg-primary/10 px-2 py-1 rounded'>
						{article.category}
					</span>
					<span>{formatDate(article.publishedAt)}</span>
				</div>

				<h3 className='font-semibold line-clamp-2 mb-2'>{article.title}</h3>

				<p className='text-sm text-muted-foreground line-clamp-2'>
					{article.summary}
				</p>

				<div className='flex justify-between mt-3 text-xs'>
					<span>{article.source}</span>
					<span className='text-primary'>Read →</span>
				</div>
			</div>
		</article>
	);
}

function NewsPageContent() {
	const [news, setNews] = useState([]);
	const [filteredNews, setFilteredNews] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedNews, setSelectedNews] = useState(null);

	// 🚀 Fetch + normalize
	const fetchNews = async () => {
		try {
			setError(null);

			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news`);

			const data = await res.json();

			if (!res.ok) throw new Error("Failed to fetch");

			// support BOTH formats
			const articles = data.data || data.articles || [];

			const normalized = articles.map(normalizeArticle);

			setNews(normalized);
		} catch (err) {
			setError("Failed to load news");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchNews();
	}, []);

	// 🔎 Filter
	useEffect(() => {
		let filtered = news;

		if (selectedCategory !== "All") {
			filtered = filtered.filter((n) => n.category === selectedCategory);
		}

		if (searchQuery) {
			const q = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(n) =>
					n.title.toLowerCase().includes(q) ||
					n.summary.toLowerCase().includes(q),
			);
		}

		setFilteredNews(filtered);
	}, [news, selectedCategory, searchQuery]);

	return (
		<>
			<Navbar />

			<div className='max-w-7xl mx-auto p-4'>
				<h1 className='text-3xl font-bold mb-4'>Tech News Hub</h1>

				{/* Search */}
				<div className='relative mb-4'>
					<Search className='absolute left-3 top-3 h-4 w-4' />
					<Input
						className='pl-10'
						placeholder='Search...'
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>

				{/* Categories */}
				<div className='flex gap-2 flex-wrap mb-6'>
					{NEWS_CATEGORIES.map((cat) => (
						<button
							key={cat}
							onClick={() => setSelectedCategory(cat)}
							className={`px-3 py-1 rounded ${
								selectedCategory === cat ? "bg-primary text-white" : "bg-muted"
							}`}
						>
							{cat}
						</button>
					))}
				</div>

				{/* Content */}
				{loading ? (
					<p>Loading...</p>
				) : error ? (
					<p>{error}</p>
				) : (
					<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{filteredNews.map((article, i) => (
							<NewsCard
								key={i}
								article={article}
								onClick={() => setSelectedNews(article)}
							/>
						))}
					</div>
				)}
			</div>

			{/* Modal */}
			<NewsModal
				news={selectedNews}
				isOpen={!!selectedNews}
				onClose={() => setSelectedNews(null)}
			/>
		</>
	);
}

export default function NewsPage() {
	return (
		<Suspense fallback={<p>Loading...</p>}>
			<NewsPageContent />
		</Suspense>
	);
}
