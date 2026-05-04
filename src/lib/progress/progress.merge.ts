import {
	CURRENT_VERSION,
	type LessonProgress,
	normalizeProgressData,
	type ProgressData,
} from "./progress.schema";

function maxIsoDate(left: string | null, right: string | null): string | null {
	if (!left) {
		return right;
	}
	if (!right) {
		return left;
	}
	return left >= right ? left : right;
}

function mergeLessons(
	serverLessons: ProgressData["lessons"],
	localLessons: ProgressData["lessons"]
): ProgressData["lessons"] {
	const lessonKeys = new Set([
		...Object.keys(serverLessons),
		...Object.keys(localLessons),
	]);

	const mergedLessons: ProgressData["lessons"] = {};

	for (const lessonKey of lessonKeys) {
		const serverLesson = serverLessons[lessonKey];
		const localLesson = localLessons[lessonKey];

		const mergedDrillScores: LessonProgress["drillScores"] = {};
		const drillKeys = new Set([
			...Object.keys(serverLesson?.drillScores ?? {}),
			...Object.keys(localLesson?.drillScores ?? {}),
		]);

		for (const drillKey of drillKeys) {
			const serverScore = serverLesson?.drillScores[drillKey] ?? 0;
			const localScore = localLesson?.drillScores[drillKey] ?? 0;
			mergedDrillScores[drillKey] = Math.max(serverScore, localScore);
		}

		mergedLessons[lessonKey] = {
			completed: Boolean(serverLesson?.completed || localLesson?.completed),
			completedAt: maxIsoDate(
				serverLesson?.completedAt ?? null,
				localLesson?.completedAt ?? null
			),
			drillScores: mergedDrillScores,
		};
	}

	return mergedLessons;
}

export function mergeProgressSnapshots(
	serverProgress: ProgressData,
	localProgress: ProgressData
): ProgressData {
	const normalizedServer = normalizeProgressData(serverProgress);
	const normalizedLocal = normalizeProgressData(localProgress);
	const mergedScenarios = new Set([
		...normalizedServer.scenariosCompleted,
		...normalizedLocal.scenariosCompleted,
	]);

	return {
		version: CURRENT_VERSION,
		xp: Math.max(normalizedServer.xp, normalizedLocal.xp),
		streak: Math.max(normalizedServer.streak, normalizedLocal.streak),
		lastActiveDate: maxIsoDate(
			normalizedServer.lastActiveDate,
			normalizedLocal.lastActiveDate
		),
		lessons: mergeLessons(normalizedServer.lessons, normalizedLocal.lessons),
		scenariosCompleted: [...mergedScenarios],
	};
}
