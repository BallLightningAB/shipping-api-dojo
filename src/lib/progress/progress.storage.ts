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

const STORAGE_KEY = "api-trainer-progress";

export const loadProgress = createIsomorphicFn()
	.server(() => {
		return { ...DEFAULT_PROGRESS };
	})
	.client(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) {
				return { ...DEFAULT_PROGRESS };
			}
			return parseProgress(JSON.parse(raw));
		} catch {
			return { ...DEFAULT_PROGRESS };
		}
	});

export const saveProgress = createIsomorphicFn()
	.server((_data: ProgressData) => {
		// no-op on server
	})
	.client((data: ProgressData) => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
		} catch {
			// silent fail
		}
	});

export { STORAGE_KEY };
