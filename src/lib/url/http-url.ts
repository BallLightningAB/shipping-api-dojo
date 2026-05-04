export function normalizeHttpUrl(
	value: string | undefined,
	options: {
		requireHttps?: boolean;
	} = {}
): string | null {
	if (!value) {
		return null;
	}

	try {
		const url = new URL(value);
		if (options.requireHttps) {
			return url.protocol === "https:" ? url.toString() : null;
		}

		return url.protocol === "https:" || url.protocol === "http:"
			? url.toString()
			: null;
	} catch {
		return null;
	}
}
