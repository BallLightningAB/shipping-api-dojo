import { drizzle } from "drizzle-orm/node-postgres";
import { type Pool, type PoolConfig } from "pg";
import pg from "pg";

import { getDatabaseUrl } from "@/lib/db/env";
import { schema } from "@/lib/db/schema";

const { Pool: NodePgPool } = pg;

let poolSingleton: Pool | null = null;
let dbSingleton: ReturnType<typeof drizzle<typeof schema>> | null = null;

function createPool(config?: PoolConfig): Pool {
	return new NodePgPool({
		connectionString: getDatabaseUrl(),
		max: 10,
		...config,
	});
}

export function getDb() {
	if (dbSingleton) {
		return dbSingleton;
	}

	poolSingleton ??= createPool();
	dbSingleton = drizzle(poolSingleton, { schema });
	return dbSingleton;
}

export async function closeDbPool(): Promise<void> {
	if (!poolSingleton) {
		return;
	}

	await poolSingleton.end();
	poolSingleton = null;
	dbSingleton = null;
}
