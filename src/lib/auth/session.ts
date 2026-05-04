import { createServerFn } from "@tanstack/react-start";

import { getRequestSession } from "@/lib/auth/server";

export const getServerSession = createServerFn({ method: "GET" }).handler(() =>
	getRequestSession()
);
