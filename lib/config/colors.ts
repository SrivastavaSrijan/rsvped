/**
 * A curated list of theme color names suitable for random selection.
 * This list should be manually kept in sync with `app/theme.css`.
 */
export const mainThemeColorNames = ['cranberry', 'barney', 'purple']
export const extendedThemeColorNames = [
	...mainThemeColorNames,
	'blue',
	'red',
	'yellow',
	'orange',
	'green',
]

export const themeFaintColorNames = [
	'pale-cranberry',
	'faint-cranberry',
	'pale-blue',
	'faint-blue',
	'pale-red',
	'faint-red',
	'darker-pale-red',
	'half-red',
	'pale-yellow',
	'faint-yellow',
	'pale-orange',
	'faint-orange',
	'pale-purple',
	'faint-purple',
	'pale-barney',
	'faint-barney',
]

/**
 * The available intensity values for theme colors.
 */
export const themeColorIntensities = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90]

export type MainThemeColorName = (typeof mainThemeColorNames)[number]
export type ExtendedThemeColorName = (typeof extendedThemeColorNames)[number]
export type ThemeFaintColorName = (typeof themeFaintColorNames)[number]

export type ThemeColorIntensity = (typeof themeColorIntensities)[number]
