import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { directoryEntries } from "@/content/directory";
import { generateCanonical, generateMeta } from "@/lib/seo/meta";

export const Route = createFileRoute("/directory")({
	head: () => {
		const title = "Shipping API Directory";
		const description =
			"Curated shipping API directory of specs, tools, carrier developer portals, and community resources for integration work.";

		return {
			meta: [
				...generateMeta({
					title,
					description,
					url: "/directory",
				}),
			],
			links: [generateCanonical("/directory")],
		};
	},
	component: DirectoryPage,
});

const categoryLabels: Record<string, string> = {
	spec: "Specifications & Standards",
	tool: "Tools",
	carrier: "Carrier Developer Portals",
	community: "Community Resources",
};

const categoryOrder = ["spec", "tool", "carrier", "community"];

function DirectoryPage() {
	return (
		<div className="container mx-auto max-w-4xl px-4 py-16">
			<h1 className="mb-4">Directory</h1>
			<p className="mb-10 max-w-2xl text-lg text-muted-foreground">
				Curated links to specs, tools, carrier portals, and community resources
				for carrier API integration work.
			</p>

			{categoryOrder.map((cat) => {
				const entries = directoryEntries.filter((e) => e.category === cat);
				if (entries.length === 0) {
					return null;
				}
				return (
					<section key={cat} className="mb-10">
						<h2 className="mb-4 text-xl">{categoryLabels[cat] ?? cat}</h2>
						<div className="space-y-3">
							{entries.map((entry) => (
								<a
									key={entry.url}
									href={entry.url}
									target="_blank"
									rel="noopener noreferrer"
									className="block"
								>
									<Card className="group transition-all duration-200 hover:-translate-y-0.5 hover:border-bl-red/30">
										<CardHeader className="flex flex-row items-center gap-3 pb-2">
											<CardTitle className="flex-1 text-base font-semibold group-hover:text-bl-red">
												{entry.title}
											</CardTitle>
											<ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
										</CardHeader>
										<CardContent>
											<p className="text-sm text-muted-foreground">
												{entry.description}
											</p>
										</CardContent>
									</Card>
								</a>
							))}
						</div>
					</section>
				);
			})}
		</div>
	);
}
