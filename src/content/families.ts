import {
	drillFamilies as coreDrillFamilies,
	lessonDefinitions as coreLessonDefinitions,
	scenarioFamilies as coreScenarioFamilies,
} from "./families/core";
import { drillFamilies as catalogDrillFamilies } from "./families/drills";
import { lessonDefinitions as catalogLessonDefinitions } from "./families/lessons";
import { scenarioFamilies as catalogScenarioFamilies } from "./families/scenarios";
import type {
	DrillFamilyDefinition,
	LessonDefinition,
	ScenarioFamilyDefinition,
} from "./types";

const lessonDefinitions: LessonDefinition[] = [
	...coreLessonDefinitions,
	...catalogLessonDefinitions,
].sort((left, right) => left.order - right.order);

const drillFamilies: DrillFamilyDefinition[] = [
	...coreDrillFamilies,
	...catalogDrillFamilies,
];

const scenarioFamilies: ScenarioFamilyDefinition[] = [
	...coreScenarioFamilies,
	...catalogScenarioFamilies,
];

export function getLessonDefinitionBySlug(
	slug: string
): LessonDefinition | undefined {
	return lessonDefinitions.find((lesson) => lesson.slug === slug);
}

export function getDrillFamilyById(
	id: string
): DrillFamilyDefinition | undefined {
	return drillFamilies.find((family) => family.id === id);
}

export function getScenarioFamilyById(
	id: string
): ScenarioFamilyDefinition | undefined {
	return scenarioFamilies.find((family) => family.id === id);
}

export { drillFamilies, lessonDefinitions, scenarioFamilies };
