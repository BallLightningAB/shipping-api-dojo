import { describe, expect, it } from "vitest";

import {
	getArenaScenarioCards,
	getLessonCatalog,
	getLessonRuntimeBySlug,
	getScenarioRuntimeById,
} from "./runtime";

describe("content runtime", () => {
	it("adapts the migrated REST lesson through the family runtime", () => {
		const runtime = getLessonRuntimeBySlug("rest-1-http-semantics", 101);

		expect(runtime).not.toBeNull();
		expect(runtime?.lesson.id).toBe("lesson-rest-http-semantics");
		expect(runtime?.lesson.drillFamilyIds).toEqual([
			"rest-http-method-classification",
			"rest-timeout-recovery",
			"rest-retry-policy-cloze",
		]);
		expect(runtime?.drills.map((drill) => drill.progressKey).sort()).toEqual([
			"rest-http-method-classification",
			"rest-retry-policy-cloze",
			"rest-timeout-recovery",
		]);
	});

	it("preserves legacy lessons through the same runtime API", () => {
		const runtime = getLessonRuntimeBySlug("rest-2-auth-headers", 101);

		expect(runtime).not.toBeNull();
		expect(runtime?.lesson.id).toBeUndefined();
		expect(runtime?.drills.map((drill) => drill.id)).toEqual([
			"rest2-mcq-1",
			"rest2-builder-1",
		]);
	});

	it("keeps a migrated lesson order stable for the same seed and changes for a new seed", () => {
		const first = getLessonRuntimeBySlug("rest-1-http-semantics", 101);
		const second = getLessonRuntimeBySlug("rest-1-http-semantics", 101);
		const third = getLessonRuntimeBySlug("rest-1-http-semantics", 303);

		expect(first?.drills.map((drill) => drill.id)).toEqual(
			second?.drills.map((drill) => drill.id)
		);
		expect(first?.drills.map((drill) => drill.id)).not.toEqual(
			third?.drills.map((drill) => drill.id)
		);
	});

	it("keeps arena card order stable for the same seed", () => {
		const first = getArenaScenarioCards(44).map((scenario) => scenario.id);
		const second = getArenaScenarioCards(44).map((scenario) => scenario.id);
		const third = getArenaScenarioCards(55).map((scenario) => scenario.id);

		expect(first).toEqual(second);
		expect(first).not.toEqual(third);
	});

	it("builds a deterministic scenario-family run for the same seed", () => {
		const first = getScenarioRuntimeById("timeout-create-shipment", 808);
		const second = getScenarioRuntimeById("timeout-create-shipment", 808);
		const third = getScenarioRuntimeById("timeout-create-shipment", 909);

		expect(first).not.toBeNull();
		expect(first?.scenarioFamilyId).toBe("timeout-create-shipment");
		expect(first?.steps).toEqual(second?.steps);
		expect(first?.evidence).toEqual(second?.evidence);
		expect(first?.evidence).not.toEqual(third?.evidence);
	});

	it("returns a mixed lesson catalog with migrated canonical IDs in place", () => {
		const catalog = getLessonCatalog();
		const restLesson = catalog.find(
			(lesson) => lesson.slug === "rest-1-http-semantics"
		);
		const legacyLesson = catalog.find(
			(lesson) => lesson.slug === "rest-2-auth-headers"
		);

		expect(restLesson?.id).toBe("lesson-rest-http-semantics");
		expect(legacyLesson?.id).toBeUndefined();
	});
});
