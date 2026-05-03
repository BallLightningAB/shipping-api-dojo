import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowRight,
	BookOpen,
	CheckCircle2,
	ExternalLink,
	FolderOpen,
	HelpCircle,
	Shield,
	Swords,
} from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SUPPORT_CONTACT_LABEL, SUPPORT_EMAIL } from "@/content/legal";
import { getStorefrontPlanConfig } from "@/lib/billing/storefront";
import { generateCanonical, generateMeta } from "@/lib/seo/meta";
import { breadcrumbScripts } from "@/lib/seo/structured-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/plans")({
	loader: () => getStorefrontPlanConfig(),
	head: () => {
		const title = "Plans for Shipping API Training";
		const description =
			"Compare Free and Pro Shipping API Dojo plans for REST, SOAP, carrier integration lessons, incident practice, and premium challenge depth.";

		return {
			meta: [
				...generateMeta({
					title,
					description,
					url: "/plans",
					image: "/og-home.png",
					imageAlt:
						"Shipping API Dojo plans for Free learning and Pro challenge practice.",
					type: "website",
				}),
			],
			links: [generateCanonical("/plans")],
			scripts: breadcrumbScripts([
				{ name: "Home", url: "/" },
				{ name: "Plans", url: "/plans" },
			]),
		};
	},
	component: PlansPage,
});

const supportHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
	"Shipping API Dojo plan inquiry",
)}`;

const productLinks = [
	{ href: "/learn/rest", label: "REST lessons", icon: BookOpen },
	{ href: "/learn/soap", label: "SOAP lessons", icon: BookOpen },
	{ href: "/arena", label: "Incident Arena", icon: Swords },
	{ href: "/wiki", label: "Wiki", icon: Shield },
	{ href: "/directory", label: "Directory", icon: FolderOpen },
];

function PlanFeature({ children }: { children: ReactNode }) {
	return (
		<li className="flex gap-2">
			<CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
			<span>{children}</span>
		</li>
	);
}

function StorefrontButton({
	children,
	fallbackLabel,
	fallbackSubject,
	storefrontUrl,
}: {
	children: ReactNode;
	fallbackLabel: string;
	fallbackSubject: string;
	storefrontUrl: string | null;
}) {
	if (storefrontUrl) {
		return (
			<Button
				asChild
				className="w-full gap-2 bg-blue-600 text-white hover:bg-blue-700"
			>
				<a href={storefrontUrl} rel="noopener noreferrer" target="_blank">
					{children}
					<ExternalLink className="h-4 w-4" />
				</a>
			</Button>
		);
	}

	return (
		<Button asChild className="w-full gap-2" variant="outline">
			<a
				href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
					fallbackSubject,
				)}`}
			>
				{fallbackLabel}
				<ArrowRight className="h-4 w-4" />
			</a>
		</Button>
	);
}

function PlanCard({
	title,
	titleIcon,
	description,
	features,
	action,
	cardClassName,
}: {
	title: string;
	titleIcon?: ReactNode;
	description: string;
	features: string[];
	action: ReactNode;
	cardClassName?: string;
}) {
	return (
		<Card className={cardClassName}>
			<CardHeader>
				<div className="flex items-center gap-2">
					{titleIcon}
					<h2 className={cn("font-semibold leading-none")}>{title}</h2>
				</div>
				<p className="text-muted-foreground text-sm">{description}</p>
			</CardHeader>
			<CardContent className="space-y-5">
				<ul className="space-y-3 text-sm text-muted-foreground">
					{features.map((feature) => (
						<PlanFeature key={feature}>{feature}</PlanFeature>
					))}
				</ul>
				{action}
			</CardContent>
		</Card>
	);
}

