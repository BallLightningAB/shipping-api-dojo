import { createRouter } from "@tanstack/react-router";

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
