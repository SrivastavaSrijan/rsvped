export const TimezoneConfig = {
	get current() {
		return Intl.DateTimeFormat().resolvedOptions().timeZone
	},
	get name() {
		return Intl.DateTimeFormat().resolvedOptions().timeZoneName
	},
}
