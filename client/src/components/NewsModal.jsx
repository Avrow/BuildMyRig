"use client";

import { X, ExternalLink, Clock, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewsModal({ news, isOpen, onClose }) {
	if (!isOpen || !news) return null;

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
			<div className="relative w-full max-h-[90vh] max-w-4xl overflow-y-auto rounded-2xl border border-border/70 bg-card shadow-2xl">
				{/* Header */}
				<div className="sticky top-0 flex items-start justify-between border-b border-border bg-gradient-to-r from-card via-card to-muted/30 p-6">
					<div className="flex-1 pr-4">
						<div className="-mt-1 mb-2 flex flex-wrap gap-2">
							<span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary">
								{news.category}
							</span>
						</div>
						<h1 className="text-2xl font-bold leading-tight text-card-foreground sm:text-3xl">
							{news.title}
						</h1>
					</div>
					<button
						onClick={onClose}
						className="flex-shrink-0 rounded-full border border-border bg-background/80 p-2 transition-colors hover:bg-muted"
						aria-label="Close news modal"
					>
						<X className="h-6 w-6 text-muted-foreground" />
					</button>
				</div>

				{/* Content */}
				<div className="p-6 sm:p-7">
					{/* Image */}
					{news.imageUrl && (
						<div className="mb-6 overflow-hidden rounded-xl border border-border/70 bg-muted">
							<img
								src={news.imageUrl}
								alt={news.title}
								className="max-h-96 h-auto w-full object-cover"
								onError={(e) => {
									e.target.style.display = "none";
								}}
							/>
						</div>
					)}

					{/* Meta Information */}
					<div className="mb-6 flex flex-wrap gap-4 border-b border-border pb-6 text-sm text-muted-foreground">
						<div className="flex items-center gap-2">
							<Building2 className="h-4 w-4" />
							<span className="font-medium">{news.source}</span>
						</div>
						<div className="flex items-center gap-2">
							<Clock className="h-4 w-4" />
							<span>{formatDate(news.publishedAt)}</span>
						</div>
					</div>

					{/* Description */}
					{news.description && (
						<div className="mb-6">
							<h2 className="mb-3 text-lg font-semibold text-card-foreground">
								Summary
							</h2>
							<p className="leading-7 text-muted-foreground">
								{news.description}
							</p>
						</div>
					)}

					{/* Content */}
					{news.content && (
						<div className="mb-6">
							<h2 className="mb-3 text-lg font-semibold text-card-foreground">
								Full Article
							</h2>
							<p className="leading-7 text-muted-foreground">
								{news.content}
							</p>
						</div>
					)}

					{/* Full Article Link */}
					<div className="mt-8 border-t border-border pt-6">
						<a
							href={news.originalUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex"
						>
							<Button className="gap-2">
								Read Full Article
								<ExternalLink className="h-4 w-4" />
							</Button>
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}
