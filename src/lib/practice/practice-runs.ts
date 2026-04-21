import {
	getArenaScenarioCards,
	getLessonRuntimeBySlug,
	getRouteSeed,
	getScenarioRuntimeById,
} from "../../content/runtime";
import type { Drill, Lesson, Scenario } from "../../content/types";

export interface LessonPracticeRun {
	drills: Drill[];
	lesson: Lesson;
}

export interface ArenaScenarioCard extends Scenario {
	isLocked: boolean;
	requiresPremiumDepth: boolean;
}

export function buildLessonPracticeRun(
	slug: string,
	seed: number,
	options?: {
		excludeDrillIds?: string[];
	}
): LessonPracticeRun | null {
	const run = getLessonRuntimeBySlug(slug, seed, options);
	if (!run) {
		return null;
	}

	return {
		drills: run.drills,
		lesson: run.lesson,
	};
}

export function buildArenaScenarioCards(
	seed: number,
	options: {
		canAccessLadderLevel: (ladderLevel: Scenario["ladderLevel"]) => boolean;
		requiresPremiumDepth: (ladderLevel: Scenario["ladderLevel"]) => boolean;
	}
): ArenaScenarioCard[] {
	return getArenaScenarioCards(seed).map((card) => ({
		...card,
		isLocked: !options.canAccessLadderLevel(card.ladderLevel),
		requiresPremiumDepth: options.requiresPremiumDepth(card.ladderLevel),
	}));
}

export function buildScenarioPracticeRun(
	scenarioId: string,
	seed: number
): Scenario | null {
	const scenario = getScenarioRuntimeById(scenarioId, seed);
	if (!scenario) {
		return null;
	}

	const { runSeed: _runSeed, ...safeScenario } = scenario;
	return safeScenario;
}

export function getAnonymousLessonSeed(slug: string): number {
	return getRouteSeed(`lesson:${slug}:anonymous-demo`);
}

export function getAnonymousArenaCardsSeed(): number {
	return getRouteSeed("arena:index:anonymous-demo");
}

export function getAnonymousScenarioSeed(scenarioId: string): number {
	return getRouteSeed(`arena:${scenarioId}:anonymous-demo`);
}
