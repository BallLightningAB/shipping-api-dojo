/**
 * Progress System — TanStack Store + Hydration + Debounced Writes + Cross-Tab Sync
 */

import { Store } from "@tanstack/store";
import {
	DEFAULT_PROGRESS,
	type ProgressData,
	parseProgress,
} from "./progress.schema";
import { loadProgress, STORAGE_KEY, saveProgress } from "./progress.storage";

export const progressStore = new Store<ProgressData>({ ...DEFAULT_PROGRESS });

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
let hasHydrated = false;
const noop = () => undefined;

function debouncedSave(data: ProgressData) {
	if (saveTimeout) {
		clearTimeout(saveTimeout);
	}
	saveTimeout = setTimeout(() => {
		saveProgress(data);
	}, 300);
}

progressStore.subscribe(() => {
	debouncedSave(progressStore.state);
});

export function hydrateProgress() {
	if (hasHydrated) {
		return;
	}

	const data = parseProgress(loadProgress());
	progressStore.setState((prev) => ({ ...prev, ...data }));
	hasHydrated = true;
}

export function setupCrossTabSync() {
	if (typeof window === "undefined") {
		return noop;
	}

	const onStorage = (e: StorageEvent) => {
		if (e.storageArea !== window.localStorage) {
			return;
		}

		if (e.key === STORAGE_KEY && e.newValue) {
			try {
				const parsed = parseProgress(JSON.parse(e.newValue));
				progressStore.setState((prev) => ({ ...prev, ...parsed }));
			} catch {
				// ignore malformed data from other tabs
			}
		}
	};

	window.addEventListener("storage", onStorage);

	return () => {
		window.removeEventListener("storage", onStorage);
	};
}

export function getProgressSnapshot(): ProgressData {
	return progressStore.state;
}

export function replaceProgress(next: ProgressData) {
	progressStore.setState(() => ({ ...next }));
}
