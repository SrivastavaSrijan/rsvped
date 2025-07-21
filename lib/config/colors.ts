/**
 * A curated list of theme color names suitable for random selection.
 * This list should be manually kept in sync with `app/theme.css`.
 */
export const themeColorNames = ['cranberry', 'barney', 'purple'] as const

/**
 * The available intensity values for theme colors.
 */
export const themeColorIntensities = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90] as const

export type ThemeColorName = (typeof themeColorNames)[number]
export type ThemeColorIntensity = (typeof themeColorIntensities)[number]
