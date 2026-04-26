import { Button } from "@/components/ui/button";
import { carrierSurfaces, getCarrierSurfaceBySlug } from "@/content/carriers";
import { directoryEntries } from "@/content/directory";
import type { CarrierSurface, DirectoryEntry } from "@/content/types";
import { wikiEntries } from "@/content/wiki";
import { generateCanonical, generateMeta } from "@/lib/seo/meta";
import {
	generateArticleSchema,
	generateBreadcrumbListSchema,
	generateFAQPageSchema,
	jsonLdScript,
} from "@/lib/seo/structured-data";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";

const PROTOCOL_LABEL: Record<CarrierSurface["protocol"], string> = {
	rest: "REST",
	soap: "SOAP",
	"edi-x12": "EDI X12",
	"edi-edifact": "EDIFACT",
	graphql: "GraphQL",
	webhook: "Webhook",
	"xml-rpc": "XML over HTTP",
};

const STATUS_LABEL: Record<CarrierSurface["status"], string> = {
	active: "Active",
	preview: "Preview",
	deprecated: "Deprecated",
	sunset: "Sunset",
	legacy: "Legacy",
};

export const Route = createFileRoute("/wiki/carriers/$slug")({
	loader: ({ params }) => {
		const surface = getCarrierSurfaceBySlug(params.slug);
		if (!surface) {
			throw new Error(`Carrier surface not found: ${params.slug}`);
		}
		return { surface };
	},
	head: ({ loaderData }) => {
		const surface = loaderData?.surface;
		if (!surface) {
			return {};
		}

		const url = `/wiki/carriers/${surface.slug}`;
		const breadcrumbs = generateBreadcrumbListSchema([
			{ name: "Home", url: "/" },
			{ name: "Wiki", url: "/wiki" },
			{ name: "Carrier surfaces", url: "/wiki/carriers" },
			{ name: surface.vendor },
			{ name: surface.title, url },
		]);
		const article = generateArticleSchema({
			title: surface.title,
			description: surface.summary,
			url,
			datePublished: surface.lastReviewed,
			dateModified: surface.lastReviewed,
		});
		const faqSchema = generateFAQPageSchema(surface.faqs);

		const scripts = [
			{ type: "application/ld+json", children: jsonLdScript(article) },
			{ type: "application/ld+json", children: jsonLdScript(breadcrumbs) },
		];
		if (faqSchema) {
			scripts.push({
				type: "application/ld+json",
				children: jsonLdScript(faqSchema),
			});
		}

		return {
			meta: [
				...generateMeta({
					title: surface.title,
					description: surface.summary,
					url,
					type: "article",
					publishedAt: surface.lastReviewed,
					modifiedAt: surface.lastReviewed,
					tags: [
						"shipping api",
						surface.vendor,
						surface.businessUnit,
						PROTOCOL_LABEL[surface.protocol],
					],
				}),
			],
			links: [generateCanonical(url)],
			scripts,
		};
	},
	component: CarrierSurfacePage,
});

function findDirectoryEntries(slugs: string[]): DirectoryEntry[] {
	return directoryEntries.filter(
		(entry) => entry.slug !== undefined && slugs.includes(entry.slug)
	);
}

function findRelatedConceptTitles(
	slugs: string[]
): { slug: string; title: string }[] {
	return slugs
		.map((slug) => {
			const entry = wikiEntries.find((item) => item.slug === slug);
			return entry ? { slug, title: entry.title } : null;
		})
		.filter(
			(value): value is { slug: string; title: string } => value !== null
		);
}

function findRelatedSurfaces(slugs: string[]): CarrierSurface[] {
	return slugs
		.map((slug) => carrierSurfaces.find((surface) => surface.slug === slug))
		.filter((surface): surface is CarrierSurface => surface !== undefined);
}

