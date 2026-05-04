/**
 * Progress System — Zod Schema, Types & Defaults
 *
 * Authless, localStorage-backed progress tracking for lessons, drills, and streaks.
 */

import { z } from "zod";
import {
	remapLegacyDrillProgressKey,
	remapLegacyScenarioProgressKey,
} from "../../content/catalog/progress-migration";

const CURRENT_VERSION = 2;

const LessonProgressSchema = z.object({
	completed: z.boolean(),
	completedAt: z.string().nullable(),
	drillScores: z.record(z.string(), z.number()),
});

const ProgressDataSchema = z.object({
	version: z.number(),
	xp: z.number(),
	streak: z.number(),
	lastActiveDate: z.string().nullable(),
	lessons: z.record(z.string(), LessonProgressSchema),
	scenariosCompleted: z.array(z.string()),
});

export type LessonProgress = z.infer<typeof LessonProgressSchema>;
export type ProgressData = z.infer<typeof ProgressDataSchema>;

export const DEFAULT_PROGRESS: ProgressData = {
	version: CURRENT_VERSION,
	xp: 0,
	streak: 0,
	lastActiveDate: null,
	lessons: {},
	scenariosCompleted: [],
};

function normalizeLessons(
	lessons: ProgressData["lessons"]
): ProgressData["lessons"] {
	return Object.fromEntries(
		Object.entries(lessons).map(([lessonSlug, lessonProgress]) => {
			const remappedScores = Object.entries(lessonProgress.drillScores).reduce<
				LessonProgress["drillScores"]
			>((scores, [drillKey, score]) => {
				const canonicalKey = remapLegacyDrillProgressKey(drillKey);
				scores[canonicalKey] = Math.max(scores[canonicalKey] ?? 0, score);
				return scores;
			}, {});

			return [
				lessonSlug,
				{
					...lessonProgress,
					drillScores: remappedScores,
				},
			];
		})
	);
}

export function normalizeProgressData(data: ProgressData): ProgressData {
	return {
		...data,
		lessons: normalizeLessons(data.lessons),
		scenariosCompleted: Array.from(
			new Set(
				data.scenariosCompleted.map((scenarioKey) =>
					remapLegacyScenarioProgressKey(scenarioKey)
				)
			)
		),
	};
}

export function parseProgress(raw: unknown): ProgressData {
	const result = ProgressDataSchema.safeParse(raw);
	if (result.success) {
		return migrate(result.data);
	}
	return { ...DEFAULT_PROGRESS };
}

function migrate(data: ProgressData): ProgressData {
	const migrated =
		data.version < CURRENT_VERSION
			? { ...DEFAULT_PROGRESS, ...data, version: CURRENT_VERSION }
			: data;

	return normalizeProgressData(migrated);
}

export { ProgressDataSchema, CURRENT_VERSION };
