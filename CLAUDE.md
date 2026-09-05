@AGENTS.md

# Implementation contract

Follow the project quality rules in `AGENTS.md` for every change. In particular:

- Build and verify every feature for mobile, tablet, and desktop; interactive controls must work with touch, mouse, keyboard, and screen readers.
- Keep all public navigation valid. Do not expose a CTA, route, phone number, or social link that is only a placeholder.
- Preserve a global, token-driven light/dark theme. Components with custom CSS must be reviewed in both modes.
- Treat SEO and performance as release requirements: truthful metadata and structured data, an accurate sitemap and robots policy, stable layouts, optimized images/fonts, and minimal client JavaScript.
- Use semantic elements, descriptive labels, accessible focus states, and responsive touch targets.
- Before completion, run lint and TypeScript checks; validate the relevant route in light and dark mode at mobile, tablet, and desktop widths.

## Agent Workflow Rules
- ALWAYS go in plan mode first. Discuss the proposed solution with the user and get approval BEFORE implementing any code changes.
- ALWAYS choose consistency: match the style, format, and design conventions of existing pages (e.g. hero sections, search bars, component layouts) when building new features.
- ALWAYS verify compilation after every change: run TypeScript checks (`tsc --noEmit`) and compilation checks. If it is not compiling, it is NOT done.
