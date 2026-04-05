---
name: tailwind-styling
description: Tailwind CSS styling rules including CSS variables, spacing, class composition, and v4 migration gotchas. Use when styling components, working with colors, or using the cn() utility.
---

# Tailwind Styling

## Overview

Guidelines for styling components with Tailwind CSS v4, including color handling, spacing, class composition, and migration from v3.

## Key Principles

- Use Tailwind for all styles (no new CSS modules)
- CSS variables only for colors (never hardcode hex)
- Use exact pixel values for spacing
- Use `cn()` for class composition
- Prefer flexbox over grid
- No `tailwind.config.ts` -- v4 uses `@theme` in CSS

## Do's and Don'ts

### Use Tailwind for All Styles

No new CSS modules. When modifying existing components, migrate styles to Tailwind.

### Colors: Semantic Tokens Only

Never hardcode hex values or reference `--palette-*` directly in components. Use semantic Tailwind classes for feature components, or `()` component token syntax in `@/components/ui/`.

```tsx
// Bad -- hardcoded hex
<div className="bg-[#781fb3]">

// Bad -- palette token directly in a component
<div className="bg-(--palette-violet-40)">

// Good -- semantic Tailwind class (feature/page components)
<div className="bg-primary">

// Good -- component token (@/components/ui/ only)
<div className="bg-(--button-default-bg)">
```

The `()` syntax is reserved for `@/components/ui/`. If it appears elsewhere, treat it as a code review flag.

### Use `cn()` for Class Composition

Located at `@/lib/utils`. Always use for conditional or combined classes.

```tsx
// Bad
<div className={`flex ${isDisabled ? "opacity-50" : null}`}>

// Good
import { cn } from "@/lib/utils";

<div className={cn("flex items-center", isDisabled && "opacity-50")}>
```

### Override Order in `cn()`

Put external `className` prop **last** so it can override defaults.

```tsx
export const Button = ({ className }: ButtonProps) => {
  return <button className={cn("flex items-center", className)} />;
};
```

### Prefer Flexbox Over Grid

Use flexbox by default. Grid only when it significantly simplifies layout.

### CSS Specificity for Overrides

Use specificity, not `!important`.

```css
/* Good */
.parentClass button.moreSpecific { opacity: 50%; }

/* Bad */
.moreSpecific { opacity: 50% !important; }
```

## Tailwind v4 Configuration

Tailwind v4 does NOT use `tailwind.config.ts`. All theme configuration lives in CSS using `@theme`.

```css
/* app/theme.css */
@import "tailwindcss";

@theme {
  --color-primary: oklch(0.65 0.24 270);
  --color-secondary: oklch(0.75 0.15 200);
  --font-sans: "Inter", sans-serif;
  --breakpoint-lg: 1024px;
}
```

If you see a `tailwind.config.ts` or `tailwind.config.js`, it is legacy and should be migrated.

## Tailwind v4 Gotchas

When migrating from Tailwind v3 to v4, these class names changed:

| v3 | v4 |
|---|---|
| shadow-sm | shadow-xs |
| shadow | shadow-sm |
| ring (3px) | ring (1px default, use ring-3 for old) |
| outline-none | outline-hidden |
| flex-shrink-* | shrink-* |
| flex-grow-* | grow-* |
| bg-opacity-50 | bg-black/50 |
| cursor-pointer (default) | cursor-default (add cursor-pointer explicitly) |

### Key differences explained

- **Shadows shifted down**: What was `shadow-sm` is now `shadow-xs`, and what was `shadow` is now `shadow-sm`. The old names now map to different sizes.
- **Ring width changed**: `ring` alone is now 1px instead of 3px. Use `ring-3` to get the old default behavior.
- **Outline**: `outline-none` now literally sets `outline-style: none`. Use `outline-hidden` for the old behavior (visually hidden but accessible).
- **Flex shorthand**: `flex-shrink-*` and `flex-grow-*` are shortened to `shrink-*` and `grow-*`.
- **Opacity modifiers**: Instead of `bg-opacity-50`, use the slash syntax: `bg-black/50`, `bg-primary/75`, etc.
- **Cursor**: Interactive elements no longer default to `cursor-pointer`. Add it explicitly on buttons and links if desired.

## References

- CSS variables / theme: `app/theme.css`
- cn() utility: `@/lib/utils`
- UI components: `@/components/ui/`
