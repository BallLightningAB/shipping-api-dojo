import { drillFamilyCatalog } from "./drill-family-catalog";
import { scenarioFamilyCatalog } from "./scenario-family-catalog";

const coreDrillProgressPairs: [string, string][] = [
	["rest1-mcq-1", "rest-http-method-classification"],
	["rest1-mcq-2", "rest-timeout-recovery"],
	["rest1-cloze-1", "rest-retry-policy-cloze"],
	["soap1-mcq-1", "soap-envelope-structure"],
	["soap1-builder-1", "soap-envelope-builder"],
];

const catalogDrillProgressPairs = drillFamilyCatalog.flatMap((entry) =>
	entry.legacyDrillIds.map(
		(legacyDrillId) => [legacyDrillId, entry.id] as [string, string]
	)
);

const coreScenarioProgressPairs: [string, string][] = [
	["timeout-create-shipment", "timeout-create-shipment"],
];

const catalogScenarioProgressPairs = scenarioFamilyCatalog.map(
	(entry) => [entry.sourceScenarioId, entry.id] as [string, string]
);

export const LEGACY_DRILL_PROGRESS_KEY_MAP = Object.fromEntries([
	...coreDrillProgressPairs,
	...catalogDrillProgressPairs,
]) as Record<string, string>;

export const LEGACY_SCENARIO_PROGRESS_KEY_MAP = Object.fromEntries([
	...coreScenarioProgressPairs,
	...catalogScenarioProgressPairs,
]) as Record<string, string>;

export function remapLegacyDrillProgressKey(drillKey: string): string {
	return LEGACY_DRILL_PROGRESS_KEY_MAP[drillKey] ?? drillKey;
}

export function remapLegacyScenarioProgressKey(scenarioKey: string): string {
	return LEGACY_SCENARIO_PROGRESS_KEY_MAP[scenarioKey] ?? scenarioKey;
}
