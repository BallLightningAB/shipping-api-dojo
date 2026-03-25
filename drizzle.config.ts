import { defineConfig } from "drizzle-kit";

const DATABASE_URL =
	process.env.DATABASE_URL ??
	"postgres://postgres:postgres@localhost:5432/postgres";

export default defineConfig({
	schema: "./src/lib/db/schema.ts",
	out: "./drizzle",
	dialect: "postgresql",
	dbCredentials: {
		url: DATABASE_URL,
	},
	strict: true,
	verbose: true,
});
