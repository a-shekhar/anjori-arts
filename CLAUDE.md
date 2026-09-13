@AGENTS.md

# Implementation contract

Follow the project quality rules in `AGENTS.md` for every change. In particular:

- Build and verify every feature for mobile (320px+), tablet (768px+), and desktop (1024px+); interactive controls must work with touch, mouse, keyboard, and screen readers with minimum 44×44px touch targets.
- Keep all public navigation valid. Do not expose a CTA, route, phone number, or social link that is only a placeholder.
- Preserve a global, token-driven light/dark theme. Components with custom CSS must be reviewed in both modes.
- Treat SEO and Core Web Vitals as release requirements: truthful metadata and structured JSON-LD schemas, an accurate automated sitemap, stable layouts (CLS = 0 with fixed aspect ratios and blur placeholders), optimized Next.js images/fonts, and minimal client JavaScript.
- Prioritize native GPU-accelerated CSS transitions and Tailwind utilities over heavy runtime client libraries (e.g. `framer-motion`) to guarantee instant load times and zero bundle bloat.
- Mandate React Email (`@react-email/components`) for all transactional email communications; ban raw HTML string concatenation.
- Enforce Zero-Trust Security: calculate all money, delivery charges, discounts, and inventory authoritatively on the server; parse all input payloads with Zod; verify cryptographic admin sessions (`withAdminAuth`).
- Enforce WCAG 2.1 AA Accessibility & in-flight mutation UX: accessible labels on icon buttons, modal focus traps, loading spinners on disabled submit buttons, and immediate Sonner toast feedback.
- Enforce code organization & anti-duplication: continuous pruning of unused code, strict use of centralized constants, shared components over repetition, centralized DB mappers, and safe hydration hooks.
- Use semantic elements, descriptive labels, accessible focus states, and responsive touch targets.
- Before completion, run lint and TypeScript checks; validate the relevant route in light and dark mode at mobile, tablet, and desktop widths.

## Agent Workflow Rules
- ALWAYS go in plan mode first. Discuss the proposed solution with the user and get approval BEFORE implementing any code changes.
- ALWAYS choose consistency: match the style, format, and design conventions of existing pages (e.g. hero sections, search bars, component layouts) when building new features.
- ALWAYS verify compilation after every change: run TypeScript checks (`tsc --noEmit`) and compilation checks. If it is not compiling, it is NOT done.
- ALWAYS conduct a rigorous post-change audit: after each change, proactively identify bugs, identify what is not working or what won't work (edge cases, failure modes, regressions across devices/tabs), and identify if and how anything can be improved.
- ALWAYS check for impacted components and outdated information: whenever making changes, check all impacted components, consumers, and references across the codebase; identify any outdated information or broken assumptions, and proactively suggest or apply the required edits.
- "fatal: .git/index: index file smaller than expected this error should never appear" — ensure git operations preserve index integrity and never leave a corrupted .git/index file.

