/**
 * Client-only hydration component for the progress system.
 * Loads progress from localStorage and sets up cross-tab sync.
 */

import { useEffect } from "react";
import {
	hydrateProgress,
	setupCrossTabSync,
} from "@/lib/progress/progress.store";

export function ProgressHydrator() {
	useEffect(() => {
		hydrateProgress();
		const teardown = setupCrossTabSync();

		return teardown;
	}, []);

	return null;
}
