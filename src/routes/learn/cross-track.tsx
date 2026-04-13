import { ClientOnly, createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { LessonStatus } from "@/components/progress/LessonStatus";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLessonsByTrackRuntime } from "@/content/runtime";
import { generateCanonical, generateMeta } from "@/lib/seo/meta";

export const Route = createFileRoute("/learn/cross-track")({
	head: () => {
		const title = "Cross-Track Shipping Integration Training";
		const description =
			"Compare sandbox and production behavior, capability matrices, and architecture decisions across shipping REST and SOAP integrations.";

		return {
			meta: [
				...generateMeta({
					title,
					description,
					url: "/learn/cross-track",
					image: "/og-home.png",
					imageAlt:
						"Cross-track hub preview covering environment drift, carrier capability matrices, and integration architecture.",
					type: "website",
				}),
			],
			links: [generateCanonical("/learn/cross-track")],
		};
	},
	component: CrossTrackPage,
});

function CrossTrackPage() {
	const crossTrackLessons = getLessonsByTrackRuntime("cross-track");

	return (
		<div className="container mx-auto max-w-4xl px-4 py-16">
			<h1 className="mb-4">Cross-Track Hub</h1>
			<p className="mb-10 max-w-2xl text-lg text-muted-foreground">
				Compare sandbox and production behavior, capability matrices, and
				integration architecture patterns that cut across both REST and SOAP
				carrier work.
			</p>

			<div className="space-y-4">
				{crossTrackLessons.map((lesson, i) => (
					<Link
						key={lesson.slug}
						params={{ slug: lesson.slug }}
						to="/lesson/$slug"
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
				<Button asChild className="gap-2" variant="outline">
					<Link to="/arena">
						Try the Incident Arena
						<ArrowRight className="h-4 w-4" />
					</Link>
				</Button>
			</div>
		</div>
	);
}
