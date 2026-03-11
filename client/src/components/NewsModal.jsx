"use client";

import { useState } from "react";
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
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
			<div className="relative w-full max-h-[90vh] max-w-4xl overflow-y-auto rounded-xl bg-card shadow-2xl">
				{/* Header */}
				<div className="sticky top-0 flex items-start justify-between border-b border-border bg-card p-6">
					<div className="flex-1 pr-4">
						<div className="mb-2 flex flex-wrap gap-2">
							<span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
								{news.category}
							</span>
						</div>
						<h1 className="text-2xl font-bold text-card-foreground sm:text-3xl">
							{news.title}
						</h1>
					</div>
					<button
						onClick={onClose}
						className="flex-shrink-0 rounded-lg p-2 hover:bg-muted transition-colors"
					>
						<X className="h-6 w-6 text-muted-foreground" />
					</button>
				</div>

				{/* Content */}
				<div className="p-6">
					{/* Image */}
					{news.imageUrl && (
						<div className="mb-6 overflow-hidden rounded-lg bg-muted">
							<img
								src={news.imageUrl}
								alt={news.title}
								className="h-auto w-full object-cover max-h-96"
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
							<span>{news.source}</span>
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
							<p className="leading-relaxed text-muted-foreground">
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
							<p className="leading-relaxed text-muted-foreground">
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
