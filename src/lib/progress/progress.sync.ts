import { eq } from "drizzle-orm";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireRequestSession } from "@/lib/auth/server";
import { getDb } from "@/lib/db/client";
import { progressMergeEvents, userProgress } from "@/lib/db/schema";
import { mergeProgressSnapshots } from "@/lib/progress/progress.merge";
import {
	CURRENT_VERSION,
	DEFAULT_PROGRESS,
	ProgressDataSchema,
	parseProgress,
} from "@/lib/progress/progress.schema";

const mergeStrategySchema = z.enum(["merge_local", "keep_server"]);

const progressMergeRequestSchema = z.object({
	localProgress: ProgressDataSchema,
	strategy: mergeStrategySchema.optional(),
});

function isDefaultProgress(progress: ReturnType<typeof parseProgress>) {
	return JSON.stringify(progress) === JSON.stringify(DEFAULT_PROGRESS);
}

async function readCurrentUserProgress(userId: string) {
	const db = getDb();

	const [row] = await db
		.select({
			progressJson: userProgress.progressJson,
		})
		.from(userProgress)
		.where(eq(userProgress.userId, userId))
		.limit(1);

	if (!row) {
		return null;
	}

	return parseProgress(row.progressJson);
}

async function upsertCurrentUserProgress(
	userId: string,
	progress: ReturnType<typeof parseProgress>
) {
	const db = getDb();

	await db
		.insert(userProgress)
		.values({
			userId,
			version: CURRENT_VERSION,
			progressJson: progress,
		})
		.onConflictDoUpdate({
			target: userProgress.userId,
			set: {
				version: CURRENT_VERSION,
				progressJson: progress,
				updatedAt: new Date(),
			},
		});
}

export const readServerProgress = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await requireRequestSession();
		const progress = await readCurrentUserProgress(session.user.id);

		return progress ?? { ...DEFAULT_PROGRESS };
	}
);

export const writeServerProgress = createServerFn({ method: "POST" })
	.inputValidator(ProgressDataSchema)
	.handler(async ({ data }) => {
		const session = await requireRequestSession();
		await upsertCurrentUserProgress(session.user.id, data);

		return data;
	});

export const mergeAnonymousProgressOnSignIn = createServerFn({ method: "POST" })
	.inputValidator(progressMergeRequestSchema)
	.handler(async ({ data }) => {
		const session = await requireRequestSession();
		const db = getDb();
		const serverProgress = await readCurrentUserProgress(session.user.id);

		if (!serverProgress || isDefaultProgress(serverProgress)) {
			await upsertCurrentUserProgress(session.user.id, data.localProgress);

			await db.insert(progressMergeEvents).values({
				userId: session.user.id,
				mergeStrategy: "auto_empty_server_take_local",
				localSnapshot: data.localProgress,
				serverSnapshot: serverProgress,
				resultSnapshot: data.localProgress,
			});

			return {
				requiresDecision: false as const,
				progress: data.localProgress,
			};
		}

		if (!data.strategy) {
			return {
				requiresDecision: true as const,
				progress: serverProgress,
			};
		}

		const resultProgress =
			data.strategy === "merge_local"
				? mergeProgressSnapshots(serverProgress, data.localProgress)
				: serverProgress;

		await db
			.update(userProgress)
			.set({
				progressJson: resultProgress,
				version: CURRENT_VERSION,
				updatedAt: new Date(),
			})
			.where(eq(userProgress.userId, session.user.id));

		await db.insert(progressMergeEvents).values({
			userId: session.user.id,
			mergeStrategy: data.strategy,
			localSnapshot: data.localProgress,
			serverSnapshot: serverProgress,
			resultSnapshot: resultProgress,
		});

		return {
			requiresDecision: false as const,
			progress: resultProgress,
		};
	});
