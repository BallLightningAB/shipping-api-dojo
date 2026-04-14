import { deriveChildSeed, pickDeterministic } from "../../../lib/randomization";
import { drillFamilyCatalog } from "../../catalog/drill-family-catalog";
import { drills as legacyDrills } from "../../drills";
import type { Drill, DrillFamilyDefinition, DrillType } from "../../types";

function getLegacyDrill(id: string): Drill {
	const drill = legacyDrills.find((entry) => entry.id === id);
	if (!drill) {
		throw new Error(`Unknown legacy drill: ${id}`);
	}
	return drill;
}

function assertDrillType(
	id: string,
	expectedType: DrillType,
	actualType: DrillType
) {
	if (expectedType !== actualType) {
		throw new Error(
			`Legacy drill ${id} has type ${actualType} but catalog expects ${expectedType}`
		);
	}
}

const drillFamilies: DrillFamilyDefinition[] = drillFamilyCatalog.map(
	(entry) => ({
		id: entry.id,
		type: entry.type,
		concept: entry.concept,
		misconception: entry.misconception,
		difficulty: entry.difficulty,
		tags: entry.tags,
		buildVariant: (seed) => {
			const legacyVariants = entry.legacyDrillIds.map((legacyId) =>
				getLegacyDrill(legacyId)
			);
			const variant = pickDeterministic(
				legacyVariants,
				deriveChildSeed(seed, entry.id)
			);

			assertDrillType(variant.id, entry.type, variant.type);

			return {
				variantId: variant.id,
				drill: {
					...variant,
					familyId: entry.id,
					progressKey: entry.id,
				},
			};
		},
	})
);

export { drillFamilies };
