export type ThermalPoints = { q50: number; q60: number; q70: number }

/** Interpolate catalog points; below ΔT50 explicitly extrapolate the lower segment. */
export function powerAtDeltaT(dt: number, points: ThermalPoints): number {
	if (!Number.isFinite(dt) || dt <= 0 || ![points.q50, points.q60, points.q70].every(value => Number.isFinite(value) && value > 0)) return 0
	if (!(points.q50 <= points.q60 && points.q60 <= points.q70)) return 0
	if (dt >= 60) {
		const exponent = Math.log(points.q70 / points.q60) / Math.log(70 / 60)
		return points.q70 * Math.pow(dt / 70, exponent)
	}
	const exponent = Math.log(points.q60 / points.q50) / Math.log(60 / 50)
	return points.q60 * Math.pow(dt / 60, exponent)
}
