import { Link, createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	privacyOverviewSections,
	retentionSummaryItems,
	SUPPORT_CONTACT_LABEL,
	SUPPORT_EMAIL,
} from "@/content/legal";
import { generateCanonical, generateMeta } from "@/lib/seo/meta";

export const Route = createFileRoute("/privacy")({
	head: () => ({
		meta: [
			...generateMeta({
				title: "Privacy Policy",
				description:
					"Privacy policy for Shipping API Dojo covering account data, anonymous browser progress, billing records, and transactional email.",
				url: "/privacy",
			}),
		],
		links: [generateCanonical("/privacy")],
	}),
	component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
	const deletionMailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
		"Shipping API Dojo deletion request"
	)}`;
	const privacyMailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
		"Shipping API Dojo privacy request"
	)}`;

	return (
		<div className="container mx-auto max-w-4xl px-4 py-16">
			<div className="mb-10 space-y-4">
				<p className="font-mono text-bl-red text-sm uppercase tracking-[0.2em]">
					Legal
				</p>
				<h1>Privacy Policy</h1>
				<p className="max-w-3xl text-lg text-muted-foreground">
					This policy describes how Shipping API Dojo handles anonymous browser
					progress, signed-in account data, subscription records, and
					transactional email for the hosted product at shipping.apidojo.app.
				</p>
			</div>

			<div className="mb-12 grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Controller and contact</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3 text-sm text-muted-foreground">
						<p>
							Shipping API Dojo is operated by Ball Lightning AB. Privacy and
							support requests currently route through{" "}
							<a
								className="text-bl-red hover:underline"
								href={`mailto:${SUPPORT_EMAIL}`}
							>
								{SUPPORT_EMAIL}
							</a>
							.
						</p>
						<p>
							This remains the manual request path for access, export, and
							deletion handling until dedicated account tooling is expanded.
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Current tracking position</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3 text-sm text-muted-foreground">
						<p>
							The current issue-12 implementation assumes no analytics,
							remarketing pixels, session replay tooling, or other optional
							tracking identifiers are enabled.
						</p>
						<p>
							That is why the product can currently rely on necessary
							auth/session and requested-service storage without a consent
							banner. If optional tracking is introduced later, this position
							must be revisited.
						</p>
					</CardContent>
				</Card>
			</div>

			<section className="mb-12">
				<h2 className="mb-4 text-2xl">What we process</h2>
				<div className="space-y-4">
					{privacyOverviewSections.map((section) => (
						<Card key={section.title}>
							<CardHeader>
								<CardTitle>{section.title}</CardTitle>
								<p className="text-sm text-muted-foreground">
									{section.summary}
								</p>
							</CardHeader>
							<CardContent>
								<ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
									{section.details.map((detail) => (
										<li key={detail}>{detail}</li>
									))}
								</ul>
							</CardContent>
						</Card>
					))}
				</div>
			</section>

			<section className="mb-12">
				<h2 className="mb-4 text-2xl">How we use the data</h2>
				<div className="prose prose-cream max-w-none">
					<ul>
						<li>
							Provide the learning product and keep requested features working.
						</li>
						<li>Authenticate signed-in users and secure account access.</li>
						<li>Persist signed-in progress across sessions and devices.</li>
						<li>
							Reflect subscription and entitlement state for paid features.
						</li>
						<li>Send transactional account and billing email.</li>
						<li>
							Prevent abuse, investigate incidents, and meet legal, accounting,
							or fraud-prevention obligations.
						</li>
					</ul>
				</div>
			</section>

			<section className="mb-12">
				<h2 className="mb-4 text-2xl">Key service providers</h2>
				<div className="prose prose-cream max-w-none">
					<ul>
						<li>
							<strong>Better Auth</strong> powers account and session flows
							inside the product.
						</li>
						<li>
							<strong>Hosted database infrastructure</strong> stores account,
							progress, entitlement, billing-event, and email-event records used
							by the product.
						</li>
						<li>
							<strong>Creem</strong> handles subscriptions and payment-provider
							events for paid plans.
						</li>
						<li>
							<strong>Resend</strong> handles transactional email delivery and
							webhook event reporting.
						</li>
					</ul>
				</div>
			</section>

			<section className="mb-12">
				<h2 className="mb-4 text-2xl">Retention summary</h2>
				<div className="space-y-4">
					{retentionSummaryItems.map((item) => (
						<Card key={item.category}>
							<CardHeader>
								<CardTitle>{item.category}</CardTitle>
								<p className="text-sm text-muted-foreground">
									{item.retention}
								</p>
							</CardHeader>
							<CardContent>
								<ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
									{item.notes.map((note) => (
										<li key={note}>{note}</li>
									))}
								</ul>
							</CardContent>
						</Card>
					))}
				</div>
			</section>

			<section className="mb-12">
				<h2 className="mb-4 text-2xl">Your rights and requests</h2>
				<div className="prose prose-cream max-w-none">
					<p>
						You can use the <Link to="/settings">settings page</Link> to manage
						local browser progress and, once signed in, to reach account-related
						privacy actions as they are exposed in-product.
					</p>
					<p>
						For access, export, correction, deletion, or retention questions,
						contact {SUPPORT_CONTACT_LABEL} at{" "}
						<a href={privacyMailto}>{SUPPORT_EMAIL}</a>. Deletion requests are
						currently handled manually because account data can span auth,
						progress, subscriptions, billing events, and email-event records.
					</p>
					<p>
						Some records may need to be retained even after a deletion request
						is processed where billing, accounting, tax, fraud-prevention, abuse
						prevention, or dispute obligations apply.
					</p>
				</div>
				<div className="mt-4">
					<a className="text-bl-red hover:underline" href={deletionMailto}>
						Email a deletion request
					</a>
				</div>
			</section>

			<section className="border-border border-t pt-8 text-sm text-muted-foreground">
				<p>
					For a storage-specific view of browser storage, cookies, and hosted
					records, see the{" "}
					<Link className="text-bl-red hover:underline" to="/cookies">
						Cookie &amp; Storage Disclosure
					</Link>
					.
				</p>
			</section>
		</div>
	);
}
