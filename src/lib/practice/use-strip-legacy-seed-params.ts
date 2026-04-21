import { useEffect } from "react";

import { LEGACY_SEED_SEARCH_PARAMS } from "./seed-search";

export function useStripLegacySeedParams() {
	useEffect(() => {
		const url = new URL(window.location.href);
		let changed = false;
		for (const param of LEGACY_SEED_SEARCH_PARAMS) {
			if (url.searchParams.has(param)) {
				url.searchParams.delete(param);
				changed = true;
			}
		}

		if (changed) {
			window.history.replaceState(
				window.history.state,
				"",
				`${url.pathname}${url.search}${url.hash}`
			);
		}
	}, []);
}
