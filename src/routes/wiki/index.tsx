import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { wikiEntries } from "@/content/wiki";
import { generateCanonical, generateMeta } from "@/lib/seo/meta";

export const Route = createFileRoute("/wiki/")({
	head: () => {
		const title = "Shipping API Wiki";
		const description =
			"Quick-reference articles on shipping and carrier API concepts, standards, retry logic, SOAP, and production debugging patterns.";

		return {
			meta: [
				...generateMeta({
					title,
					description,
					url: "/wiki",
				}),
			],
			links: [generateCanonical("/wiki")],
		};
	},
	component: WikiIndexPage,
});

function WikiIndexPage() {
	return (
		<div className="container mx-auto max-w-4xl px-4 py-16">
			<h1 className="mb-4">Wiki</h1>
			<p className="mb-10 max-w-2xl text-lg text-muted-foreground">
				Quick-reference articles on carrier integration concepts, patterns, and
				standards.
			</p>

			<div className="space-y-4">
				{wikiEntries.map((entry) => (
					<Link key={entry.slug} to="/wiki/$slug" params={{ slug: entry.slug }}>
						<Card className="group transition-all duration-200 hover:-translate-y-0.5 hover:border-bl-red/30">
							<CardHeader>
								<CardTitle className="text-base font-semibold group-hover:text-bl-red">
									{entry.title}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">{entry.summary}</p>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>
		</div>
	);
}
