import { and, eq, sql } from "drizzle-orm";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
	canAccessScenarioRun,
	canUseLessonChallengeReroll,
	canUseScenarioReroll,
	fallbackFreeEntitlements,
	requiresPremiumScenarioDepth,
} from "../entitlements/access-policy";
import {
	buildArenaScenarioCards,
	buildLessonPracticeRun,
	buildScenarioPracticeRun,
	createPracticeSeedId,
	generatePracticeSeed,
	getAnonymousArenaCardsSeed,
	getAnonymousLessonSeed,
	getAnonymousScenarioSeed,
} from "./practice-runs";

const lessonRouteDataRequestSchema = z.object({
	slug: z.string().min(1),
});

const lessonPracticeRunRequestSchema = z.object({
	excludeDrillIds: z.array(z.string()).default([]),
	slug: z.string().min(1),
});

const arenaRouteDataRequestSchema = z.object({
	scenario: z.string().optional(),
});

const arenaCardsRequestSchema = z.object({});

const arenaScenarioRequestSchema = z.object({
	scenarioId: z.string().min(1),
});

type PracticeSeedSurface = "lesson" | "arena-cards" | "arena-scenario";

async function capturePracticeException(
	error: unknown,
	context: {
		fallbackTier?: "free";
		operation: string;
		route: string;
	}
) {
	const { captureException } = await import("../observability/logger");
	captureException(error, context);
}

async function getRequestSessionForPractice() {
	const { getRequestSession } = await import("../auth/server");
	return getRequestSession();
}

async function requireRequestSessionForPractice() {
	const { requireRequestSession } = await import("../auth/server");
	return requireRequestSession();
}

async function resolvePracticeCapabilities(userId?: string | null) {
	try {
		const { resolveEntitlementsForUserId } = await import(
			"../entitlements/entitlements.sync"
		);
		return (await resolveEntitlementsForUserId(userId)).capabilities;
	} catch (error) {
		await capturePracticeException(error, {
			fallbackTier: "free",
			operation: "resolve_entitlements",
			route: "practice",
		});
		return fallbackFreeEntitlements().capabilities;
	}
}

async function getPracticeSeedStorage() {
	const { getDb } = await import("../db/client");
	const { practiceSeeds } = await import("../db/schema");

	return {
		db: getDb(),
		practiceSeeds,
	};
}

async function readUserPracticeSeed(
	userId: string,
	surface: PracticeSeedSurface,
	scope: string
) {
	const { db, practiceSeeds } = await getPracticeSeedStorage();
	const [row] = await db
		.select({ seed: practiceSeeds.seed })
		.from(practiceSeeds)
		.where(
			and(
				eq(practiceSeeds.userId, userId),
				eq(practiceSeeds.surface, surface),
				eq(practiceSeeds.scope, scope)
			)
		)
		.limit(1);

	return row?.seed ?? null;
}

async function writeUserPracticeSeed(
	userId: string,
	surface: PracticeSeedSurface,
	scope: string,
	seed: number
) {
	const { db, practiceSeeds } = await getPracticeSeedStorage();

	await db
		.insert(practiceSeeds)
		.values({
			id: createPracticeSeedId(),
			scope,
			seed,
			surface,
			userId,
		})
		.onConflictDoUpdate({
			target: [
				practiceSeeds.userId,
				practiceSeeds.surface,
				practiceSeeds.scope,
			],
			set: {
				seed,
				updatedAt: sql`now()`,
			},
		});
}

export async function getOrCreateUserPracticeSeed(
	userId: string,
	surface: PracticeSeedSurface,
	scope: string
): Promise<number> {
	const existingSeed = await readUserPracticeSeed(userId, surface, scope);
	if (existingSeed) {
		return existingSeed;
	}

	const seed = generatePracticeSeed();
	await writeUserPracticeSeed(userId, surface, scope, seed);
	return seed;
}

export async function rotateUserPracticeSeed(
	userId: string,
	surface: PracticeSeedSurface,
	scope: string
): Promise<number> {
	const seed = generatePracticeSeed();
	await writeUserPracticeSeed(userId, surface, scope, seed);
	return seed;
}

export const getLessonPracticeRouteData = createServerFn({ method: "GET" })
	.inputValidator(lessonRouteDataRequestSchema)
	.handler(async ({ data }) => {
		const session = await getRequestSessionForPractice();
		let seed = getAnonymousLessonSeed(data.slug);
		if (session?.user?.id) {
			try {
				seed = await getOrCreateUserPracticeSeed(
					session.user.id,
					"lesson",
					data.slug
				);
			} catch (error) {
				await capturePracticeException(error, {
					operation: "resolve_practice_seed",
					route: "/lesson/$slug",
				});
			}
		}

		const lessonRuntime = buildLessonPracticeRun(data.slug, seed);
		if (!lessonRuntime) {
			throw new Error(`Lesson not found: ${data.slug}`);
		}

		const capabilities = await resolvePracticeCapabilities(session?.user?.id);

		return {
			drills: lessonRuntime.drills,
			lesson: lessonRuntime.lesson,
			canUseChallengeReroll: canUseLessonChallengeReroll(capabilities),
		};
	});

