<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Product quality rules

## Responsive and interaction design (Universal Device Compatibility)

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

## SEO and discoverability (Search & Social Dominance)

- Every public route must render meaningful server-readable content, have a unique title and description, use one `h1`, and use heading levels in order.
- Keep canonical URLs, Open Graph data, Twitter metadata, `robots.ts`, and `sitemap.ts` accurate. The sitemap may list only real, indexable routes that return a successful page.
- Use descriptive link text and image alt text. Add JSON-LD schemas (Product, Artwork, BreadcrumbList, Organization, LocalBusiness) matching visible, truthful page content.
- Do not promise universal indexing. Follow search-engine best practices and submit the deployed sitemap through the relevant webmaster tools.
- Keep real contact and social destinations in `siteConfig`; placeholder URLs must not be used for public calls to action.

## Core Web Vitals, Speed & Animation Architecture

- Prefer Server Components (RSC). Add client components only for genuine browser interaction or state.
- Use `next/image` for production raster imagery with correct dimensions, `sizes`, and accurate `alt`; reserve priority loading for the LCP image only.
- **Zero CLS & Visual Polish:** Every image container must have a fixed aspect ratio box (`aspect-[4/5]`, `aspect-square`) or explicit dimensions to prevent layout shifts (CLS = 0). Use blur placeholders or skeleton pulses during progressive asset load.
- Use `next/font`, reserve media space to prevent layout shift (CLS = 0), and never block the initial render on third-party scripts.
- **Zero-overhead animations:** Prefer native GPU-accelerated CSS transitions, Tailwind utilities, and `tw-animate-css` over heavy runtime client JavaScript animation libraries (e.g. `framer-motion`). Run animations on the compositor thread (transform/opacity) with 0ms JavaScript main thread execution cost.
- Run lint and TypeScript checks after relevant changes. For visual work, check light and dark modes across mobile, tablet, and desktop before handoff.

## Modern Transactional Email Standard

- **React Email (`@react-email/components`):** Build all transactional and operational emails (order confirmations, payment receipts, quotation updates, inquiry notifications, shipping notices) as modular, type-safe React components.
- **No raw HTML string concatenation:** Do not construct raw HTML template strings in server files.
- **Cross-client rendering resilience:** Templates must render flawlessly across Outlook, Apple Mail, mobile Gmail (Android/iOS), and webmail with responsive tables, inline styles, dark mode awareness, and brand-consistent typography.

## Zero-Trust Security, Auth & Pricing Integrity

- **Never trust client payloads for money or inventory:** Prices, subtotal, delivery charges, discounts, and item stock must always be calculated authoritatively from the database on the server (e.g. `order-pricing.ts`). Never accept financial or inventory numbers submitted by the browser.
- **Strict Zod validation:** Validate all input payloads in Server Actions and API Routes with Zod schemas before database execution or external service calls.
- **Cryptographic role verification (`withAdminAuth`):** Every administrative mutation or query must verify the user's cryptographic session cookie and admin role on the server, never relying solely on client-side route guards.
- **Secrets hygiene:** Server secrets (`SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, `RESEND_API_KEY`) must never have `NEXT_PUBLIC_` prefixes or leak into client bundles. Public endpoints must be rate-limited via Upstash Redis.

## Accessibility (WCAG 2.1 AA) & Mutation UX

- **Screen reader & keyboard accessibility:** All icon-only buttons must have descriptive `aria-label` attributes. Decorative icons must have `aria-hidden="true"`. All modals, sheets, and drawers must trap focus while open and close on <kbd>Escape</kbd>. Every form input must be associated with a `<Label htmlFor="...">`.
- **In-flight mutation protection:** Every form submit button must be disabled during active submission and render a loading spinner (`<Loader2 className="animate-spin" />`) to prevent double-charges or duplicate submissions.
- **Actionable user feedback (`sonner`):** Every mutation (cart changes, wishlist toggles, commission submissions, profile updates) must provide immediate toast feedback with actionable error guidance on failure.

## Code Organization, Centralized Constants & Continuous Pruning

- **Continuous pruning of unused code:** Proactively identify and eliminate dead files, orphaned exports, unreferenced dependencies, and unused variables. Never leave dead code, commented-out blocks, or abandoned files in the project tree.
- **Strict use of centralized constants:** Every fixed rate, limit, threshold, status union, and configuration setting must live in dedicated constants (`@/config/constants`, `@/config/site`, `@/config/navigation`) as a single source of truth. Never hardcode magic numbers or strings inline.
- **Shared components over repetition:** Whenever a UI pattern, form group, modal, or layout structure appears across two or more screens (e.g. phone inputs, address modals, status badges), extract and reuse a single shared component.
- **Centralized mappers & formatters:** Database row normalization (`mapArtwork`, `mapOrder`, `mapCustomOrder`, `mapInquiry`), slug generation (`generateSlug`), currency/rupee formatters (`formatPrice`, `formatRupees`), and status badge helpers must be imported from centralized helper modules, never re-implemented inline.
- **Centralized hooks & hydration safety:** Reusable browser state patterns (client mounting / hydration, cross-tab synchronization via storage events, OTP resend cooldown timers) must be defined as shared custom hooks (`useMounted`, `useCooldownTimer`). Never trigger cascading renders via raw `useEffect` hydration state.

## Agent Workflow Rules
- ALWAYS go in plan mode first. Discuss the proposed solution with the user and get approval BEFORE implementing any code changes.
- ALWAYS choose consistency: match the style, format, and design conventions of existing pages (e.g. hero sections, search bars, component layouts) when building new features.
- ALWAYS verify compilation after every change: run TypeScript checks (`tsc --noEmit`) and compilation checks. If it is not compiling, it is NOT done.
- ALWAYS conduct a rigorous post-change audit: after each change, proactively identify bugs, identify what is not working or what won't work (edge cases, failure modes, regressions across devices/tabs), and identify if and how anything can be improved.
- ALWAYS check for impacted components and outdated information: whenever making changes, check all impacted components, consumers, and references across the codebase; identify any outdated information or broken assumptions, and proactively suggest or apply the required edits.
- ALWAYS prune and deduplicate: actively remove unused code and replace repeated patterns with shared constants, helpers, and components on every task.
- "fatal: .git/index: index file smaller than expected this error should never appear" — ensure git operations preserve index integrity and never leave a corrupted .git/index file.



