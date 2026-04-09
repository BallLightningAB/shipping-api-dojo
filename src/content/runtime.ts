import {
	deriveChildSeed,
	deriveRouteSeed,
	shuffleDeterministic,
} from "../lib/randomization";
import { getDrillById, getDrillsByIds } from "./drills";
import {
	getDrillFamilyById,
	getLessonDefinitionBySlug,
	getScenarioFamilyById,
} from "./families";
import { getLessonBySlug, lessons } from "./lessons";
import { getScenarioById, scenarios } from "./scenarios";
import type { Drill, Lesson, Scenario, Track } from "./types";

function materializeFamilyDrill(familyId: string, seed: number): Drill {
	const family = getDrillFamilyById(familyId);
	if (!family) {
		throw new Error(`Unknown drill family: ${familyId}`);
	}

	const variantSeed = deriveChildSeed(seed, familyId);
	const variant = family.buildVariant(variantSeed);
	const progressKey = variant.drill.progressKey ?? family.id;
	const baseDrill = {
		...variant.drill,
		id: `${family.id}:${variant.variantId}`,
		variantId: variant.variantId,
		progressKey,
		familyId: family.id,
	};

	if (baseDrill.type !== "mcq") {
		return baseDrill;
	}

	const orderedOptions = baseDrill.options.map((option, index) => ({
		index,
		option,
	}));
	const shuffledOptions = shuffleDeterministic(
		orderedOptions,
		deriveChildSeed(variantSeed, `${family.id}:options`)
	);
	const correctIndex = shuffledOptions.findIndex(
		(entry) => entry.index === baseDrill.correctIndex
	);

	return {
		...baseDrill,
		options: shuffledOptions.map((entry) => entry.option),
		correctIndex,
	};
}

function adaptFamilyLesson(slug: string): Lesson | undefined {
	const lessonDefinition = getLessonDefinitionBySlug(slug);
	if (!lessonDefinition) {
		return undefined;
	}

	return {
		id: lessonDefinition.id,
		slug: lessonDefinition.slug,
		title: lessonDefinition.title,
		track: lessonDefinition.track,
		order: lessonDefinition.order,
		summary: lessonDefinition.summary,
		objectives: lessonDefinition.objectives,
		sections: lessonDefinition.sections,
		drillIds: lessonDefinition.drillFamilyIds,
		drillFamilyIds: lessonDefinition.drillFamilyIds,
	};
}

export function getRouteSeed(scope: string, explicitSeed?: number): number {
	return explicitSeed ?? deriveRouteSeed(scope);
}

export function getLessonRuntimeBySlug(
	slug: string,
	seed: number
): {
	lesson: Lesson;
	seed: number;
	drills: Drill[];
} | null {
	const familyLesson = adaptFamilyLesson(slug);
	if (familyLesson?.drillFamilyIds?.length) {
		const drillSeed = deriveChildSeed(seed, `${slug}:drill-order`);
		const drills = familyLesson.drillFamilyIds.map((familyId) =>
			materializeFamilyDrill(familyId, deriveChildSeed(seed, familyId))
		);

		return {
			lesson: familyLesson,
			seed,
			drills: shuffleDeterministic(drills, drillSeed),
		};
	}

	const lesson = getLessonBySlug(slug);
	if (!lesson) {
		return null;
	}

	return {
		lesson,
		seed,
		drills: getDrillsByIds(lesson.drillIds),
	};
}

export function getDrillProgressKey(drill: Drill): string {
	return drill.progressKey ?? drill.familyId ?? drill.id;
}

export function getLessonProgressKey(lesson: Lesson): string {
	return lesson.slug;
}

export function getScenarioProgressKey(scenario: Scenario): string {
	return scenario.progressKey ?? scenario.scenarioFamilyId ?? scenario.id;
}

export function getArenaScenarioCards(seed: number): Scenario[] {
	const mixedScenarios = scenarios.map((scenario) => {
		const family = getScenarioFamilyById(scenario.id);
		if (!family) {
			return scenario;
		}

		return {
			id: family.id,
			progressKey: family.id,
			scenarioFamilyId: family.id,
			title: family.title,
			summary: family.summary,
			difficulty: family.difficulty,
			steps: scenario.steps,
		};
	});

	return shuffleDeterministic(
		mixedScenarios,
		deriveChildSeed(seed, "arena-cards")
	);
}

export function getScenarioRuntimeById(
	id: string,
	runSeed: number
): Scenario | null {
	const family = getScenarioFamilyById(id);
	if (family) {
		return family.buildRun(runSeed).scenario;
	}

	return getScenarioById(id) ?? null;
}

export function getLessonCatalog(): Lesson[] {
	return lessons.map((lesson) => adaptFamilyLesson(lesson.slug) ?? lesson);
}

export function getLessonsByTrackRuntime(track: Track): Lesson[] {
	return getLessonCatalog()
		.filter((lesson) => lesson.track === track)
		.sort((left, right) => left.order - right.order);
}

export function getLegacyDrillById(id: string): Drill | undefined {
	return getDrillById(id);
}
