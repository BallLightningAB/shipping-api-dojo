export interface InitialProgressSyncResult {
	requiresDecision: boolean;
}

export function shouldReplaceLocalProgress(
	result: InitialProgressSyncResult
): boolean {
	return !result.requiresDecision;
}
