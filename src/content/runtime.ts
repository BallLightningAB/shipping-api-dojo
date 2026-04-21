import {
	deriveChildSeed,
	deriveRouteSeed,
	shuffleDeterministic,
} from "../lib/randomization";
import {
	getDrillFamilyById,
	getLessonDefinitionBySlug,
	getScenarioFamilyById,
	lessonDefinitions,
	scenarioFamilies,
} from "./families";
import type { Drill, Lesson, Scenario, Track } from "./types";

const MAX_REROLL_ATTEMPTS = 8;

function materializeFamilyDrill(
	familyId: string,
	seed: number,
	excludedDrillIds: ReadonlySet<string> = new Set()
): Drill {
	const family = getDrillFamilyById(familyId);
	if (!family) {
		throw new Error(`Unknown drill family: ${familyId}`);
	}

	let fallbackDrill: Drill | null = null;

	for (let attempt = 0; attempt < MAX_REROLL_ATTEMPTS; attempt += 1) {
		const variantSeed =
			attempt === 0
				? deriveChildSeed(seed, familyId)
				: deriveChildSeed(seed, `${familyId}:reroll:${attempt}`);
		const variant = family.buildVariant(variantSeed);
		const progressKey = variant.drill.progressKey ?? family.id;
		const baseDrill = {
			...variant.drill,
			id: `${family.id}:${variant.variantId}`,
			variantId: variant.variantId,
			progressKey,
			familyId: family.id,
		};

		const nextDrill =
			baseDrill.type !== "mcq"
				? baseDrill
				: (() => {
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
					})();

		fallbackDrill ??= nextDrill;
		if (!excludedDrillIds.has(nextDrill.id)) {
			return nextDrill;
		}
	}

	if (!fallbackDrill) {
		throw new Error(`Unable to materialize drill family: ${familyId}`);
	}

	return fallbackDrill;
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
	seed: number,
	options?: {
		excludeDrillIds?: string[];
	}
): {
	lesson: Lesson;
	seed: number;
	drills: Drill[];
} | null {
	const familyLesson = adaptFamilyLesson(slug);
	if (familyLesson?.drillFamilyIds?.length) {
		const drillSeed = deriveChildSeed(seed, `${slug}:drill-order`);
		const excludedDrillIds = new Set(options?.excludeDrillIds ?? []);
		const drills = familyLesson.drillFamilyIds.map((familyId) =>
			materializeFamilyDrill(familyId, seed, excludedDrillIds)
		);

		return {
			lesson: familyLesson,
			seed,
			drills: shuffleDeterministic(drills, drillSeed),
		};
	}

	return null;
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
	const canonicalCards = scenarioFamilies.map((family) => ({
		id: family.id,
		ladderLevel: family.ladderLevel,
		progressKey: family.id,
		scenarioFamilyId: family.id,
		title: family.title,
		summary: family.summary,
		difficulty: family.difficulty,
		steps: [],
	}));

	return shuffleDeterministic(
		canonicalCards,
		deriveChildSeed(seed, "arena-cards")
	);
}

export function getScenarioRuntimeById(
	id: string,
	runSeed: number
): Scenario | null {
	const family = getScenarioFamilyById(id);
	if (!family) {
		return null;
	}

	return {
		...family.buildRun(runSeed).scenario,
		ladderLevel: family.ladderLevel,
	};
}

export function getLessonCatalog(): Lesson[] {
	const catalog = lessonDefinitions
		.map((lesson) => adaptFamilyLesson(lesson.slug))
		.filter((lesson): lesson is Lesson => Boolean(lesson));

	return catalog.sort((left, right) => left.order - right.order);
}

export function getLessonsByTrackRuntime(track: Track): Lesson[] {
	return getLessonCatalog()
		.filter((lesson) => lesson.track === track)
		.sort((left, right) => left.order - right.order);
}
