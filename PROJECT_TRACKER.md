# 🎯 Anjori Arts — Master Project Tracker

> **Status:** Pre-Launch Hardening  
> **Launch Readiness:** **88%**  
> **Last Updated:** September 2026  
> **Architecture:** Next.js 16 (App Router) + Supabase (PostgreSQL / Auth) + Vercel + Cloudflare + Resend  

---

## 📊 Launch Readiness Dashboard

| Milestone / Subsystem | Status | Weight | Progress |
| :--- | :---: | :---: | :--- |
| **1. Storefront & Catalog** | 🟢 Complete | 15% | `[████████████████████]` 100% |
| **2. Cart & Razorpay Checkout** | 🟡 Testing Phase | 15% | `[████████████████░░░░]` 80% *(Live key swap pending)* |
| **3. Custom Commissions Workflow** | 🟢 Complete | 15% | `[████████████████████]` 100% |
| **4. User Authentication & Accounts** | 🟢 Complete | 10% | `[████████████████████]` 100% |
| **5. Admin CMS & Order Fulfillment** | 🟢 Complete | 15% | `[████████████████████]` 100% |
| **6. Email & Domain Infrastructure** | 🟢 Complete | 15% | `[████████████████████]` 100% |
| **7. SEO, Analytics & Compliance** | 🟢 Complete | 10% | `[████████████████████]` 100% |
| **Total Project Completion** | 🚀 **Ready for Final Testing** | **100%** | **`[█████████████████░░░]` 88%** |

---

## ✅ 1. Completed Milestones

