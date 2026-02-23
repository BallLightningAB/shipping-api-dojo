/**
 * Progress System — Pure Action Helpers
 *
 * XP, streak, lesson/drill completion, scenario completion, and reset.
 */

import {
	DEFAULT_PROGRESS,
	type LessonProgress,
	type ProgressData,
} from "./progress.schema";
import { clearProgress } from "./progress.storage";
import { progressStore } from "./progress.store";

const XP_PER_DRILL = 10;
const XP_PER_LESSON = 50;
const XP_PER_SCENARIO = 100;

function todayISO(): string {
	return new Date().toISOString().slice(0, 10);
}

function updateStreak(
	prev: ProgressData
): Pick<ProgressData, "streak" | "lastActiveDate"> {
	const today = todayISO();
	if (prev.lastActiveDate === today) {
		return { streak: prev.streak, lastActiveDate: today };
	}

	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	const yesterdayISO = yesterday.toISOString().slice(0, 10);

	if (prev.lastActiveDate === yesterdayISO) {
		return { streak: prev.streak + 1, lastActiveDate: today };
	}

	return { streak: 1, lastActiveDate: today };
}

export function addXp(amount: number) {
	progressStore.setState((prev) => ({
		...prev,
		xp: prev.xp + amount,
		...updateStreak(prev),
	}));
}

export function completeDrill(
	lessonSlug: string,
	drillId: string,
	score: number
) {
	progressStore.setState((prev) => {
		const lesson: LessonProgress = prev.lessons[lessonSlug] ?? {
			completed: false,
			completedAt: null,
			drillScores: {},
		};

		const prevScore = lesson.drillScores[drillId] ?? 0;
		const xpGain = score > prevScore ? XP_PER_DRILL : 0;

		return {
			...prev,
			xp: prev.xp + xpGain,
			...updateStreak(prev),
			lessons: {
				...prev.lessons,
				[lessonSlug]: {
					...lesson,
					drillScores: {
						...lesson.drillScores,
						[drillId]: Math.max(prevScore, score),
					},
				},
			},
		};
	});
}

export function completeLesson(lessonSlug: string) {
	progressStore.setState((prev) => {
		const lesson: LessonProgress = prev.lessons[lessonSlug] ?? {
			completed: false,
			completedAt: null,
			drillScores: {},
		};

		if (lesson.completed) {
			return prev;
		}

		return {
			...prev,
			xp: prev.xp + XP_PER_LESSON,
			...updateStreak(prev),
			lessons: {
				...prev.lessons,
				[lessonSlug]: {
					...lesson,
					completed: true,
					completedAt: new Date().toISOString(),
				},
			},
		};
	});
}

export function completeScenario(scenarioId: string) {
	progressStore.setState((prev) => {
		if (prev.scenariosCompleted.includes(scenarioId)) {
			return prev;
		}

		return {
			...prev,
			xp: prev.xp + XP_PER_SCENARIO,
			...updateStreak(prev),
			scenariosCompleted: [...prev.scenariosCompleted, scenarioId],
		};
	});
}

export function resetProgress() {
	clearProgress();
	progressStore.setState((prev) => ({ ...prev, ...DEFAULT_PROGRESS }));
}

export { XP_PER_DRILL, XP_PER_LESSON, XP_PER_SCENARIO };
