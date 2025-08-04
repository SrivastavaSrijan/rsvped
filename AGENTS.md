# AI Assistant Guidelines for the RSVP'd Project

This document provides a high-level summary of the development standards for AI assistants like GitHub Copilot.

**The complete and authoritative coding guidelines are located in [.github/copilot-instructions.md](./.github/copilot-instructions.md). Please read that file carefully before generating or modifying code.**

## Core Principles

1.  **tRPC Everywhere**: All database and API interactions **must** go through the tRPC client (`@/lib/trpc`) or the server-side API helper (`@/server/api`). Mutations are handled exclusively by Server Actions that call the tRPC API.
2.  **Token-Driven Styling**: All styling uses Tailwind CSS utilities. Colors, fonts, radii, and spacing are defined as CSS variables (`--token-name`) in `app/theme.css` and mapped to Tailwind classes. Do not use arbitrary values or `var()` in `className`.
3.  **Strict Component & Module Imports**: Always use path aliases (`@/lib`, `@/components/ui`, etc.). Never use relative paths like `../../`.
4.  **Follow Existing Patterns**: Adhere strictly to the established patterns for Server Actions, data fetching (RSC vs. Client), and component structure. Do not introduce new patterns or libraries without explicit instruction.
5.  **Be Frugal**: Prioritize reusing existing components and logic. For example, an "edit" form should reuse the "create" form component.