import { DrillRunner } from "@/components/drill/DrillRunner";
import { LessonReader } from "@/components/lesson/LessonReader";
import { LessonStatus } from "@/components/progress/LessonStatus";
import { Button } from "@/components/ui/button";
import {
	getLessonCatalog,
	getLessonProgressKey,
	getLessonRuntimeBySlug,
	getRouteSeed,
} from "@/content/runtime";
import {
	canUseLessonChallengeReroll,
	fallbackFreeEntitlements,
} from "@/lib/entitlements/access-policy";
import { getCurrentEntitlements } from "@/lib/entitlements/entitlements.sync";
import { captureException } from "@/lib/observability/logger";
import { completeDrill, completeLesson } from "@/lib/progress/progress.actions";
import { makeClientSeed } from "@/lib/randomization";
import { generateCanonical, generateMeta } from "@/lib/seo/meta";
import {
	ClientOnly,
	createFileRoute,
	Link,
	useNavigate,
} from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";

export const Route = createFileRoute("/lesson/$slug")({
	validateSearch: z.object({
		exclude: z.string().optional(),
		seed: z.coerce.number().int().positive().optional(),
	}),
	loaderDeps: ({ search }) => ({
		exclude: search.exclude,
		seed: search.seed,
	}),
	loader: async ({ deps, params }) => {
		const seed = getRouteSeed(`lesson:${params.slug}`, deps.seed);
		const lessonRuntime = getLessonRuntimeBySlug(params.slug, seed, {
			excludeDrillIds: deps.exclude
				? deps.exclude.split(",").filter(Boolean)
				: undefined,
		});
		if (!lessonRuntime) {
			throw new Error(`Lesson not found: ${params.slug}`);
		}

		let capabilities = fallbackFreeEntitlements().capabilities;
		try {
			const entitlements = await getCurrentEntitlements();
			capabilities = entitlements.capabilities;
		} catch (error) {
			captureException(error, {
				fallbackTier: "free",
				operation: "resolve_entitlements",
				route: "/lesson/$slug",
			});
		}

		return {
			...lessonRuntime,
			canUseChallengeReroll: canUseLessonChallengeReroll(capabilities),
		};
	},
	head: ({ loaderData }) => {
		const lesson = loaderData?.lesson;
		if (!lesson) {
			return {};
		}

		return {
			meta: [
				...generateMeta({
					title: lesson.title,
					description: lesson.summary,
					url: `/lesson/${lesson.slug}`,
					type: "article",
					tags: ["shipping api training", lesson.track, "carrier integrations"],
				}),
			],
			links: [generateCanonical(`/lesson/${lesson.slug}`)],
		};
	},
	component: LessonPage,
});

function LessonPage() {
	const navigate = useNavigate({ from: "/lesson/$slug" });
	const { canUseChallengeReroll, lesson, drills, seed } = Route.useLoaderData();
	const [challengeSeed, setChallengeSeed] = useState(seed);
	const [challengeDrills, setChallengeDrills] = useState(drills);
	const lessonCatalog = getLessonCatalog();

	const currentIndex = lessonCatalog.findIndex((l) => l.slug === lesson.slug);
	const prevLesson = currentIndex > 0 ? lessonCatalog[currentIndex - 1] : null;
	const nextLesson =
		currentIndex < lessonCatalog.length - 1
			? lessonCatalog[currentIndex + 1]
			: null;
	let trackRoute: {
		to: "/learn/rest" | "/learn/soap" | "/learn/cross-track";
		label: string;
	} = { to: "/learn/rest", label: "REST Track" };

	if (lesson.track === "soap") {
		trackRoute = { to: "/learn/soap", label: "SOAP Track" };
	} else if (lesson.track === "cross-track") {
		trackRoute = { to: "/learn/cross-track", label: "Cross-Track Hub" };
	}

	function handleDrillComplete(drillProgressKey: string, score: number) {
		completeDrill(getLessonProgressKey(lesson), drillProgressKey, score);
	}

	function handleMarkComplete() {
		completeLesson(getLessonProgressKey(lesson));
	}

	useEffect(() => {
		setChallengeSeed(seed);
		setChallengeDrills(drills);
	}, [drills, seed]);

	function handleNewVariantRun() {
		if (!canUseChallengeReroll) {
			return;
		}

		const nextSeed = makeClientSeed(`lesson:${lesson.slug}`);
		const rerolled = getLessonRuntimeBySlug(lesson.slug, nextSeed, {
			excludeDrillIds: challengeDrills.map((drill) => drill.id),
		});
		if (!rerolled) {
			return;
		}

		setChallengeSeed(rerolled.seed);
		setChallengeDrills(rerolled.drills);

		navigate({
			params: { slug: lesson.slug },
			search: (prev) => ({
				...prev,
				exclude: challengeDrills.map((drill) => drill.id).join(","),
				seed: nextSeed,
			}),
			to: "/lesson/$slug",
		});
	}

	return (
		<div className="container mx-auto max-w-4xl px-4 py-16">
			{/* Breadcrumb */}
			<div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
				<Link className="hover:text-foreground" to="/">
					Home
				</Link>
				<span>/</span>
				<Link className="hover:text-foreground" to={trackRoute.to}>
					{trackRoute.label}
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
			{challengeDrills.length > 0 && (
				<section className="mt-16">
					<div className="mb-6 flex flex-wrap items-center justify-between gap-3">
						<h2 className="text-2xl">Practice Drills</h2>
						<ClientOnly
							fallback={
								<Button disabled size="sm" variant="outline">
									New Challenge
								</Button>
							}
						>
							{canUseChallengeReroll ? (
								<Button
									onClick={handleNewVariantRun}
									size="sm"
									variant="outline"
								>
									New Challenge
								</Button>
							) : (
								<Button asChild size="sm" variant="outline">
									<a href="/settings#paid-access">Unlock New Challenge (Pro)</a>
								</Button>
							)}
						</ClientOnly>
					</div>
					<div className="space-y-8">
						{challengeDrills.map((drill) => (
							<div
								className="rounded-lg border border-border p-6"
								key={`${challengeSeed}:${drill.id}`}
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
					<Button className="gap-2" onClick={handleMarkComplete}>
						<CheckCircle className="h-4 w-4" />
						Mark Lesson Complete
					</Button>
				</ClientOnly>

				<div className="flex gap-3">
					{prevLesson && (
						<Button asChild className="gap-2" size="sm" variant="outline">
							<Link params={{ slug: prevLesson.slug }} to="/lesson/$slug">
								<ArrowLeft className="h-4 w-4" />
								Previous
							</Link>
						</Button>
					)}
					{nextLesson && (
						<Button asChild className="gap-2" size="sm">
							<Link params={{ slug: nextLesson.slug }} to="/lesson/$slug">
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
