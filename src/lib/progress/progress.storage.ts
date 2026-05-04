/**
 * Progress System — Isomorphic Storage Adapter
 *
 * Uses createIsomorphicFn to safely access localStorage on client
 * and return defaults on server.
 */

import { createIsomorphicFn } from "@tanstack/react-start";
import {
	DEFAULT_PROGRESS,
	type ProgressData,
	parseProgress,
} from "./progress.schema";

const STORAGE_KEY = "shipping-api-dojo-progress";
const LEGACY_STORAGE_KEYS = ["api-trainer-progress"];

type StorageReader = Pick<Storage, "getItem">;
type StorageWriter = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function parseStoredProgress(raw: string | null): ProgressData | null {
	if (!raw) {
		return null;
	}

	try {
		return parseProgress(JSON.parse(raw));
	} catch {
		return null;
	}
}

export function readStoredProgress(storage: StorageReader) {
	const primary = parseStoredProgress(storage.getItem(STORAGE_KEY));
	if (primary) {
		return {
			data: primary,
			sourceKey: STORAGE_KEY,
		};
	}

	for (const legacyKey of LEGACY_STORAGE_KEYS) {
		const legacy = parseStoredProgress(storage.getItem(legacyKey));
		if (legacy) {
			return {
				data: legacy,
				sourceKey: legacyKey,
			};
		}
	}

	return {
		data: { ...DEFAULT_PROGRESS },
		sourceKey: null,
	};
}

function migrateLegacyProgressIfNeeded(
	storage: StorageWriter,
	data: ProgressData,
	sourceKey: string | null
) {
	if (!sourceKey || sourceKey === STORAGE_KEY) {
		return;
	}

	try {
		storage.setItem(STORAGE_KEY, JSON.stringify(data));
		storage.removeItem(sourceKey);
	} catch {
		// storage full or unavailable — silent fail
	}
}

export const loadProgress = createIsomorphicFn()
	.server(() => {
		return { ...DEFAULT_PROGRESS };
	})
	.client(() => {
		const result = readStoredProgress(localStorage);
		migrateLegacyProgressIfNeeded(localStorage, result.data, result.sourceKey);
		return result.data;
	});

export const saveProgress = createIsomorphicFn()
	.server((_data: ProgressData) => {
		// no-op on server
	})
	.client((data: ProgressData) => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
			for (const legacyKey of LEGACY_STORAGE_KEYS) {
				localStorage.removeItem(legacyKey);
			}
		} catch {
			// storage full or unavailable — silent fail
		}
	});

export const clearProgress = createIsomorphicFn()
	.server(() => {
		// no-op on server
	})
	.client(() => {
		try {
			localStorage.removeItem(STORAGE_KEY);
			for (const legacyKey of LEGACY_STORAGE_KEYS) {
				localStorage.removeItem(legacyKey);
			}
		} catch {
			// silent fail
		}
	});

export { STORAGE_KEY, LEGACY_STORAGE_KEYS };
