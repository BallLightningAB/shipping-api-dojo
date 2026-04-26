import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { carrierSurfaces } from "@/content/carriers";
import type { CarrierSurface } from "@/content/types";
import { generateCanonical, generateMeta } from "@/lib/seo/meta";
import {
	generateBreadcrumbListSchema,
	jsonLdScript,
} from "@/lib/seo/structured-data";

const CARRIER_INDEX_PATH = "/wiki/carriers";
const CARRIER_INDEX_TITLE = "Carrier API Surfaces";
const CARRIER_INDEX_DESCRIPTION =
	"Vendor-, business-unit-, region-, and protocol-specific carrier API references for DHL Express, DHL eCommerce, DHL Parcel DE, UPS, FedEx, USPS, Royal Mail, La Poste Colissimo, and Australia Post.";

interface CarrierVendorGroup {
	vendor: string;
	vendorSlug: string;
	surfaces: CarrierSurface[];
}

function groupSurfacesByVendor(
	surfaces: CarrierSurface[]
): CarrierVendorGroup[] {
	const groups = new Map<string, CarrierVendorGroup>();
	for (const surface of surfaces) {
		const existing = groups.get(surface.vendorSlug);
		if (existing) {
			existing.surfaces.push(surface);
			continue;
		}
		groups.set(surface.vendorSlug, {
			vendor: surface.vendor,
			vendorSlug: surface.vendorSlug,
			surfaces: [surface],
		});
	}

	for (const group of groups.values()) {
		group.surfaces.sort((left, right) => left.title.localeCompare(right.title));
	}

	return [...groups.values()].sort((left, right) =>
		left.vendor.localeCompare(right.vendor)
	);
}

const STATUS_LABEL: Record<CarrierSurface["status"], string> = {
	active: "Active",
	preview: "Preview",
	deprecated: "Deprecated",
	sunset: "Sunset",
	legacy: "Legacy",
};

export const Route = createFileRoute("/wiki/carriers/")({
	head: () => ({
		meta: [
			...generateMeta({
				title: CARRIER_INDEX_TITLE,
				description: CARRIER_INDEX_DESCRIPTION,
				url: CARRIER_INDEX_PATH,
			}),
		],
		links: [generateCanonical(CARRIER_INDEX_PATH)],
		scripts: [
			{
				type: "application/ld+json",
				children: jsonLdScript(
					generateBreadcrumbListSchema([
						{ name: "Home", url: "/" },
						{ name: "Wiki", url: "/wiki" },
						{ name: "Carrier surfaces", url: CARRIER_INDEX_PATH },
					])
				),
			},
		],
	}),
	component: CarrierIndexPage,
});

function CarrierIndexPage() {
	const groups = groupSurfacesByVendor(carrierSurfaces);

	return (
		<div className="container mx-auto max-w-4xl px-4 py-16">
			<h1 className="mb-4">Carrier API Surfaces</h1>
			<p className="mb-10 max-w-2xl text-lg text-muted-foreground">
				Carrier APIs grouped by vendor, business unit, country, and protocol.
				Each page documents one specific surface so DHL Express, DHL eCommerce,
				and DHL Parcel DE are not collapsed into a single "DHL" summary.
			</p>

			{groups.map((group) => (
				<section className="mb-10" key={group.vendorSlug}>
					<h2 className="mb-4 text-xl">{group.vendor}</h2>
					<div className="space-y-3">
						{group.surfaces.map((surface) => (
							<Link
								key={surface.slug}
								to="/wiki/carriers/$slug"
								params={{ slug: surface.slug }}
							>
								<Card className="group transition-all duration-200 hover:-translate-y-0.5 hover:border-bl-red/30">
									<CardHeader>
										<div className="flex items-start justify-between gap-3">
											<CardTitle className="flex-1 text-base font-semibold group-hover:text-bl-red">
												{surface.title}
											</CardTitle>
											<span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
												{STATUS_LABEL[surface.status]}
											</span>
										</div>
									</CardHeader>
									<CardContent>
										<p className="text-sm text-muted-foreground">
											{surface.summary}
										</p>
									</CardContent>
								</Card>
							</Link>
						))}
					</div>
				</section>
			))}
		</div>
	);
}
