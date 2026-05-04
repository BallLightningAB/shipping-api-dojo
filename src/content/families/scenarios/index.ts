import { deriveChildSeed, pickDeterministic } from "../../../lib/randomization";
import { scenarioFamilyCatalog } from "../../catalog/scenario-family-catalog";
import { scenarios as legacyScenarios } from "../../scenarios";
import type { ScenarioFamilyDefinition } from "../../types";

function cloneScenario(sourceScenarioId: string) {
	const legacyScenario = legacyScenarios.find(
		(scenario) => scenario.id === sourceScenarioId
	);
	if (!legacyScenario) {
		throw new Error(`Unknown legacy scenario: ${sourceScenarioId}`);
	}

	return {
		difficulty: legacyScenario.difficulty,
		steps: legacyScenario.steps.map((step) => ({
			...step,
			choices: step.choices.map((choice) => ({ ...choice })),
		})),
	};
}

const scenarioFamilies: ScenarioFamilyDefinition[] = scenarioFamilyCatalog.map(
	(entry) => ({
		id: entry.id,
		concept: entry.concept,
		ladderLevel: entry.ladderLevel,
		difficulty: cloneScenario(entry.sourceScenarioId).difficulty,
		summary: entry.summary,
		title: entry.title,
		buildRun: (seed) => {
			const scenario = cloneScenario(entry.sourceScenarioId);
			const evidence = pickDeterministic(
				entry.evidenceOptions,
				deriveChildSeed(seed, `${entry.id}:evidence`)
			);

			return {
				runId: `${entry.id}-${seed}`,
				scenario: {
					id: entry.id,
					scenarioFamilyId: entry.id,
					progressKey: entry.id,
					runSeed: seed,
					title: entry.title,
					summary: entry.summary,
					difficulty: scenario.difficulty,
					evidence,
					steps: scenario.steps,
				},
			};
		},
	})
);

export { scenarioFamilies };
