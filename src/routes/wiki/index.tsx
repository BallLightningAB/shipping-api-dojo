import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { carrierSurfaces } from "@/content/carriers";
import { wikiEntries } from "@/content/wiki";
import { generateCanonical, generateMeta } from "@/lib/seo/meta";
import { breadcrumbScripts } from "@/lib/seo/structured-data";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/wiki/")({
	head: () => {
		const title = "Shipping API Wiki";
		const description =
			"Carrier API concept articles plus vendor-, business-unit-, region-, and protocol-specific surface references for shipping integration work.";

		return {
			meta: [
				...generateMeta({
					title,
					description,
					url: "/wiki",
				}),
			],
			links: [generateCanonical("/wiki")],
			scripts: breadcrumbScripts([
				{ name: "Home", url: "/" },
				{ name: "Wiki", url: "/wiki" },
			]),
		};
	},
	component: WikiIndexPage,
});

const carrierVendorCount = new Set(
	carrierSurfaces.map((surface) => surface.vendorSlug)
).size;

function WikiIndexPage() {
	return (
		<div className="container mx-auto max-w-4xl px-4 py-16">
			<h1 className="mb-4">Wiki</h1>
			<p className="mb-10 max-w-2xl text-lg text-muted-foreground">
				Reference articles for carrier API integration work — both general
				concepts (idempotency, retry strategies, SOAP envelopes) and precise
				vendor surfaces grouped by business unit, region, and protocol.
			</p>

			<section className="mb-12">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-xl">Carrier API surfaces</h2>
					<Link
						to="/wiki/carriers"
						className="text-sm text-bl-red hover:underline"
					>
						Browse all surfaces
					</Link>
				</div>
				<p className="mb-4 text-sm text-muted-foreground">
					Specific carrier APIs, organized so DHL Express, DHL eCommerce, and
					DHL Parcel DE are documented as separate surfaces rather than a single
					"DHL" page. Currently covers {carrierSurfaces.length} surfaces across{" "}
					{carrierVendorCount} vendors.
				</p>
				<Link
					to="/wiki/carriers"
					className="block"
					aria-label="Browse all carrier surfaces"
				>
					<Card className="group transition-all duration-200 hover:-translate-y-0.5 hover:border-bl-red/30">
						<CardHeader>
							<CardTitle className="text-base font-semibold group-hover:text-bl-red">
								Carrier API surfaces ({carrierSurfaces.length})
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">
								DHL Express, DHL eCommerce Solutions, DHL Post & Parcel Germany,
								UPS, FedEx (REST and SOAP), USPS, Royal Mail, La Poste
								Colissimo, and Australia Post.
							</p>
						</CardContent>
					</Card>
				</Link>
			</section>

			<section>
				<h2 className="mb-4 text-xl">Concept articles</h2>
				<div className="space-y-4">
					{wikiEntries.map((entry) => (
						<Link
							key={entry.slug}
							to="/wiki/$slug"
							params={{ slug: entry.slug }}
						>
							<Card className="group transition-all duration-200 hover:-translate-y-0.5 hover:border-bl-red/30">
								<CardHeader>
									<CardTitle className="text-base font-semibold group-hover:text-bl-red">
										{entry.title}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground">
										{entry.summary}
									</p>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			</section>
		</div>
	);
}
