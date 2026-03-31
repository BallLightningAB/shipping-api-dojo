import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "@/lib/auth";

export function getRequestSession() {
	const headers = getRequestHeaders();
	return auth.api.getSession({ headers });
}

export async function requireRequestSession() {
	const session = await getRequestSession();

	if (!session?.user?.id) {
		throw new Error("UNAUTHORIZED");
	}

	return session;
}
