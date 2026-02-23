import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WikiArticle } from "@/components/wiki/WikiArticle";
import { getWikiBySlug } from "@/content/wiki";

export const Route = createFileRoute("/wiki/$slug")({
	component: WikiSlugPage,
	loader: ({ params }) => {
		const entry = getWikiBySlug(params.slug);
		if (!entry) {
			throw new Error(`Wiki entry not found: ${params.slug}`);
		}
		return { entry };
	},
});

function WikiSlugPage() {
	const { entry } = Route.useLoaderData();

	return (
		<div className="container mx-auto max-w-4xl px-4 py-16">
			<div className="mb-8">
				<Button asChild variant="ghost" size="sm" className="gap-2">
					<Link to="/wiki">
						<ArrowLeft className="h-4 w-4" />
						Back to Wiki
					</Link>
				</Button>
			</div>

			<h1 className="mb-6">{entry.title}</h1>
			<WikiArticle entry={entry} />
		</div>
	);
}