export const getArenaPracticeRouteData = createServerFn({ method: "GET" })
	.inputValidator(arenaRouteDataRequestSchema)
	.handler(async ({ data }) => {
		const session = await getRequestSessionForPractice();
		let seed = getAnonymousArenaCardsSeed();
		if (session?.user?.id) {
			try {
				seed = await getOrCreateUserPracticeSeed(
					session.user.id,
					"arena-cards",
					"index"
				);
			} catch (error) {
				await capturePracticeException(error, {
					operation: "resolve_practice_seed",
					route: "/arena",
				});
			}
		}

		const capabilities = await resolvePracticeCapabilities(session?.user?.id);

		const cards = buildArenaScenarioCards(seed, {
			canAccessLadderLevel: (ladderLevel) =>
				canAccessScenarioRun(capabilities, ladderLevel),
			requiresPremiumDepth: requiresPremiumScenarioDepth,
		});
		const activeCard = data.scenario
			? cards.find((card) => card.id === data.scenario)
			: null;
		const activeScenarioLocked = Boolean(activeCard?.isLocked);
		let activeScenario: ReturnType<typeof buildScenarioPracticeRun> = null;
		if (data.scenario && !activeScenarioLocked) {
			let scenarioSeed = getAnonymousScenarioSeed(data.scenario);
			if (session?.user?.id) {
				try {
					scenarioSeed = await getOrCreateUserPracticeSeed(
						session.user.id,
						"arena-scenario",
						data.scenario
					);
				} catch (error) {
					await capturePracticeException(error, {
						operation: "resolve_practice_seed",
						route: "/arena",
					});
				}
			}
			activeScenario = buildScenarioPracticeRun(data.scenario, scenarioSeed);
		}

		return {
			activeScenario,
			activeScenarioLocked,
			cards,
			canRerollScenarioRuns: canUseScenarioReroll(capabilities),
			usesServerSeed: Boolean(session?.user?.id),
		};
	});

export const createLessonPracticeRun = createServerFn({ method: "POST" })
	.inputValidator(lessonPracticeRunRequestSchema)
	.handler(async ({ data }) => {
		const session = await requireRequestSessionForPractice();
		const capabilities = await resolvePracticeCapabilities(session.user.id);
		if (!canUseLessonChallengeReroll(capabilities)) {
			throw new Error("FORBIDDEN_CAPABILITY:randomization.premium.full");
		}

		const seed = await rotateUserPracticeSeed(
			session.user.id,
			"lesson",
			data.slug
		);
		const run = buildLessonPracticeRun(data.slug, seed, {
			excludeDrillIds: data.excludeDrillIds,
		});
		if (!run) {
			throw new Error(`Lesson not found: ${data.slug}`);
		}

		return run;
	});

export const createArenaCardsRun = createServerFn({ method: "POST" })
	.inputValidator(arenaCardsRequestSchema)
	.handler(async () => {
		const session = await requireRequestSessionForPractice();
		const capabilities = await resolvePracticeCapabilities(session.user.id);
		if (!canUseScenarioReroll(capabilities)) {
			throw new Error("FORBIDDEN_CAPABILITY:randomization.premium.full");
		}

		const seed = await rotateUserPracticeSeed(
			session.user.id,
			"arena-cards",
			"index"
		);

		return {
			cards: buildArenaScenarioCards(seed, {
				canAccessLadderLevel: (ladderLevel) =>
					canAccessScenarioRun(capabilities, ladderLevel),
				requiresPremiumDepth: requiresPremiumScenarioDepth,
			}),
		};
	});

export const createArenaScenarioRun = createServerFn({ method: "POST" })
	.inputValidator(arenaScenarioRequestSchema)
	.handler(async ({ data }) => {
		const session = await requireRequestSessionForPractice();
		const capabilities = await resolvePracticeCapabilities(session.user.id);
		if (!canUseScenarioReroll(capabilities)) {
			throw new Error("FORBIDDEN_CAPABILITY:randomization.premium.full");
		}

		const seed = await rotateUserPracticeSeed(
			session.user.id,
			"arena-scenario",
			data.scenarioId
		);
		const scenario = buildScenarioPracticeRun(data.scenarioId, seed);
		if (!scenario) {
			throw new Error(`Scenario not found: ${data.scenarioId}`);
		}

		return { activeScenario: scenario };
	});
