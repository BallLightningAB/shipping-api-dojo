import { describe, expect, it } from "vitest";

import {
	LEGACY_STORAGE_KEYS,
	STORAGE_KEY,
	readStoredProgress,
} from "./progress.storage";
import { CURRENT_VERSION } from "./progress.schema";

function createStorage(values: Record<string, string>) {
	return {
		getItem(key: string) {
			return values[key] ?? null;
		},
	};
}

describe("readStoredProgress", () => {
	it("prefers the current storage key when present", () => {
		const result = readStoredProgress(
			createStorage({
				[STORAGE_KEY]: JSON.stringify({
					version: CURRENT_VERSION,
					xp: 12,
					streak: 1,
					lastActiveDate: null,
					lessons: {},
					scenariosCompleted: [],
				}),
				[LEGACY_STORAGE_KEYS[0]]: JSON.stringify({
					version: CURRENT_VERSION,
					xp: 99,
					streak: 1,
					lastActiveDate: null,
					lessons: {},
					scenariosCompleted: [],
				}),
			})
		);

		expect(result.sourceKey).toBe(STORAGE_KEY);
		expect(result.data.xp).toBe(12);
	});

	it("falls back to the legacy storage key when needed", () => {
		const result = readStoredProgress(
			createStorage({
				[LEGACY_STORAGE_KEYS[0]]: JSON.stringify({
					version: CURRENT_VERSION,
					xp: 27,
					streak: 3,
					lastActiveDate: null,
					lessons: {},
					scenariosCompleted: [],
				}),
			})
		);

		expect(result.sourceKey).toBe(LEGACY_STORAGE_KEYS[0]);
		expect(result.data.xp).toBe(27);
	});
});
