import { createRouter } from "@tanstack/react-router";

// Side-effect import: boots Sentry on the client when VITE_SENTRY_DSN is set.
// The module short-circuits server-side and also when the DSN is absent, so
// this stays cheap and safe in every environment.
import "./instrument.client";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// You must export a getRouter function that
// returns a new router instance each time
export function getRouter() {
	const router = createRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreloadStaleTime: 0,
		defaultStructuralSharing: true,
		defaultPreload: "intent",
	});

	return router;
}
