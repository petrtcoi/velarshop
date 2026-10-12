export type ThermalPoints = { q50: number; q60: number; q70: number }

/** Recalculate with the model's passport exponent, without extending a catalog segment. */
export function powerAtDeltaT(dt: number, q70: number, exponent: number): number {
	if (![dt, q70, exponent].every(Number.isFinite) || dt <= 0 || q70 <= 0 || exponent <= 0) return 0
	return q70 * Math.pow(dt / 70, exponent)
}
