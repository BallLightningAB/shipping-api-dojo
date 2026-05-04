export function hashStringToSeed(value: string): number {
	let hash = 7;

	for (let index = 0; index < value.length; index += 1) {
		hash = (hash * 31 + value.charCodeAt(index)) % 2_147_483_647;
	}

	return hash === 0 ? 1 : hash;
}

export function createSeededRandom(seed: number | string): () => number {
	let state =
		typeof seed === "number" ? normalizeSeed(seed) : hashStringToSeed(seed);

	return () => {
		state = (state * 48_271) % 2_147_483_647;
		return state / 2_147_483_647;
	};
}

export function shuffleDeterministic<T>(
	items: readonly T[],
	seed: number | string
): T[] {
	const random = createSeededRandom(seed);
	const nextItems = [...items];

	for (let index = nextItems.length - 1; index > 0; index -= 1) {
		const swapIndex = Math.floor(random() * (index + 1));
		[nextItems[index], nextItems[swapIndex]] = [
			nextItems[swapIndex],
			nextItems[index],
		];
	}

	return nextItems;
}

export function pickDeterministic<T>(
	items: readonly T[],
	seed: number | string
): T {
	if (items.length === 0) {
		throw new Error("pickDeterministic requires at least one item.");
	}

	const random = createSeededRandom(seed);
	return items[Math.floor(random() * items.length)] as T;
}

export function deriveRouteSeed(scope: string, dateKey?: string): number {
	const dayKey = dateKey ?? new Date().toISOString().slice(0, 10);
	return hashStringToSeed(`${scope}:${dayKey}`);
}

export function deriveChildSeed(seed: number | string, scope: string): number {
	return hashStringToSeed(`${typeof seed === "number" ? seed : seed}:${scope}`);
}

export function makeClientSeed(scope: string): number {
	return hashStringToSeed(`${scope}:${Date.now()}:${Math.random()}`);
}

function normalizeSeed(seed: number): number {
	const normalized = Math.abs(Math.floor(seed)) % 2_147_483_647;
	return normalized === 0 ? 1 : normalized;
}
