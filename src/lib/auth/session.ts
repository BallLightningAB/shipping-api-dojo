import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "@/lib/auth";

export const getServerSession = createServerFn({ method: "GET" }).handler(
	() => {
		const headers = getRequestHeaders();
		return auth.api.getSession({
			headers,
		});
	}
);
