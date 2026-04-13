/**
 * "Continue where you left off" banner for the landing page.
 */

import { Link } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { ArrowRight } from "lucide-react";
import { getLessonCatalog } from "@/content/runtime";
import { Button } from "@/components/ui/button";
import { progressStore } from "@/lib/progress/progress.store";

export function ContinueBanner() {
	const lessonsProgress = useStore(progressStore, (s) => s.lessons);
	const xp = useStore(progressStore, (s) => s.xp);
	const lessons = getLessonCatalog();

	const nextLesson = lessons.find((l) => {
		const lp = lessonsProgress[l.slug];
		return !lp?.completed;
	});

	if (!nextLesson || xp === 0) {
		return null;
	}

	return (
		<div className="rounded-lg border border-bl-red/20 bg-bl-red/5 p-4">
			<p className="mb-2 text-sm font-medium text-muted-foreground">
				Continue where you left off
			</p>
			<p className="mb-3 font-semibold text-foreground">{nextLesson.title}</p>
			<Button asChild className="gap-2" size="sm">
				<Link params={{ slug: nextLesson.slug }} to="/lesson/$slug">
					Continue
					<ArrowRight className="h-3.5 w-3.5" />
				</Link>
			</Button>
		</div>
	);
}
