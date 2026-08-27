const METRIKA_COUNTER_ID = 93362045

declare global {
	interface Window {
		ym?: (...args: unknown[]) => void
		__velarMetrikaGoals?: string[]
	}
}

export function reachMetrikaGoal(goal: string): void {
	if (typeof window === 'undefined') return

	if (typeof window.ym === 'function') {
		window.ym(METRIKA_COUNTER_ID, 'reachGoal', goal)
		return
	}

	window.__velarMetrikaGoals = window.__velarMetrikaGoals || []
	window.__velarMetrikaGoals.push(goal)
}
