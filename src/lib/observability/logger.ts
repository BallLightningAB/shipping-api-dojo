export type ObservabilityContext = Record<
	string,
	boolean | number | string | null | undefined
>;

export function captureException(
	error: unknown,
	context: ObservabilityContext = {}
) {
	const normalizedError =
		error instanceof Error
			? error
			: new Error(String(error ?? "Unknown error"));

	console.error("[observability] exception", {
		context: removeUndefinedValues(context),
		error: {
			message: normalizedError.message,
			name: normalizedError.name,
		},
	});
}

function removeUndefinedValues(context: ObservabilityContext) {
	return Object.fromEntries(
		Object.entries(context).filter(([, value]) => value !== undefined)
	);
}
