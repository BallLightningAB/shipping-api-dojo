import { z } from "zod";

const databaseEnvSchema = z.object({
	DATABASE_URL: z.url().min(1, "DATABASE_URL is required"),
});

export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;

export function parseDatabaseEnv(input: unknown): DatabaseEnv {
	return databaseEnvSchema.parse(input);
}

export function getDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
	const parsed = parseDatabaseEnv(env);
	return parsed.DATABASE_URL;
}
