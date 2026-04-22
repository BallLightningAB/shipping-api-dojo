import { z } from "zod";

export const lessonPracticeSearchSchema = z.object({});

export const arenaPracticeSearchSchema = z.object({
	scenario: z.string().optional(),
});

export const LEGACY_SEED_SEARCH_PARAMS = [
	"seed",
	"runSeed",
	"exclude",
] as const;
