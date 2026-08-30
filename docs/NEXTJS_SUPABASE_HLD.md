# Anjori Arts — Next.js + Supabase High-Level Design

> **Status:** Proposed architecture for a new build  
> **Audience:** Anjori Arts owner and implementation team  
> **Goal:** A secure, low-maintenance online art shop that the owner can operate through a simple admin area.

---

## 1. Decision summary

Use one **Next.js** application for the customer storefront, the private admin dashboard, and small server-side endpoints. Use **Supabase** for PostgreSQL, customer authentication, access rules, and private file storage. Use **Cloudinary** for public artwork images and **Razorpay** for payments.

```text
Customer / Admin browser
          |
          v
Next.js application
  | storefront and admin pages
  | protected server routes
  | Razorpay payment verification
          |
          +------------------+-------------------+
          v                  v                   v
   Supabase Auth       Supabase Postgres    Razorpay
   Supabase Storage    (data + security)    (payment gateway)
          |
          v
      Cloudinary
   (public art images)
```

### Why Next.js

Next.js is a good fit because it keeps the public website, owner-facing admin interface, and secure payment logic in one codebase. Node.js runs underneath Next.js, but routine shop operation does **not** require the owner to know Node.js: normal work happens in `/admin`.

This HLD is for a fresh implementation. It does not require migrating the current React + Spring Boot system.

### Frontend styling

Use **TypeScript**, the Next.js App Router, and **Tailwind CSS**. Tailwind is a good fit because it keeps responsive styling, spacing, colour tokens, and component variants close to the interface while avoiding a large custom CSS codebase. It does not determine the visual style: the site will use a deliberately designed Anjori Arts palette, typography, image treatments, and reusable UI components rather than a generic template.

Use accessible, well-tested interaction primitives (for example, dialogs, menus, and select controls) where needed. Tailwind handles the styling; it is not a replacement for accessibility or the admin/business logic.

## 2. Visual design direction

### Creative direction: contemporary Indian art gallery

The website should feel like stepping into a calm, carefully curated art gallery: warm, confident, tactile, and personal. The artwork is the colour and visual centre of the page. The interface should recede around it.

Keep the current site's elegant serif-led character and the focus on Madhubani, Mandala, and commissions. Change the generic app-like parts: bright purple gradients, colourful floating blobs, repeated icon cards, very rounded rectangles, and a public dark theme. These compete with the paintings and make the presentation feel less premium.

### Visual rules

| Element | Direction |
|---|---|
| Background | Warm paper/ivory, not cold white or grey: `#FCF8F2`. Use subtle grain only if it does not affect readability or performance. |
| Text | Deep warm charcoal: `#27211D`, rather than pure black. |
| Brand colours | Earthy terracotta `#A94E36` for primary actions and links; muted marigold `#C98228` only for small highlights; leaf `#53664A` for a restrained supporting accent. |
| Typography | Retain an editorial serif for headings (the current Playfair Display is suitable). Replace the rounded Poppins body text with a quieter sans-serif such as Inter or Source Sans 3. |
| Artwork | Large, unmasked images with truthful aspect ratios. Never crop an artwork aggressively merely to make every card identical. |
| Surface treatment | Fine warm-grey borders, very soft shadows, square-to-gently-rounded corners (4–8px), generous whitespace. |
| Pattern | If used, create a restrained line motif from Anjori Arts' own artwork details. Do not use generic “ethnic” stock patterns as decoration. |
| Motion | Quiet fade/slide transitions and image hover zooms only. Respect reduced-motion preferences; no continuous decorative animation. |

The public storefront is light-first. Artwork colours reproduce more faithfully on the paper background. A separate dark theme may remain available for the owner/admin workspace later, where it has a practical benefit.

### Storefront composition

```text
Announcement / shipping strip
Simple header: wordmark | Shop | Collections | Commissions | About | Bag

Hero: one exceptional artwork or artist-at-work photograph
      short, confident statement + “Explore the collection”

Curated collection links: Madhubani / Mandala / Originals / Commissions

Featured artworks: spacious editorial grid, image first, minimal metadata

Artist story: photograph, process, heritage and materials

Commission invitation: clear process, timeline and enquiry CTA

Selected testimonials / press / Instagram only when genuine
Newsletter and quiet, useful footer
```

