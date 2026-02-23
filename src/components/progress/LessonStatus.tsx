/**
 * Completion checkmark per lesson — shows in track overviews.
 */

import { useStore } from "@tanstack/react-store";
import { CheckCircle, Circle } from "lucide-react";
import { progressStore } from "@/lib/progress/progress.store";

interface LessonStatusProps {
	lessonSlug: string;
}

export function LessonStatus({ lessonSlug }: LessonStatusProps) {
	const completed = useStore(
		progressStore,
		(s) => s.lessons[lessonSlug]?.completed ?? false
	);

	if (completed) {
		return <CheckCircle className="h-5 w-5 text-green-400" />;
	}

	return <Circle className="h-5 w-5 text-muted-foreground/40" />;
}
