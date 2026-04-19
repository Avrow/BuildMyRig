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
			className="group cursor-pointer overflow-hidden rounded-lg border border-border bg-card hover:shadow-lg transition-all duration-300 hover:border-primary/50"
		>
			{/* Image */}
			{article.imageUrl && (
				<div className="relative h-48 overflow-hidden bg-muted">
					<img
						src={article.imageUrl}
						alt={article.title}
						className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
						onError={(e) => {
							e.target.parentElement.style.display = "none";
						}}
					/>
				</div>
			)}

			{/* Content */}
			<div className="flex flex-col p-4 sm:p-5">
				<div className="mb-2 flex items-start justify-between gap-2">
					<span className="inline-block rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary flex-shrink-0">
						{article.category}
					</span>
					<span className="text-xs text-muted-foreground flex-shrink-0">
						{formatDate(article.publishedAt)}
					</span>
				</div>

				<h3 className="mb-2 line-clamp-2 text-base font-semibold text-card-foreground group-hover:text-primary transition-colors sm:text-lg">
					{article.title}
				</h3>

				<p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
					{article.summary}
				</p>

				<div className="mt-auto flex items-center justify-between">
					<span className="text-xs text-muted-foreground">
						{article.source}
					</span>
					<span className="text-xs font-medium text-primary group-hover:translate-x-1 transition-transform">
						Read more →
					</span>
				</div>
			</div>
		</article>
	);
}

function NewsPageContent() {
	const [news, setNews] = useState([]);
	const [filteredNews, setFilteredNews] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedNews, setSelectedNews] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [lastRefresh, setLastRefresh] = useState(null);

	// Fetch news
	const fetchNews = async () => {
		try {
			setRefreshing(true);
			const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/news`);

			if (selectedCategory !== "All") {
				url.searchParams.append("category", selectedCategory);
			}
			if (searchQuery) {
				url.searchParams.append("search", searchQuery);
			}

			const response = await fetch(url);
			if (!response.ok) throw new Error("Failed to fetch news");

			const data = await response.json();
			setNews(data.data || []);
			setLastRefresh(new Date().toLocaleTimeString());
		} catch (error) {
			console.error("Error fetching news:", error);
		} finally {
			setRefreshing(false);
			setLoading(false);
		}
	};

	// Filter news based on search
	useEffect(() => {
		let filtered = news;

		if (selectedCategory !== "All") {
			filtered = filtered.filter(
				(item) => item.category === selectedCategory,
			);
		}

		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(item) =>
					item.title.toLowerCase().includes(query) ||
					item.summary.toLowerCase().includes(query),
			);
		}

		setFilteredNews(filtered);
	}, [news, selectedCategory, searchQuery]);

	// Initial fetch
	useEffect(() => {
		fetchNews();
	}, []);

	// Auto-refresh every 10 minutes
	useEffect(() => {
		const interval = setInterval(() => {
			fetchNews();
		}, 10 * 60 * 1000); // 10 minutes

		return () => clearInterval(interval);
	}, [selectedCategory, searchQuery]);

	const handleCategoryChange = (category) => {
		setSelectedCategory(category);
	};

	const handleRefresh = () => {
		fetchNews();
	};

	const handleNewsClick = (article) => {
		setSelectedNews(article);
		setIsModalOpen(true);
	};

	return (
		<>
			<Navbar />
			<div className="min-h-screen bg-background">
			{/* Header */}
				<div className="border-b border-border bg-card sticky top-16 z-40">
				<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
					<div className="mb-6">
						<h1 className="text-3xl font-bold text-foreground sm:text-4xl">
							Tech News Hub
						</h1>
						<p className="mt-2 text-muted-foreground">
							Stay updated with the latest in PC components, software, and
							technology
						</p>
					</div>

					{/* Search Bar */}
					<div className="relative mb-6">
						<Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
						<Input
							type="text"
							placeholder="Search news by title or topic..."
							className="w-full pl-10"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>

					{/* Controls */}
					<div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							{lastRefresh && (
								<>
									<span>Last updated: {lastRefresh}</span>
									<span className="text-xs">
										(Auto-refreshes every 10 min)
									</span>
								</>
							)}
						</div>
						<Button
							onClick={handleRefresh}
							disabled={refreshing}
							variant="outline"
							size="sm"
							className="gap-2"
						>
							<RefreshCw
								className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
							/>
							{refreshing ? "Refreshing..." : "Refresh"}
						</Button>
					</div>
				</div>
			</div>

			{/* Category Filters */}
			<div className="border-b border-border bg-background sticky top-80 z-30">
				<div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
					<div className="flex items-center gap-2 mb-3 sm:mb-0">
						<Filter className="h-4 w-4 text-muted-foreground" />
						<span className="text-sm font-medium text-foreground">
							Categories:{" "}
						</span>
					</div>
					<div className="flex flex-wrap gap-2">
						{NEWS_CATEGORIES.map((category) => (
							<button
								key={category}
								onClick={() => handleCategoryChange(category)}
								className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
									selectedCategory === category
										? "bg-primary text-primary-foreground"
										: "bg-muted text-muted-foreground hover:bg-muted/80"
								}`}
							>
								{category}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				{loading ? (
					<div className="space-y-4">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="h-64 animate-pulse rounded-lg bg-muted"
							/>
						))}
					</div>
				) : filteredNews.length > 0 ? (
					<>
						<div className="mb-6 flex items-center justify-between">
							<h2 className="text-lg font-semibold text-foreground">
								{filteredNews.length} articles{" "}
								{selectedCategory !== "All" &&
									`in ${selectedCategory}`}
								{searchQuery && ` matching "${searchQuery}"`}
							</h2>
						</div>
						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{filteredNews.map((article) => (
								<NewsCard
									key={article.id}
									article={article}
									onClick={() => handleNewsClick(article)}
								/>
							))}
						</div>
					</>
				) : (
					<div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
						<h3 className="text-lg font-semibold text-foreground">
							No articles found
						</h3>
						<p className="mt-2 text-muted-foreground">
							Try adjusting your search or category filters
						</p>
						<Button
							onClick={handleRefresh}
							variant="outline"
							className="mt-4 gap-2"
						>
							<RefreshCw className="h-4 w-4" />
							Refresh News
						</Button>
					</div>
				)}
			</div>

			{/* Modal */}
			<NewsModal
				news={selectedNews}
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setSelectedNews(null);
				}}
			/>
			</div>
		</>
	);
}

export default function NewsPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center bg-background">
					<div className="space-y-4 text-center">
						<div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
						<p className="text-muted-foreground">
							Loading latest tech news...
						</p>
					</div>
				</div>
			}
		>
			<NewsPageContent />
		</Suspense>
	);
}