### 🎨 Storefront & Catalog Browsing
- [x] **Artwork Catalog Grid:** Responsive grid (1 $\rightarrow$ 2 $\rightarrow$ 3 $\rightarrow$ 4 columns) with category, medium, surface, and price filters ([`src/app/shop/page.tsx`](file:///c:/Aditya/Work/Project/anjori-arts/src/app/shop/page.tsx)).
- [x] **Artwork Detail View:** Full-bleed image gallery with touch-swipe gestures for mobile, zoom lightbox, and framed vs unframed preview ([`src/app/artworks/[slug]/page.tsx`](file:///c:/Aditya/Work/Project/anjori-arts/src/app/artworks/%5Bslug%5D/page.tsx)).
- [x] **Art Traditions Directory:** Deep-dive curation pages for Madhubani / Mithila, Tanjore gold leaf, Warli, Mandala, and Cyanotype ([`src/app/categories/page.tsx`](file:///c:/Aditya/Work/Project/anjori-arts/src/app/categories/page.tsx)).
- [x] **Collector Stories Gallery:** Customer room photos and approved testimonials showcase ([`src/app/stories/page.tsx`](file:///c:/Aditya/Work/Project/anjori-arts/src/app/stories/page.tsx)).
- [x] **Responsive Mobile Navigation:** Touch-friendly drawer navigation with active route highlights, cart/wishlist counters, and smooth spring physics ([`src/components/layout/navbar/MobileDrawer.tsx`](file:///c:/Aditya/Work/Project/anjori-arts/src/components/layout/navbar/MobileDrawer.tsx)).
- [x] **Theme System:** Fully tokenized warm parchment light mode (`#FAF7F0`) and deep gallery dark mode (`#1A1918`) ([`src/app/globals.css`](file:///c:/Aditya/Work/Project/anjori-arts/src/app/globals.css)).

### 🛒 Cart & Razorpay Checkout
- [x] **Zustand Cart Store:** Optimistic cart management with local storage cache and background Supabase synchronization ([`src/stores/cart-store.ts`](file:///c:/Aditya/Work/Project/anjori-arts/src/stores/cart-store.ts)).
- [x] **Server-Side Authoritative Pricing:** Price calculation with tax (GST) and delivery logic calculated securely on the server to prevent client manipulation ([`src/lib/order-pricing.ts`](file:///c:/Aditya/Work/Project/anjori-arts/src/lib/order-pricing.ts)).
- [x] **Razorpay SDK Integration:** Order creation, modal invocation, and HMAC-SHA256 signature verification server actions ([`src/actions/razorpay.ts`](file:///c:/Aditya/Work/Project/anjori-arts/src/actions/razorpay.ts)).
- [x] **Order Receipt Page:** Clean, printable receipt with order reference code, items breakdown, and courier tracking badge ([`src/components/orders/OrderSuccessReceipt.tsx`](file:///c:/Aditya/Work/Project/anjori-arts/src/components/orders/OrderSuccessReceipt.tsx)).
- [x] **Idempotent Payment Webhook:** Asynchronous payment capture safety net ([`src/app/api/webhooks/razorpay/route.ts`](file:///c:/Aditya/Work/Project/anjori-arts/src/app/api/webhooks/razorpay/route.ts)).

### 🖌️ Bespoke Commissions (Custom Orders)
- [x] **Multi-Step Commission Form:** Step-by-step form capturing theme, preferred medium, surface, dimensions, budget, and reference images ([`src/app/custom-order/page.tsx`](file:///c:/Aditya/Work/Project/anjori-arts/src/app/custom-order/page.tsx)).
- [x] **Client-Side Image Cropping & Compression:** Fast image uploads directly to Cloudinary with secure server signatures ([`src/lib/cloudinary-server.ts`](file:///c:/Aditya/Work/Project/anjori-arts/src/lib/cloudinary-server.ts)).
- [x] **Admin Custom Order CMS:** Dashboard view to review incoming commissions, calculate material costs, and generate formal quotations ([`src/app/admin/custom-orders/`](file:///c:/Aditya/Work/Project/anjori-arts/src/app/admin/custom-orders/)).

### 👤 User Account & Authentication
- [x] **Supabase Authentication:** Secure email/password login, registration, recovery token exchange, and session refresh middleware ([`src/actions/auth.ts`](file:///c:/Aditya/Work/Project/anjori-arts/src/actions/auth.ts), [`src/proxy.ts`](file:///c:/Aditya/Work/Project/anjori-arts/src/proxy.ts)).
- [x] **Password Recovery Flow:** Custom branded forgot-password and reset-password experience ([`src/app/(auth)/forgot-password/page.tsx`](file:///c:/Aditya/Work/Project/anjori-arts/src/app/(auth)/forgot-password/page.tsx)).
- [x] **Address Book:** Multi-address management with default billing/shipping address selection ([`src/app/account/addresses/page.tsx`](file:///c:/Aditya/Work/Project/anjori-arts/src/app/account/addresses/page.tsx)).
- [x] **Collector Wishlist:** Instant save-for-later functionality synced with database profiles ([`src/stores/wishlist-store.ts`](file:///c:/Aditya/Work/Project/anjori-arts/src/stores/wishlist-store.ts)).
- [x] **Order History:** Authenticated user order history with live status tracking ([`src/app/account/orders/page.tsx`](file:///c:/Aditya/Work/Project/anjori-arts/src/app/account/orders/page.tsx)).

### 🛡️ Admin CMS & Operations
- [x] **Role-Based Access Control:** Secure `ADMIN` verification wrapper (`withAdminAuth`) preventing unauthorized database mutations ([`src/lib/auth-admin.ts`](file:///c:/Aditya/Work/Project/anjori-arts/src/lib/auth-admin.ts)).
- [x] **Artwork Catalog CMS:** Create, edit, feature, and soft-delete artworks and dimension variants ([`src/app/admin/artworks/`](file:///c:/Aditya/Work/Project/anjori-arts/src/app/admin/artworks/)).
- [x] **Order Fulfillment:** Update order statuses (`placed`, `framing`, `dispatched`, `delivered`) and assign courier tracking links ([`src/app/admin/orders/`](file:///c:/Aditya/Work/Project/anjori-arts/src/app/admin/orders/)).
- [x] **Customer Inquiry CRM:** Triage public inquiries and record internal notes ([`src/app/admin/inquiries/`](file:///c:/Aditya/Work/Project/anjori-arts/src/app/admin/inquiries/)).
- [x] **Testimonial Moderation:** Review and approve collector room stories and display ordering ([`src/app/admin/testimonials/`](file:///c:/Aditya/Work/Project/anjori-arts/src/app/admin/testimonials/)).

### 📧 Email, DNS & Domain Infrastructure
- [x] **Cloudflare DNS Authority:** Nameservers pointed to `imani.ns.cloudflare.com` and `valentin.ns.cloudflare.com`.
- [x] **Cloudflare Inbound Email Routing:** Catch-all rule configured so all `@anjoriarts.com` emails (`support@`, `orders@`, `admin@`, etc.) instantly forward to `anjoriarts@gmail.com`.
- [x] **Resend Outbound Transactional Emails:** DKIM and SPF authenticated on `resend._domainkey.anjoriarts.com`.
- [x] **Interactive Reply-To Action Buttons:** Styled "✉️ Reply to Orders / Support" buttons embedded directly in email templates ([`src/lib/email.ts`](file:///c:/Aditya/Work/Project/anjori-arts/src/lib/email.ts)).
- [x] **Gmail Sender Aliases:** Configured Gmail "Send mail as" via Resend SMTP so the owner can reply as `support@anjoriarts.com`.
- [x] **Branded Auth Templates:** Beautifully styled HTML templates for signup confirmation, magic links, and password resets ([`docs/SUPABASE_EMAIL_TEMPLATES.md`](file:///c:/Aditya/Work/Project/anjori-arts/docs/SUPABASE_EMAIL_TEMPLATES.md)).

### 🔍 SEO, Legal & Compliance
- [x] **Dynamic Sitemap & Robots:** Automatic XML sitemap generator matching indexable canonical routes ([`src/app/sitemap.ts`](file:///c:/Aditya/Work/Project/anjori-arts/src/app/sitemap.ts), [`src/app/robots.ts`](file:///c:/Aditya/Work/Project/anjori-arts/src/app/robots.ts)).
- [x] **JSON-LD Structured Data:** Schema.org `ArtGallery` and `Product` schemas on homepage and artwork detail pages.
- [x] **Open Graph & Twitter Cards:** Dynamic social sharing banners generated via Sharp.
- [x] **Legal Compliance Suite:** Dedicated, verified policy pages for Terms & Conditions, Privacy Policy, Returns & Refund Policy, Shipping Policy, Artwork Care, and FAQs ([`src/app/(legal)/`](file:///c:/Aditya/Work/Project/anjori-arts/src/app/(legal)/)).

---

## ⏳ 2. Pre-Launch Punchlist (What Is Left To Do)

These items must be performed before announcing the site to the public and processing real customer transactions:

### 🔴 Critical (Must Complete Before First Real Customer)
- [ ] **1. Copy Updated Password Reset Template to Supabase:**
  - Copy Section 3.2 from [`docs/SUPABASE_EMAIL_TEMPLATES.md`](file:///c:/Aditya/Work/Project/anjori-arts/docs/SUPABASE_EMAIL_TEMPLATES.md) and paste it into **Supabase Dashboard $\rightarrow$ Authentication $\rightarrow$ Email Templates $\rightarrow$ Reset Password**.
- [ ] **2. Razorpay Live Mode Activation:**
  - Complete business KYC verification in the [Razorpay Dashboard](https://dashboard.razorpay.com).
  - Generate Live API keys (`rzp_live_...`).
  - Add `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` to Vercel Environment Variables.
- [ ] **3. Live End-to-End Test Transaction:**
  - Create a test artwork priced at ₹1.
  - Complete a real checkout payment using UPI or NetBanking on a live mobile device.
  - Verify that:
    1. Razorpay webhook fires and updates order status to `confirmed`.
    2. Customer confirmation email is received with the order receipt.
    3. Admin alert email lands in `anjoriarts@gmail.com`.
    4. Stock quantity decrements automatically.
- [ ] **4. Google Search Console Sitemap Submission:**
  - Open Google Search Console for `anjoriarts.com`.
  - Submit sitemap URL: `https://www.anjoriarts.com/sitemap.xml`.
  - Request indexing on high-priority landing pages (Home, Shop, Categories).

### 🟡 Operational & Content Readiness
- [ ] **5. Inventory & Artwork Photography Population:**
  - Upload real, high-resolution original paintings via the Admin CMS (`/admin/artworks/new`).
  - Verify exact dimensions (height $\times$ width in inches and cm) and pricing.
- [ ] **6. Courier Delivery Tie-Ups:**
  - Finalize packing material (museum-grade bubble wrap, rigid wooden crating for large canvases).
  - Register accounts with domestic art-safe couriers (BlueDart Apex / Delhivery Direct).
- [ ] **7. Verify WhatsApp Click-to-Chat on Live Mobile:**
  - Tap the floating WhatsApp button from an iPhone and Android to verify it opens WhatsApp with the pre-filled inquiry text.

---

## 🚀 3. Post-Launch Roadmap (Phase 2 & Phase 3)

Features and optimizations planned after initial customer validation:

### Phase 2: Post-Launch Growth
- [ ] **Automated Customer Review Trigger:** Automated email sent 7 days after delivery asking for a room photo story.
- [ ] **Courier API Tracking Sync:** Integrate Shiprocket or Delhivery webhook to auto-update order status from `dispatched` to `delivered`.
- [ ] **Newsletter Lead Magnet:** "Guide to Collecting Indian Heritage Art" PDF download upon newsletter subscription.
- [ ] **Discount & Promo Engine:** Voucher codes (`WELCOME10`, `FESTIVE15`) with minimum cart thresholds and expiration dates.

### Phase 3: Scaling & International
- [ ] **International Shipping & Multi-Currency:** USD ($) / EUR (€) currency toggle with international courier calculation (DHL Express).
- [ ] **Corporate Art Consultation Portal:** Dedicated B2B inquiry flow for hotels, interior designers, and corporate offices.
- [ ] **AR Living Space Visualizer:** Augmented reality preview to project paintings onto customer walls via mobile camera.

---

## 🔐 4. Operational Directory & Resource Mapping

| Resource | Value / Location | Notes |
| :--- | :--- | :--- |
| **Primary Domain** | `https://www.anjoriarts.com` | Production website hosted on Vercel |
| **DNS Manager** | Cloudflare (`imani...`, `valentin...`) | Manages DNS records & email routing |
| **Support Email** | `support@anjoriarts.com` | Forwards to `anjoriarts@gmail.com` |
| **Orders Email** | `orders@anjoriarts.com` | Configured as `replyTo` on receipts |
| **Admin Dashboard** | `https://www.anjoriarts.com/admin` | Restricted to `ADMIN` profile role |
| **Media CDN** | Cloudinary (`anjori-arts` cloud) | Auto-compressed WebP/AVIF delivery |
| **Error Monitoring** | Sentry (`anjori-arts` org) | Automatic exception & performance alerts |