The home page should not lead with unsupported statistics, placeholder testimonials, or several competing calls to action. At launch, each section must earn its place by helping a visitor understand the art, trust the artist, or make a purchase.

### Key page behaviour

| Page | Look and priority |
|---|---|
| Shop | Calm gallery grid, filters kept compact, strong image-to-text ratio, clear availability and price. |
| Artwork detail | Two-column desktop layout: image gallery first, then title, medium, dimensions, story, price, availability, delivery/returns, and one clear purchase action. |
| Commission | Editorial storytelling with a short guided form. Show a transparent four-step process and a portfolio of relevant past work. |
| Cart / checkout | Clean and utilitarian. Remove decorative effects, make totals and delivery information unmistakable, and use Razorpay only at the payment step. |
| Admin | Functional dashboard with dense data tables/forms; it need not use the storefront's gallery styling. |

### Responsive priorities

- Mobile is the primary browsing experience: artwork cards use one or two columns without tiny text, filters open in a sheet, and the purchase action stays obvious.
- Images load in responsive sizes through Cloudinary; the initial hero image must be prioritised and compressed.
- Use real photographs/artwork early in the design process. Placeholder gradients or icon illustrations cannot validate an art-commerce layout.

## 3. Scope

### Included in version 1

- Public portfolio, shop, artwork-detail, about, FAQ, policy, contact, and custom-order pages.
- Cart and guest checkout.
- Customer signup/sign-in and account pages.
- Razorpay checkout, server-side signature verification, and payment/order records.
- Owner-only admin pages for artworks, inventory, orders, coupons, customers, testimonials, and custom requests.
- Artwork image uploads and private customer reference-image uploads.
- Transactional email for customer account and order updates.

### Deferred until there is a real need

- Marketplace/multi-vendor features.
- Multiple staff roles beyond a single owner/admin.
- Native mobile apps.
- Full CMS/blog editing system (Sanity).
- A separate backend service or database provider.

## 4. Main components

| Component | Responsibility | Owner interaction |
|---|---|---|
| Next.js app | Renders the shop and admin dashboard; runs protected server routes. | Uses it in a browser. |
| Supabase Auth | Signup, login, password reset, sessions, optional Google login. | Customer-facing; owner only configures it once. |
| Supabase Postgres | Holds products, orders, customer profiles, discounts, and other structured data. | Managed through the custom admin pages, not raw SQL. |
| Cloudinary | Stores and optimises public product, gallery, and portfolio images. | The admin upload flow handles it automatically. |
| Supabase Storage | Holds private customer reference images and future invoices/documents. | Uploads from the custom-order/admin form. |
| Razorpay | Accepts UPI/cards/etc. and sends payment confirmations. | Owner uses Razorpay Dashboard for settlements/refunds. |
| Email provider | Sends order confirmations and account emails. | Owner sees replies in business email. |

## 5. User roles and access

| Role | Can do |
|---|---|
| Visitor | Browse published artworks and submit a contact/custom-order request. |
| Customer | Manage their profile and addresses; view only their own orders, reviews, wishlist, and custom requests. |
| Admin | Manage all shop records, content, inventory, orders, coupons, and fulfilment. |

`profiles` contains the user profile and `user_roles` holds the role assignment. The admin role is assigned only through a secure server-side process; a browser must never be able to make itself admin.

Supabase Row Level Security (RLS) enforces this in the database. For example, an authenticated customer can read an `orders` row only when its `customer_id` matches their authenticated user ID. Admin operations are made through authenticated Next.js server routes that check the role before using privileged access.

## 6. Data model (high level)

| Area | Primary tables |
|---|---|
| Identity | `profiles`, `user_roles`, `addresses` |
| Catalogue | `artworks`, `artwork_images`, `categories`, `collections`, `inventory_movements` |
| Commerce | `carts`, `cart_items`, `orders`, `order_items`, `payments`, `coupons`, `coupon_redemptions` |
| Customer service | `custom_orders`, `custom_order_images`, `reviews`, `testimonials`, `newsletter_subscribers` |
| Operations | `order_status_history`, `audit_log` |

Every monetary amount is stored in integer paise, not decimal floating-point values. `order_items` saves a snapshot of the artwork title, image, and selling price at purchase time, so a later product edit cannot alter an old order.

## 7. Critical flows

### Product publishing

