import { describe, expect, it } from "vitest";

import {
	createSeededRandom,
	deriveChildSeed,
	deriveRouteSeed,
	hashStringToSeed,
	shuffleDeterministic,
} from "./randomization";

describe("randomization helpers", () => {
	it("produces stable numeric seeds from strings", () => {
		expect(hashStringToSeed("lesson:rest-1")).toBe(
			hashStringToSeed("lesson:rest-1")
		);
		expect(hashStringToSeed("lesson:rest-1")).not.toBe(
			hashStringToSeed("lesson:soap-1")
		);
	});

	it("produces deterministic random sequences for the same seed", () => {
		const first = createSeededRandom(1234);
		const second = createSeededRandom(1234);

		expect([first(), first(), first()]).toEqual([second(), second(), second()]);
	});

	it("shuffles deterministically for the same seed and changes for a different seed", () => {
		const items = ["a", "b", "c", "d", "e", "f"];
		const first = shuffleDeterministic(items, 101);
		const second = shuffleDeterministic(items, 101);
		const third = shuffleDeterministic(items, 202);

		expect(first).toEqual(second);
		expect(third).not.toEqual(first);
	});

	it("derives stable parent and child route seeds", () => {
		const routeSeed = deriveRouteSeed(
			"lesson:rest-1-http-semantics",
			"2026-04-08"
		);
		const sameRouteSeed = deriveRouteSeed(
			"lesson:rest-1-http-semantics",
			"2026-04-08"
		);
		const childSeed = deriveChildSeed(routeSeed, "drill-order");

		expect(routeSeed).toBe(sameRouteSeed);
		expect(childSeed).toBe(deriveChildSeed(routeSeed, "drill-order"));
		expect(childSeed).not.toBe(deriveChildSeed(routeSeed, "options"));
	});
});
