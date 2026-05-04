/**
 * Client-only hydration component for the progress system.
 * Loads progress from localStorage and sets up cross-tab sync.
 */

import { authClient } from "@/lib/auth/client";
import { captureException } from "@/lib/observability/logger";
import { shouldReplaceLocalProgress } from "@/lib/progress/progress.hydration";
import {
	getProgressSnapshot,
	hydrateProgress,
	progressStore,
	replaceProgress,
	setupCrossTabSync,
} from "@/lib/progress/progress.store";
import {
	mergeAnonymousProgressOnSignIn,
	writeServerProgress,
} from "@/lib/progress/progress.sync";
import { useEffect, useRef, useState } from "react";

export function ProgressHydrator() {
	const session = authClient.useSession();
	const syncedUserIdRef = useRef<string | null>(null);
	const [writeReadyUserId, setWriteReadyUserId] = useState<string | null>(null);

	useEffect(() => {
		hydrateProgress();
		const teardown = setupCrossTabSync();

		return teardown;
	}, []);

	useEffect(() => {
		const userId = session.data?.user?.id;
		if (!userId) {
			syncedUserIdRef.current = null;
			setWriteReadyUserId(null);
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
					setWriteReadyUserId(userId);
					return;
				}

				setWriteReadyUserId(null);
				console.info(
					"Progress sync requires explicit merge decision. UI prompt wiring is pending."
				);
			} catch (error) {
				captureException(error, {
					operation: "sync_signed_in_progress",
					route: "client",
				});
			}
		};

		syncProgress().catch((error) => {
			captureException(error, {
				operation: "run_signed_in_progress_sync",
				route: "client",
			});
		});

		return () => {
			cancelled = true;
		};
	}, [session.data?.user?.id]);

	useEffect(() => {
		const userId = session.data?.user?.id;
		if (!userId || writeReadyUserId !== userId) {
			return;
		}

		let timeout: ReturnType<typeof setTimeout> | null = null;

		const subscription = progressStore.subscribe(() => {
			if (timeout) {
				clearTimeout(timeout);
			}

			timeout = setTimeout(() => {
				writeServerProgress({
					data: getProgressSnapshot(),
				}).catch((error) => {
					captureException(error, {
						operation: "write_signed_in_progress",
						route: "client",
					});
				});
			}, 350);
		});

		return () => {
			if (timeout) {
				clearTimeout(timeout);
			}
			subscription.unsubscribe();
		};
	}, [session.data?.user?.id, writeReadyUserId]);

	return null;
}
