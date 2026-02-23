/**
 * Wiki article renderer with references.
 */

import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import type { WikiEntry } from "@/content/types";

interface WikiArticleProps {
	entry: WikiEntry;
}

export function WikiArticle({ entry }: WikiArticleProps) {
	return (
		<article className="prose prose-cream max-w-none">
			<p className="text-lg text-muted-foreground">{entry.summary}</p>

			<div className="mt-6 whitespace-pre-line text-foreground/90 leading-relaxed">
				{entry.body}
			</div>

			{/* Sources */}
			{entry.sources.length > 0 && (
				<div className="mt-8">
					<h3 className="text-lg">Sources</h3>
					<ul className="mt-2 space-y-1">
						{entry.sources.map((source) => (
							<li key={source.url}>
								<a
									href={source.url}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1 text-bl-red text-sm hover:underline"
								>
									{source.label}
									<ExternalLink className="h-3 w-3" />
								</a>
							</li>
						))}
					</ul>
				</div>
			)}

			{/* Related articles */}
			{entry.relatedSlugs.length > 0 && (
				<div className="mt-8">
					<h3 className="text-lg">Related</h3>
					<div className="mt-2 flex flex-wrap gap-2">
						{entry.relatedSlugs.map((slug) => (
							<Link
								key={slug}
								to="/wiki/$slug"
								params={{ slug }}
								className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-bl-red/50 hover:text-foreground"
							>
								{slug.replace(/-/g, " ")}
							</Link>
						))}
					</div>
				</div>
			)}
		</article>
	);
}
