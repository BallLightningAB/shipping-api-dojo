/**
 * Client-only hydration component for the progress system.
 * Loads progress from localStorage and sets up cross-tab sync.
 */

import { useEffect, useRef } from "react";
import { authClient } from "@/lib/auth/client";
import { shouldReplaceLocalProgress } from "@/lib/progress/progress.hydration";
import { mergeAnonymousProgressOnSignIn } from "@/lib/progress/progress.sync";
import {
	getProgressSnapshot,
	hydrateProgress,
	replaceProgress,
	setupCrossTabSync,
} from "@/lib/progress/progress.store";

export function ProgressHydrator() {
	const session = authClient.useSession();
	const syncedUserIdRef = useRef<string | null>(null);

	useEffect(() => {
		hydrateProgress();
		const teardown = setupCrossTabSync();

		return teardown;
	}, []);

	useEffect(() => {
		const userId = session.data?.user?.id;
		if (!userId) {
			syncedUserIdRef.current = null;
			return;
		}

		if (syncedUserIdRef.current === userId) {
			return;
		}

		syncedUserIdRef.current = userId;

		let cancelled = false;

		const syncProgress = async () => {
			try {
				const localProgress = getProgressSnapshot();
				const initial = await mergeAnonymousProgressOnSignIn({
					data: {
						localProgress,
					},
				});

				if (cancelled) {
					return;
				}

				if (shouldReplaceLocalProgress(initial)) {
					replaceProgress(initial.progress);
					return;
				}

				console.info(
					"Progress sync requires explicit merge decision. UI prompt wiring is pending."
				);
			} catch (error) {
				console.error("Failed to sync signed-in progress", error);
			}
		};

		syncProgress().catch((error) => {
			console.error("Failed to run signed-in progress sync", error);
		});

		return () => {
			cancelled = true;
		};
	}, [session.data?.user?.id]);

	return null;
}
