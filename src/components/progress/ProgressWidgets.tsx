/**
 * XP + Streak badge widgets for displaying in the header/layout.
 */

import { useStore } from "@tanstack/react-store";
import { Flame, Zap } from "lucide-react";
import { progressStore } from "@/lib/progress/progress.store";

export function XpBadge() {
	const xp = useStore(progressStore, (s) => s.xp);

	return (
		<div className="flex items-center gap-1.5 rounded-full bg-bl-red/10 px-3 py-1 text-sm font-medium text-bl-red">
			<Zap className="h-3.5 w-3.5" />
			<span>{xp} XP</span>
		</div>
	);
}

export function StreakBadge() {
	const streak = useStore(progressStore, (s) => s.streak);

	if (streak === 0) {
		return null;
	}

	return (
		<div className="flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 text-sm font-medium text-orange-400">
			<Flame className="h-3.5 w-3.5" />
			<span>{streak}d streak</span>
		</div>
	);
}
