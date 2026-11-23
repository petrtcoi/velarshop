const METRIKA_COUNTER_ID = 93362045

declare global {
	interface Window {
		ym?: (...args: unknown[]) => void
		__velarMetrikaGoals?: string[]
	}
}

export function reachMetrikaGoal(goal: string, params?: Record<string, unknown>): void {
	if (typeof window === 'undefined') return

	if (typeof window.ym === 'function') {
		if (params) window.ym(METRIKA_COUNTER_ID, 'reachGoal', goal, params)
		else window.ym(METRIKA_COUNTER_ID, 'reachGoal', goal)
		return
	}

	// The counter is initialised ~5 s after load and the queue only keeps goal names,
	// so a goal with params is skipped silently while the counter is missing.
	if (params) return

	window.__velarMetrikaGoals = window.__velarMetrikaGoals || []
	window.__velarMetrikaGoals.push(goal)
}
