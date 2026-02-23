import { ClientOnly, createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LessonReader } from "@/components/lesson/LessonReader";
import { DrillRunner } from "@/components/drill/DrillRunner";
import { getLessonBySlug, lessons } from "@/content/lessons";
import { getDrillsByIds } from "@/content/drills";
import { completeDrill, completeLesson } from "@/lib/progress/progress.actions";
import { LessonStatus } from "@/components/progress/LessonStatus";

export const Route = createFileRoute("/lesson/$slug")({
	component: LessonPage,
	loader: ({ params }) => {
		const lesson = getLessonBySlug(params.slug);
		if (!lesson) {
			throw new Error(`Lesson not found: ${params.slug}`);
		}
		const drillData = getDrillsByIds(lesson.drillIds);
		return { lesson, drills: drillData };
	},
});

function LessonPage() {
	const { lesson, drills } = Route.useLoaderData();

	const currentIndex = lessons.findIndex((l) => l.slug === lesson.slug);
	const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
	const nextLesson =
		currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

	function handleDrillComplete(drillId: string, score: number) {
		completeDrill(lesson.slug, drillId, score);
	}

	function handleMarkComplete() {
		completeLesson(lesson.slug);
	}

	return (
		<div className="container mx-auto max-w-4xl px-4 py-16">
			{/* Breadcrumb */}
			<div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
				<Link to="/" className="hover:text-foreground">
					Home
				</Link>
				<span>/</span>
				<Link
					to={lesson.track === "soap" ? "/learn/soap" : "/learn/rest"}
					className="hover:text-foreground"
				>
					{lesson.track === "soap" ? "SOAP" : "REST"} Track
				</Link>
				<span>/</span>
				<span className="text-foreground">{lesson.title}</span>
			</div>

			{/* Title + status */}
			<div className="mb-8 flex items-start justify-between gap-4">
				<h1 className="text-3xl">{lesson.title}</h1>
				<ClientOnly fallback={null}>
					<LessonStatus lessonSlug={lesson.slug} />
				</ClientOnly>
			</div>

			{/* Lesson content */}
			<LessonReader lesson={lesson} />

			{/* Drills */}
			{drills.length > 0 && (
				<section className="mt-16">
					<h2 className="mb-6 text-2xl">Practice Drills</h2>
					<div className="space-y-8">
						{drills.map((drill) => (
							<div
								key={drill.id}
								className="rounded-lg border border-border p-6"
							>
								<DrillRunner drill={drill} onComplete={handleDrillComplete} />
							</div>
						))}
					</div>
				</section>
			)}

			{/* Mark complete + navigation */}
			<div className="mt-12 flex flex-col gap-4 border-border border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
				<ClientOnly fallback={null}>
					<Button onClick={handleMarkComplete} className="gap-2">
						<CheckCircle className="h-4 w-4" />
						Mark Lesson Complete
					</Button>
				</ClientOnly>

				<div className="flex gap-3">
					{prevLesson && (
						<Button asChild variant="outline" size="sm" className="gap-2">
							<Link to="/lesson/$slug" params={{ slug: prevLesson.slug }}>
								<ArrowLeft className="h-4 w-4" />
								Previous
							</Link>
						</Button>
					)}
					{nextLesson && (
						<Button asChild size="sm" className="gap-2">
							<Link to="/lesson/$slug" params={{ slug: nextLesson.slug }}>
								Next
								<ArrowRight className="h-4 w-4" />
							</Link>
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
