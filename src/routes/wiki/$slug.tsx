import { Button } from "@/components/ui/button";
import { WikiArticle } from "@/components/wiki/WikiArticle";
import { getWikiBySlug } from "@/content/wiki";
import { generateCanonical, generateMeta } from "@/lib/seo/meta";
import {
	generateArticleSchema,
	generateBreadcrumbListSchema,
	jsonLdScript,
} from "@/lib/seo/structured-data";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/wiki/$slug")({
	loader: ({ params }) => {
		const entry = getWikiBySlug(params.slug);
		if (!entry) {
			throw new Error(`Wiki entry not found: ${params.slug}`);
		}
		return { entry };
	},
	head: ({ loaderData }) => {
		const entry = loaderData?.entry;
		if (!entry) {
			return {};
		}

		const url = `/wiki/${entry.slug}`;

		return {
			meta: [
				...generateMeta({
					title: entry.title,
					description: entry.summary,
					url,
					type: "article",
					tags: ["shipping api", "carrier api", "wiki"],
				}),
			],
			links: [generateCanonical(url)],
			scripts: [
				{
					type: "application/ld+json",
					children: jsonLdScript(
						generateArticleSchema({
							title: entry.title,
							description: entry.summary,
							url,
						})
					),
				},
				{
					type: "application/ld+json",
					children: jsonLdScript(
						generateBreadcrumbListSchema([
							{ name: "Home", url: "/" },
							{ name: "Wiki", url: "/wiki" },
							{ name: entry.title, url },
						])
					),
				},
			],
		};
	},
	component: WikiSlugPage,
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
