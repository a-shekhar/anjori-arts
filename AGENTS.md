<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Product quality rules

## Responsive and interaction design

- Treat mobile (320px+), tablet (768px+), and desktop (1024px+) as first-class layouts. Do not ship a desktop layout that merely shrinks on mobile.
- Test navigation, drawers, dialogs, menus, links, forms, cart controls, and all primary calls to action at each breakpoint. Every visible interactive element must perform a meaningful action.
- Do not link to a route that has not been implemented. Use a valid on-page anchor or a configured external destination until the route exists.
- Icon-only controls need an accessible name and a minimum 44 by 44 CSS-pixel touch target. Keep focus indicators visible.
- Use semantic HTML first: `header`, `nav`, `main`, `section`, `footer`, native buttons for actions, and links for navigation.

## Visual system and theming

- Use semantic design tokens (`background`, `foreground`, `primary`, `muted`, `border`) instead of one-off colour values for UI surfaces, text, borders, and buttons.
- Global light and dark modes must both be intentional. New custom components must define dark-mode values for every hard-coded decorative colour or use shared CSS variables.
- Keep a single primary brand colour per screen. Artwork and product imagery supply the additional colour.
- Buttons must have visible default, hover, keyboard-focus, disabled, and dark-mode states. Do not use emojis or encoded symbols as interface icons.
- Maintain readable contrast, clear type hierarchy, and adequate spacing without relying on hover-only information.

## SEO and discoverability

- Every public route must render meaningful server-readable content, have a unique title and description, use one `h1`, and use heading levels in order.
- Keep canonical URLs, Open Graph data, Twitter metadata, `robots.ts`, and `sitemap.ts` accurate. The sitemap may list only real, indexable routes that return a successful page.
- Use descriptive link text and image alt text. Add JSON-LD only when it matches visible, truthful page content.
- Do not promise universal indexing. Follow search-engine best practices and submit the deployed sitemap through the relevant webmaster tools.
- Keep real contact and social destinations in `siteConfig`; placeholder URLs must not be used for public calls to action.

## Core Web Vitals and implementation

- Prefer Server Components. Add client components only for browser interaction or state.
- Use `next/image` for production raster imagery with correct dimensions, `sizes`, and accurate `alt`; reserve priority loading for the LCP image only.
- Use `next/font`, reserve media space to prevent layout shift, avoid unnecessary animation and client JavaScript, and never block the initial render on third-party scripts.
- Run lint and TypeScript checks after relevant changes. For visual work, check light and dark modes across mobile, tablet, and desktop before handoff.

## Agent Workflow Rules
- ALWAYS go in plan mode first. Discuss the proposed solution with the user and get approval BEFORE implementing any code changes.
- ALWAYS choose consistency: match the style, format, and design conventions of existing pages (e.g. hero sections, search bars, component layouts) when building new features.
- ALWAYS verify compilation after every change: run TypeScript checks (`tsc --noEmit`) and compilation checks. If it is not compiling, it is NOT done.
