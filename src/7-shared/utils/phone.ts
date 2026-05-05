export function formatRuPhoneInput(raw: string): string {
	if (!raw) return ''

	const trimmed = raw.trim()
	if (trimmed === '+') return '+'
	if (/^\++$/.test(trimmed)) return '+'

	let digits = trimmed.replace(/\D/g, '')
	if (!digits) return trimmed.startsWith('+') ? '+' : ''

	if (digits.startsWith('8')) {
		digits = `7${digits.slice(1)}`
	}

	let subscriber = digits.startsWith('7') ? digits.slice(1) : digits
	subscriber = subscriber.slice(0, 10)

	if (subscriber.length === 0) return '+7'

	let result = '+7'
	if (subscriber.length > 0) result += ` (${subscriber.slice(0, 3)}`
	if (subscriber.length >= 3) result += ')'
	if (subscriber.length > 3) result += ` ${subscriber.slice(3, 6)}`
	if (subscriber.length > 6) result += `-${subscriber.slice(6, 8)}`
	if (subscriber.length > 8) result += `-${subscriber.slice(8, 10)}`

	return result
}

export function formatRuPhoneSubscriberDigits(rawSubscriber: string): string {
	const subscriber = rawSubscriber.replace(/\D/g, '').slice(0, 10)
	if (!subscriber) return ''

	let result = '+7'
	result += ` (${subscriber.slice(0, 3)}`
	if (subscriber.length >= 3) result += ')'
	if (subscriber.length > 3) result += ` ${subscriber.slice(3, 6)}`
	if (subscriber.length > 6) result += `-${subscriber.slice(6, 8)}`
	if (subscriber.length > 8) result += `-${subscriber.slice(8, 10)}`

	return result
}

export function normalizeRuPhone(value: string): string {
	const digits = value.replace(/\D/g, '')
	if (!digits) return ''

	let normalized = digits
	if (normalized.startsWith('8')) {
		normalized = `7${normalized.slice(1)}`
	}
	if (!normalized.startsWith('7')) {
		normalized = `7${normalized}`
	}

	return `+${normalized.slice(0, 11)}`
}

export function getRuPhoneSubscriberDigits(value: string): string {
	const normalized = normalizeRuPhone(value)
	return normalized.startsWith('+7') ? normalized.slice(2) : ''
}

function countSubscriberDigitsBeforeCursor(value: string, cursor: number): number {
	const digitsBeforeCursor = value.slice(0, Math.max(0, cursor)).replace(/\D/g, '')
	if (!digitsBeforeCursor) return 0
	return digitsBeforeCursor.startsWith('7') ? Math.max(0, digitsBeforeCursor.length - 1) : digitsBeforeCursor.length
}

export function deleteRuPhoneInputDigit(value: string, selectionStart: number, selectionEnd: number, key: string): string | null {
	if (key !== 'Backspace' && key !== 'Delete') return null

	const subscriber = getRuPhoneSubscriberDigits(value)
	if (!subscriber) return ''
	if (selectionStart === 0 && selectionEnd >= value.length) return ''

	const startIndex = countSubscriberDigitsBeforeCursor(value, selectionStart)
	const endIndex = countSubscriberDigitsBeforeCursor(value, selectionEnd)

	if (selectionStart !== selectionEnd) {
		if (startIndex === 0 && endIndex >= subscriber.length) return ''
		return formatRuPhoneSubscriberDigits(`${subscriber.slice(0, startIndex)}${subscriber.slice(endIndex)}`)
	}

	if (key === 'Backspace') {
		if (startIndex <= 0) return ''
		return formatRuPhoneSubscriberDigits(`${subscriber.slice(0, startIndex - 1)}${subscriber.slice(startIndex)}`)
	}

	if (startIndex >= subscriber.length) return value
	return formatRuPhoneSubscriberDigits(`${subscriber.slice(0, startIndex)}${subscriber.slice(startIndex + 1)}`)
}