```text
Admin signs in → creates/edits artwork in /admin
→ uploads images to the public product-images bucket
→ Next.js validates input and writes catalogue data to Supabase
→ artwork becomes visible only when status = published
```

### Checkout and payment

```text
Customer submits checkout
→ Next.js server recalculates price, stock and coupon validity from the database
→ creates a pending order and Razorpay order
→ browser opens Razorpay Checkout
→ Razorpay sends payment result/webhook
→ Next.js verifies Razorpay signature and webhook
→ payment marked paid; order moves to confirmed; confirmation email is sent
```

The browser never supplies the final amount, declares an order paid, or sees Razorpay secret keys. The webhook is the authoritative payment confirmation; the return page is only a customer-facing status page.

### Custom order request

```text
Visitor/customer fills custom-order form
→ optional reference image goes to private custom-reference bucket
→ request record is created
→ admin reviews request in /admin and sends quote/status update
→ customer pays through a Razorpay order or payment link
```

## 8. Storage design

| Bucket | Visibility | Contents |
|---|---|---|
| `custom-references` | Private | Customer reference images; visible only to its owner and admin. |
| `order-documents` | Private | Invoices or shipping documents, if added later. |

Public artwork, gallery, and brand images are stored in Cloudinary. The database stores each image's Cloudinary `public_id`, alt text, display order, and dimensions—not a copied file or a fragile generated URL. Cloudinary creates and delivers the appropriately sized/optimised image for each screen.

Supabase Storage is reserved for private files. Upload validation restricts file types and size, and signed URLs grant time-limited access when a customer or admin needs to view a private file. Product images must not be duplicated in Supabase Storage.

## 9. Security boundaries

- The browser receives only Supabase’s publishable key. RLS remains enabled on every exposed table and Storage policy.
- `SUPABASE_SERVICE_ROLE_KEY`, Razorpay key secret, webhook secret, and email credentials are server-only environment variables. They are never placed in client code or Git.
- Cloudinary upload credentials are server-only. The browser uploads through a short-lived signed-upload flow; it must not receive Cloudinary's API secret.
- Razorpay orders are created only from Next.js server routes after server-side validation of prices and stock.
- Every Razorpay webhook is signature-verified and processed idempotently, so retries cannot duplicate an order confirmation.
- Admin routes require a valid session and an admin-role check on the server.
- Use HTTPS, a restrictive Content Security Policy, rate limits for login/contact/checkout endpoints, and audit logs for sensitive admin actions.
- Back up the production database and periodically test a restore procedure before depending on it for live orders.

## 10. Environments and deployment

Start with the lowest-complexity safe arrangement:

```text
Developer laptop: local Next.js + local Supabase data (test users/data only)
                         |
                         v
Production: hosted Next.js + one production Supabase project + live Razorpay
```

Production credentials are separate from local/test credentials. Use Razorpay Test Mode locally and Razorpay Live Mode only in production.

When the shop needs more frequent change/testing, create a remote staging environment (a second Supabase project or a persistent Supabase branch) with separate keys and fake data. Do not place real customer or order data in development. Database schema changes are recorded as versioned migrations in the Git repository and applied to production only after testing.

## 11. Recommended implementation order

1. Create the Next.js project, design system, public pages, and Supabase schema/RLS policies.
2. Deliver owner login and the artwork/category admin pages.
3. Add catalogue, product detail, cart, customer login, and account pages.
4. Add checkout with Razorpay test payments and webhook verification.
5. Add order management, custom orders, emails, policies, analytics, and production hardening.
6. Test on mobile, accessibility, security permissions, payment failures, duplicate webhooks, stock limits, and order emails before launch.

## 12. Success criteria

- The owner can add a new artwork, image, price, availability, and description from `/admin` without code changes.
- A customer can browse, pay securely, and see only their own orders.
- A payment cannot mark an order paid unless Razorpay has been server-side verified.
- Development changes cannot alter live customer/order data.
- The live site can run without a separate Java backend, separate CMS, or separate database account.

## 13. Assumptions to confirm before implementation

- India-first sales and INR pricing.
- A single artist/owner is the only administrator at launch.
- Physical-art inventory is normally one unit per original artwork; prints or made-to-order items may use a larger stock count.
- Shipping labels and GST invoicing are handled manually at launch unless a provider is selected later.
