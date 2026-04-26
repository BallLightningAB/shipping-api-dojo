import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { stripLegacySeedParamsFromHref } from "./seed-search";

export function useStripLegacySeedParams() {
	const navigate = useNavigate();
	const href = useLocation({
		select: (location) => location.href,
	});

	useEffect(() => {
		const result = stripLegacySeedParamsFromHref(href);
		if (result.changed) {
			navigate({
				href: result.href,
				replace: true,
				resetScroll: false,
			});
		}
	}, [href, navigate]);
}