function PlansPage() {
	const storefront = Route.useLoaderData();

	return (
		<div className="container mx-auto max-w-6xl px-4 py-16">
			<section className="max-w-3xl">
				<p className="mb-3 font-semibold text-blue-400 text-sm uppercase">
					Shipping API Dojo plans
				</p>
				<h1 className="mb-5 text-4xl">Plans for shipping API training</h1>
				<p className="text-lg text-muted-foreground">
					Shipping API Dojo teaches REST, SOAP, carrier integration patterns,
					and production troubleshooting through crawlable lessons, drills, wiki
					references, and incident scenarios. Free keeps the public learning
					surface open. Pro adds paid challenge depth for people who want more
					practice.
				</p>
			</section>

			<section className="mt-12 grid gap-5 lg:grid-cols-4">
				<PlanCard
					action={
						<Button asChild className="w-full" variant="outline">
							<Link to="/learn/rest">Start Free</Link>
						</Button>
					}
					cardClassName="border-border"
					description="Open public core"
					features={[
						"Public REST, SOAP, and cross-track lessons",
						"Core lesson drills and standard arena scenarios",
						"Wiki and carrier API directory access",
						"Signed-in server-backed progress",
					]}
					title="Free"
				/>

				<PlanCard
					action={
						<StorefrontButton
							fallbackLabel="Ask support for Pro Monthly"
							fallbackSubject="Shipping API Dojo Pro monthly inquiry"
							storefrontUrl={storefront.monthly.storefrontUrl}
						>
							Buy Pro Monthly
						</StorefrontButton>
					}
					cardClassName="border-blue-500/60"
					description="Premium practice, monthly billing"
					features={[
						"Everything in Free",
						"Premium lesson challenge rerolls",
						"Advanced incident review depth",
						"More scenario and drill variant practice",
					]}
					title="Pro Monthly"
				/>

				<PlanCard
					action={
						<StorefrontButton
							fallbackLabel="Ask support for Pro Annual"
							fallbackSubject="Shipping API Dojo Pro annual inquiry"
							storefrontUrl={storefront.annual.storefrontUrl}
						>
							Buy Pro Annual
						</StorefrontButton>
					}
					cardClassName="border-blue-500/60"
					description="The same Pro capability set, annual billing"
					features={[
						"Everything in Free",
						"Premium lesson challenge rerolls",
						"Advanced incident review depth",
						"Annual Pro purchase through Creem Storefront",
					]}
					title="Pro Annual"
				/>

				<PlanCard
					action={
						<Button asChild className="w-full" variant="outline">
							<a href={supportHref}>Contact support</a>
						</Button>
					}
					cardClassName="border-border bg-muted/20"
					description="Inquiry-only, not implemented as checkout"
					features={[
						"No Team or Enterprise checkout is live today",
						"No Enterprise Creem product is configured",
						"Support handles procurement, team, and custom-access questions manually",
					]}
					title="Team / Enterprise"
					titleIcon={<HelpCircle className="h-5 w-5 text-muted-foreground" />}
				/>
			</section>

			<section className="mt-12 grid gap-5 md:grid-cols-[1.3fr_0.7fr]">
				<div className="rounded-lg border border-border p-6">
					<h2 className="mb-3 text-xl">Public content stays open</h2>
					<p className="text-muted-foreground text-sm">
						Pro unlocks paid practice actions and depth. It does not hide the
						public lessons, wiki, carrier reference pages, or directory from
						search users.
					</p>
					<div className="mt-5 flex flex-wrap gap-3">
						{productLinks.map((link) => (
							<Button asChild key={link.href} size="sm" variant="outline">
								<Link to={link.href}>
									<link.icon className="h-4 w-4" />
									{link.label}
								</Link>
							</Button>
						))}
					</div>
				</div>

				<div className="rounded-lg border border-border p-6">
					<h2 className="mb-3 text-xl">Support and legal</h2>
					<p className="text-muted-foreground text-sm">
						Use {SUPPORT_CONTACT_LABEL} for Enterprise, teams, procurement,
						custom access, or billing questions.
					</p>
					<div className="mt-5 flex flex-wrap gap-3">
						<Button asChild size="sm" variant="outline">
							<a href={supportHref}>Email support</a>
						</Button>
						<Button asChild size="sm" variant="outline">
							<Link to="/privacy">Privacy</Link>
						</Button>
						<Button asChild size="sm" variant="outline">
							<Link to="/cookies">Cookies</Link>
						</Button>
					</div>
				</div>
			</section>
		</div>
	);
}
