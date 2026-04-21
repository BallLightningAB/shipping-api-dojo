import { describe, expect, it } from "vitest";

import {
	getArenaScenarioCards,
	getLessonCatalog,
	getLessonsByTrackRuntime,
	getLessonRuntimeBySlug,
	getScenarioRuntimeById,
} from "./runtime";
import { drillFamilyCatalog } from "./catalog/drill-family-catalog";
import { drills } from "./drills";

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

	it("avoids the current drill variants on reroll when alternatives exist", () => {
		const first = getLessonRuntimeBySlug(
			"cross-track-2-carrier-capability-matrix-integration-architecture",
			101
		);
		const rerolled = getLessonRuntimeBySlug(
			"cross-track-2-carrier-capability-matrix-integration-architecture",
			202,
			{
				excludeDrillIds: first?.drills.map((drill) => drill.id),
			}
		);

		expect(first).not.toBeNull();
		expect(rerolled).not.toBeNull();
		expect(first?.drills.map((drill) => drill.id)).not.toEqual(
			rerolled?.drills.map((drill) => drill.id)
		);
		expect(
			rerolled?.drills.every(
				(drill) => !first?.drills.some((previous) => previous.id === drill.id)
			)
		).toBe(true);
	});

	it("gives rest-9 real challenge depth beyond drill-order swaps", () => {
		const uniqueChallenges = new Set<string>();

		for (let seed = 1; seed <= 200; seed += 1) {
			const runtime = getLessonRuntimeBySlug(
				"rest-9-webhook-signatures-replay-ordering",
				seed
			);
			uniqueChallenges.add(
				runtime?.drills.map((drill) => drill.id).join("|") ?? "null"
			);
		}

		expect(uniqueChallenges.size).toBeGreaterThan(10);
	});

	it("rerolls rest-9 into new drill variants instead of only reordering the same pair", () => {
		const first = getLessonRuntimeBySlug(
			"rest-9-webhook-signatures-replay-ordering",
			101
		);
		const rerolled = getLessonRuntimeBySlug(
			"rest-9-webhook-signatures-replay-ordering",
			202,
			{
				excludeDrillIds: first?.drills.map((drill) => drill.id),
			}
		);

		expect(first).not.toBeNull();
		expect(rerolled).not.toBeNull();
		expect(first?.drills.map((drill) => drill.id)).not.toEqual(
			rerolled?.drills.map((drill) => drill.id)
		);
		expect(
			rerolled?.drills.every(
				(drill) => !first?.drills.some((previous) => previous.id === drill.id)
			)
		).toBe(true);
	});

	it("keeps every lesson above the low and medium challenge-depth floor", () => {
		const depthFloor = 12;
		const lessonDepths = getLessonCatalog().map((lesson) => {
			const uniqueChallenges = new Set<string>();

			for (let seed = 1; seed <= 400; seed += 1) {
				const runtime = getLessonRuntimeBySlug(lesson.slug, seed);
				uniqueChallenges.add(
					runtime?.drills.map((drill) => drill.id).join("|") ?? "null"
				);
			}

			return {
				slug: lesson.slug,
				count: uniqueChallenges.size,
			};
		});

		expect(lessonDepths.filter((lesson) => lesson.count < depthFloor)).toEqual(
			[]
		);
	});

	it("keeps the two-variant watch-list families expanded", () => {
		const expandedFamilies = [
			"repair-xsd-type-mismatches",
			"rest-pagination-drift",
			"rest-partial-success-compensation",
			"rest-rate-limits-backpressure",
			"rest-sandbox-production-drift",
			"soap-fault-detail-extraction",
		];
		const drillIds = new Set(drills.map((drill) => drill.id));
		const shallowFamilies = expandedFamilies.flatMap((familyId) => {
			const family = drillFamilyCatalog.find((entry) => entry.id === familyId);
			const missingDrills =
				family?.legacyDrillIds.filter((drillId) => !drillIds.has(drillId)) ??
				[];

			if (
				!family ||
				family.legacyDrillIds.length < 4 ||
				missingDrills.length > 0
			) {
				return [
					{
						familyId,
						count: family?.legacyDrillIds.length ?? 0,
						missingDrills,
					},
				];
			}

			return [];
		});

		expect(shallowFamilies).toEqual([]);
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

	it("returns the fully canonical lesson catalog with all track totals", () => {
		const catalog = getLessonCatalog();
		const restLessons = getLessonsByTrackRuntime("rest");
		const soapLessons = getLessonsByTrackRuntime("soap");
		const crossTrackLessons = getLessonsByTrackRuntime("cross-track");
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
		expect(catalog).toHaveLength(20);
		expect(restLessons).toHaveLength(10);
		expect(soapLessons).toHaveLength(7);
		expect(crossTrackLessons).toHaveLength(2);
		expect(restLessons.at(-1)?.slug).toBe(
			"rest-10-observability-health-checks-runbooks"
		);
		expect(soapLessons.at(-1)?.slug).toBe(
			"soap-7-fault-taxonomy-internal-error-mapping"
		);
		expect(crossTrackLessons.at(-1)?.slug).toBe(
			"cross-track-2-carrier-capability-matrix-integration-architecture"
		);
		expect(catalog.every((lesson) => Boolean(lesson.id))).toBe(true);
	});

	it("publishes canonical scenario family ids for every arena card without legacy duplicates", () => {
		const cards = getArenaScenarioCards(101);
		const ids = cards.map((scenario) => scenario.id);

		expect(cards).toHaveLength(20);
		expect(ids).toContain("rate-limiting-storm");
		expect(ids).toContain("duplicate-webhook-replay");
		expect(ids).toContain("soap-header-auth-mismatch");
		expect(ids).toContain("sandbox-works-but-production-rejects-the-request");
		expect(ids).not.toContain("rate-limit-429");
		expect(ids).not.toContain("soap-fault-detail");
		expect(ids).not.toContain("wsdl-change-breaks");
		expect(cards.every((scenario) => Boolean(scenario.progressKey))).toBe(true);
	});
});
