import { describe, expect, it } from "vitest";

import {
	getArenaScenarioCards,
	getLessonCatalog,
	getLessonsByTrackRuntime,
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
		const introRuntime = getLessonRuntimeBySlug(
			"intro-carrier-integrations",
			101
		);
		const runtime = getLessonRuntimeBySlug("rest-2-auth-headers", 101);

		expect(introRuntime).not.toBeNull();
		expect(introRuntime?.lesson.id).toBe("lesson-intro-carrier-integrations");
		expect(runtime).not.toBeNull();
		expect(runtime?.lesson.id).toBe("lesson-rest-auth-headers");
		expect(runtime?.drills.map((drill) => drill.progressKey).sort()).toEqual([
			"rest-oauth-token-lifecycle",
			"rest-required-headers-correlation-ids",
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
		const restLessons = getLessonsByTrackRuntime("rest");
		const soapLessons = getLessonsByTrackRuntime("soap");
		const introLesson = catalog.find(
			(lesson) => lesson.slug === "intro-carrier-integrations"
		);
		const restLesson = catalog.find(
			(lesson) => lesson.slug === "rest-1-http-semantics"
		);
		const legacyLesson = catalog.find(
			(lesson) => lesson.slug === "rest-2-auth-headers"
		);

		expect(introLesson?.id).toBe("lesson-intro-carrier-integrations");
		expect(restLesson?.id).toBe("lesson-rest-http-semantics");
		expect(legacyLesson?.id).toBe("lesson-rest-auth-headers");
		expect(catalog).toHaveLength(18);
		expect(restLessons).toHaveLength(10);
		expect(soapLessons).toHaveLength(7);
		expect(restLessons.at(-1)?.slug).toBe(
			"rest-10-observability-health-checks-runbooks"
		);
		expect(soapLessons.at(-1)?.slug).toBe(
			"soap-7-fault-taxonomy-internal-error-mapping"
		);
		expect(catalog.every((lesson) => Boolean(lesson.id))).toBe(true);
	});

	it("publishes canonical scenario family ids for every arena card without legacy duplicates", () => {
		const cards = getArenaScenarioCards(101);
		const ids = cards.map((scenario) => scenario.id);

		expect(cards).toHaveLength(15);
		expect(ids).toContain("rate-limiting-storm");
		expect(ids).toContain("duplicate-webhook-replay");
		expect(ids).toContain("soap-header-auth-mismatch");
		expect(ids).not.toContain("rate-limit-429");
		expect(ids).not.toContain("soap-fault-detail");
		expect(ids).not.toContain("wsdl-change-breaks");
		expect(cards.every((scenario) => Boolean(scenario.progressKey))).toBe(true);
	});
});
