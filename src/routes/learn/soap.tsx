import { ClientOnly, createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LessonStatus } from "@/components/progress/LessonStatus";
import { getLessonsByTrack } from "@/content/lessons";
import { generateCanonical, generateMeta } from "@/lib/seo/meta";

export const Route = createFileRoute("/learn/soap")({
	head: () => {
		const title = "SOAP Shipping API Training";
		const description =
			"Learn SOAP envelopes, XML namespaces, WSDL contracts, and fault handling for legacy shipping and carrier integrations.";

		return {
			meta: [
				...generateMeta({
					title,
					description,
					url: "/learn/soap",
					image: "/og-soap.png",
					imageAlt:
						"SOAP Track preview with XML envelope structure, WSDL focus, and SOAP fault cues.",
					type: "website",
				}),
			],
			links: [generateCanonical("/learn/soap")],
		};
	},
	component: SoapTrackPage,
});

function SoapTrackPage() {
	const soapLessons = getLessonsByTrack("soap");

	return (
		<div className="container mx-auto max-w-4xl px-4 py-16">
			<h1 className="mb-4">SOAP Track</h1>
			<p className="mb-10 max-w-2xl text-lg text-muted-foreground">
				Navigate SOAP envelopes, XML namespaces, WSDL contracts, and fault
				handling for legacy carrier integrations.
			</p>

			<div className="space-y-4">
				{soapLessons.map((lesson, i) => (
					<Link
						key={lesson.slug}
						to="/lesson/$slug"
						params={{ slug: lesson.slug }}
					>
						<Card className="group transition-all duration-200 hover:-translate-y-0.5 hover:border-bl-red/30">
							<CardHeader className="flex flex-row items-center gap-4">
								<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bl-red/10 font-mono text-sm text-bl-red">
									{i + 1}
								</span>
								<div className="flex-1">
									<CardTitle className="text-base font-semibold group-hover:text-bl-red">
										{lesson.title}
									</CardTitle>
								</div>
								<ClientOnly fallback={null}>
									<LessonStatus lessonSlug={lesson.slug} />
								</ClientOnly>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									{lesson.summary}
								</p>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>

			<div className="mt-10">
				<Button asChild variant="outline" className="gap-2">
					<Link to="/arena">
						Try the Incident Arena
						<ArrowRight className="h-4 w-4" />
					</Link>
				</Button>
			</div>
		</div>
	);
}
