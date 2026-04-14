import { Link, createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { browserStorageItems, serverRecordItems } from "@/content/legal";
import { generateCanonical, generateMeta } from "@/lib/seo/meta";

export const Route = createFileRoute("/cookies")({
	head: () => ({
		meta: [
			...generateMeta({
				title: "Cookie & Storage Disclosure",
				description:
					"Cookie and storage disclosure for Shipping API Dojo covering necessary auth/session cookies, anonymous browser storage, and hosted account records.",
				url: "/cookies",
			}),
		],
		links: [generateCanonical("/cookies")],
	}),
	component: CookieDisclosurePage,
});

function CookieDisclosurePage() {
	return (
		<div className="container mx-auto max-w-4xl px-4 py-16">
			<div className="mb-10 space-y-4">
				<p className="font-mono text-bl-red text-sm uppercase tracking-[0.2em]">
					Legal
				</p>
				<h1>Cookie &amp; Storage Disclosure</h1>
				<p className="max-w-3xl text-lg text-muted-foreground">
					Shipping API Dojo currently relies on first-party storage needed to
					provide requested learning and account features. This page explains
					the browser storage, cookies, and hosted records that exist today.
				</p>
			</div>

			<div className="mb-12 grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>No optional tracking in this issue</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3 text-sm text-muted-foreground">
						<p>
							The current implementation does not add analytics, remarketing
							pixels, session replay tools, or other non-essential tracking
							identifiers.
						</p>
						<p>
							That means the current storage model is limited to necessary
							auth/session and requested-service functionality. If optional
							tracking is introduced later, this position must be revisited.
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>What this page does and does not cover</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3 text-sm text-muted-foreground">
						<p>
							This disclosure covers browser storage, session cookies, and
							hosted records tied to auth, progress, billing, and transactional
							email.
						</p>
						<p>
							For the broader explanation of how those records are used,
							retained, and handled through support, see the{" "}
							<Link className="text-bl-red hover:underline" to="/privacy">
								Privacy Policy
							</Link>
							.
						</p>
					</CardContent>
				</Card>
			</div>

			<section className="mb-12">
				<h2 className="mb-4 text-2xl">Browser storage and cookies</h2>
				<div className="space-y-4">
					{browserStorageItems.map((item) => (
						<StorageCard item={item} key={item.name} />
					))}
				</div>
			</section>

			<section className="mb-12">
				<h2 className="mb-4 text-2xl">
					Hosted records behind signed-in features
				</h2>
				<div className="space-y-4">
					{serverRecordItems.map((item) => (
						<StorageCard item={item} key={item.name} />
					))}
				</div>
			</section>

			<section className="border-border border-t pt-8 text-sm text-muted-foreground">
				<p>
					The product keeps these disclosures public and crawlable so the
					storage model is visible before you sign in. Settings remains the main
					in-app place to manage local browser progress and reach
					account-related requests.
				</p>
			</section>
		</div>
	);
}

function StorageCard({
	item,
}: {
	item: {
		name: string;
		purpose: string;
		required: string;
		retention: string;
		when: string;
		where: string;
	};
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{item.name}</CardTitle>
			</CardHeader>
			<CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
				<div>
					<p className="font-semibold text-foreground">Where</p>
					<p>{item.where}</p>
				</div>
				<div>
					<p className="font-semibold text-foreground">When</p>
					<p>{item.when}</p>
				</div>
				<div>
					<p className="font-semibold text-foreground">Purpose</p>
					<p>{item.purpose}</p>
				</div>
				<div>
					<p className="font-semibold text-foreground">Required</p>
					<p>{item.required}</p>
				</div>
				<div className="md:col-span-2">
					<p className="font-semibold text-foreground">Retention</p>
					<p>{item.retention}</p>
				</div>
			</CardContent>
		</Card>
	);
}
