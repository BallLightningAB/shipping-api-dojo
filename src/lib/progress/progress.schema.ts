/**
 * Progress System — Zod Schema, Types & Defaults
 *
 * Authless, localStorage-backed progress tracking for lessons, drills, and streaks.
 */

import { z } from "zod";

const CURRENT_VERSION = 1;

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

export function parseProgress(raw: unknown): ProgressData {
	const result = ProgressDataSchema.safeParse(raw);
	if (result.success) {
		return migrate(result.data);
	}
	return { ...DEFAULT_PROGRESS };
}

function migrate(data: ProgressData): ProgressData {
	if (data.version < CURRENT_VERSION) {
		return { ...DEFAULT_PROGRESS, ...data, version: CURRENT_VERSION };
	}
	return data;
}

export { ProgressDataSchema, CURRENT_VERSION };
