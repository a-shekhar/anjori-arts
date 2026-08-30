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
