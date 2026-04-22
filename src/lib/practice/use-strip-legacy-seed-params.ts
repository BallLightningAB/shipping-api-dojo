import { useEffect } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";

import { LEGACY_SEED_SEARCH_PARAMS } from "./seed-search";

export function useStripLegacySeedParams() {
	const navigate = useNavigate();
	const href = useLocation({
		select: (location) => location.href,
	});

	useEffect(() => {
		const url = new URL(href, "http://shipping-api-dojo.local");
		let changed = false;
		for (const param of LEGACY_SEED_SEARCH_PARAMS) {
			if (url.searchParams.has(param)) {
				url.searchParams.delete(param);
				changed = true;
			}
		}

		if (changed) {
			navigate({
				href: `${url.pathname}${url.search}${url.hash}`,
				replace: true,
				resetScroll: false,
			});
		}
	}, [href, navigate]);
}