function CarrierSurfacePage() {
	const { surface } = Route.useLoaderData();
	const directoryRefs = findDirectoryEntries(surface.directorySlugs);
	const conceptRefs = findRelatedConceptTitles(surface.relatedConceptSlugs);
	const surfaceRefs = findRelatedSurfaces(surface.relatedSurfaceSlugs);
	const replacement = surface.replacementSurfaceSlug
		? getCarrierSurfaceBySlug(surface.replacementSurfaceSlug)
		: undefined;
	const isInactive =
		surface.status === "deprecated" ||
		surface.status === "sunset" ||
		surface.status === "legacy";

	return (
		<div className="container mx-auto max-w-4xl px-4 py-16">
			<div className="mb-8">
				<Button asChild variant="ghost" size="sm" className="gap-2">
					<Link to="/wiki/carriers">
						<ArrowLeft className="h-4 w-4" />
						Back to carrier surfaces
					</Link>
				</Button>
			</div>

			<div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
				<span className="rounded-full border border-border px-2 py-0.5">
					{surface.vendor}
				</span>
				<span className="rounded-full border border-border px-2 py-0.5">
					{surface.businessUnit}
				</span>
				<span className="rounded-full border border-border px-2 py-0.5 uppercase">
					{surface.region}
				</span>
				<span className="rounded-full border border-border px-2 py-0.5">
					{PROTOCOL_LABEL[surface.protocol]}
				</span>
				<span className="rounded-full border border-border px-2 py-0.5">
					{STATUS_LABEL[surface.status]}
				</span>
			</div>

			<h1 className="mb-4">{surface.title}</h1>
			<p className="text-lg text-muted-foreground">{surface.summary}</p>

			{isInactive && (
				<div className="mt-6 rounded-md border border-bl-red/40 bg-bl-red/5 p-4 text-sm">
					<p className="font-semibold">
						{STATUS_LABEL[surface.status]} surface — read before integrating.
					</p>
					{surface.deprecationNotes && (
						<p className="mt-2 text-foreground/80">
							{surface.deprecationNotes}
						</p>
					)}
					{replacement && (
						<p className="mt-2 text-foreground/80">
							Recommended replacement:{" "}
							<Link
								className="text-bl-red hover:underline"
								to="/wiki/carriers/$slug"
								params={{ slug: replacement.slug }}
							>
								{replacement.title}
							</Link>
							.
						</p>
					)}
				</div>
			)}

			<article className="prose prose-cream mt-8 max-w-none">
				<div className="whitespace-pre-line text-foreground/90 leading-relaxed">
					{surface.body}
				</div>

				<h2 className="mt-10 text-xl">Surface details</h2>
				<dl className="not-prose mt-2 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
					<div>
						<dt className="font-semibold">API name</dt>
						<dd className="text-muted-foreground">{surface.apiName}</dd>
					</div>
					<div>
						<dt className="font-semibold">Authentication</dt>
						<dd className="text-muted-foreground">
							{surface.authMethods.join("; ")}
						</dd>
					</div>
					{surface.baseUrls.production && (
						<div>
							<dt className="font-semibold">Production base URL</dt>
							<dd className="break-all text-muted-foreground">
								{surface.baseUrls.production}
							</dd>
						</div>
					)}
					{surface.baseUrls.sandbox && (
						<div>
							<dt className="font-semibold">Sandbox base URL</dt>
							<dd className="break-all text-muted-foreground">
								{surface.baseUrls.sandbox}
							</dd>
						</div>
					)}
					{surface.sandboxNotes && (
						<div className="sm:col-span-2">
							<dt className="font-semibold">Sandbox notes</dt>
							<dd className="text-muted-foreground">{surface.sandboxNotes}</dd>
						</div>
					)}
					{surface.toolingNotes?.wsdlUrl && (
						<div className="sm:col-span-2">
							<dt className="font-semibold">WSDL</dt>
							<dd className="break-all text-muted-foreground">
								<a
									className="text-bl-red hover:underline"
									href={surface.toolingNotes.wsdlUrl}
									target="_blank"
									rel="noopener noreferrer"
								>
									{surface.toolingNotes.wsdlUrl}
								</a>
							</dd>
						</div>
					)}
					{surface.toolingNotes?.openApiUrl && (
						<div className="sm:col-span-2">
							<dt className="font-semibold">OpenAPI / REST reference</dt>
							<dd className="break-all text-muted-foreground">
								<a
									className="text-bl-red hover:underline"
									href={surface.toolingNotes.openApiUrl}
									target="_blank"
									rel="noopener noreferrer"
								>
									{surface.toolingNotes.openApiUrl}
								</a>
							</dd>
						</div>
					)}
				</dl>

				{surface.faqs.length > 0 && (
					<>
						<h2 className="mt-10 text-xl">Frequently asked questions</h2>
						<div className="not-prose mt-2 space-y-4">
							{surface.faqs.map((faq) => (
								<div key={faq.question}>
									<h3 className="font-semibold">{faq.question}</h3>
									<p className="text-muted-foreground">{faq.answer}</p>
								</div>
							))}
						</div>
					</>
				)}

				{conceptRefs.length > 0 && (
					<>
						<h2 className="mt-10 text-xl">Related concepts</h2>
						<ul className="not-prose mt-2 flex flex-wrap gap-2">
							{conceptRefs.map((concept) => (
								<li key={concept.slug}>
									<Link
										className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-bl-red/50 hover:text-foreground"
										to="/wiki/$slug"
										params={{ slug: concept.slug }}
									>
										{concept.title}
									</Link>
								</li>
							))}
						</ul>
					</>
				)}

				{surfaceRefs.length > 0 && (
					<>
						<h2 className="mt-10 text-xl">Sibling carrier surfaces</h2>
						<ul className="not-prose mt-2 flex flex-wrap gap-2">
							{surfaceRefs.map((sibling) => (
								<li key={sibling.slug}>
									<Link
										className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-bl-red/50 hover:text-foreground"
										to="/wiki/carriers/$slug"
										params={{ slug: sibling.slug }}
									>
										{sibling.title}
									</Link>
								</li>
							))}
						</ul>
					</>
				)}

				{directoryRefs.length > 0 && (
					<>
						<h2 className="mt-10 text-xl">Tooling and references</h2>
						<ul className="not-prose mt-2 space-y-2">
							{directoryRefs.map((entry) => (
								<li key={entry.url}>
									<a
										className="inline-flex items-center gap-1 text-bl-red text-sm hover:underline"
										href={entry.url}
										target="_blank"
										rel="noopener noreferrer"
									>
										{entry.title}
										<ExternalLink className="h-3 w-3" />
									</a>
									<p className="text-sm text-muted-foreground">
										{entry.description}
									</p>
								</li>
							))}
						</ul>
					</>
				)}

				{surface.sources.length > 0 && (
					<>
						<h2 className="mt-10 text-xl">Sources</h2>
						<ul className="not-prose mt-2 space-y-1">
							{surface.sources.map((source) => (
								<li key={source.url}>
									<a
										className="inline-flex items-center gap-1 text-bl-red text-sm hover:underline"
										href={source.url}
										target="_blank"
										rel="noopener noreferrer"
									>
										{source.label}
										<ExternalLink className="h-3 w-3" />
									</a>
								</li>
							))}
						</ul>
					</>
				)}

				<p className="mt-8 text-xs text-muted-foreground">
					Last reviewed: {surface.lastReviewed}
				</p>
			</article>
		</div>
	);
}
