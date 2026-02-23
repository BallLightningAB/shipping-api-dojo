import { ClientOnly, createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LessonStatus } from "@/components/progress/LessonStatus";
import { getLessonsByTrack } from "@/content/lessons";

export const Route = createFileRoute("/learn/rest")({
	component: RestTrackPage,
});

function RestTrackPage() {
	const restLessons = getLessonsByTrack("rest");
	const introLesson = getLessonsByTrack("intro");
	const allLessons = [...introLesson, ...restLessons];

	return (
		<div className="container mx-auto max-w-4xl px-4 py-16">
			<h1 className="mb-4">REST Track</h1>
			<p className="mb-10 max-w-2xl text-lg text-muted-foreground">
				Master HTTP semantics, authentication, error handling, and webhook
				patterns for carrier REST API integrations.
			</p>

			<div className="space-y-4">
				{allLessons.map((lesson, i) => (
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
					<Link to="/learn/soap">
						Continue to SOAP Track
						<ArrowRight className="h-4 w-4" />
					</Link>
				</Button>
			</div>
		</div>
	);
}
