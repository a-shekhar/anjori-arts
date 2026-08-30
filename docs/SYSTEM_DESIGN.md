# Anjori Arts - System Design

> **Version:** 1.7.0  
> **Last Updated:** March 8, 2026  
> **Status:** Development  
> **Audience:** Managers, Stakeholders

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Goals & Metrics](#2-goals--metrics)
3. [Architecture Overview](#3-architecture-overview)
4. [Features & Status](#4-features--status)
5. [User Flows](#5-user-flows)
6. [Development Phases](#6-development-phases)
7. [Cost Summary](#7-cost-summary)
8. [Version History](#8-version-history)
9. [Email System](#9-email-system)
10. [Future Roadmap](#10-future-roadmap)

---

## 1. Project Overview

### What is Anjori Arts?

Anjori Arts is a **handmade art e-commerce platform** for a single artist to:
- Sell original Madhubani, Mandala, and custom paintings
- Accept custom art commission requests
- Showcase portfolio and build credibility

### Why are we building this?

| Problem | Solution |
|---------|----------|
| Artist sells via Instagram DMs | Professional website with cart & checkout |
| No systematic order tracking | Order management dashboard |
| Custom orders handled manually | Structured commission request form |
| No credibility for new buyers | Portfolio, testimonials, about section |

### Who is this for?

| User Type | Description |
|-----------|-------------|
| **Buyers** | Art lovers in India looking for handmade paintings |
| **Artist** | Single artist managing inventory & orders |
| **Admin** | Artist as admin managing the platform |

### Artist Background (Jyotsna Sharma)

| Aspect | Details |
|--------|---------|
| **Heritage** | Rooted in Mithila artistic traditions |
| **Positioning** | Professional artist (avoid student/learning narrative for credibility) |
| **Work Experience** | The Leth (hand-painted luxury clothing), Urban Pots (furniture painting) |
| **Exhibitions** | VRIKSHAH Group Art Exhibition (Pondicherry, Aug 2025) |
| **Notable Works** | "Vrikshangi" (Chipko Movement tribute), "Amariya" (Mango Tree in Madhubani) |
| **Art Forms** | Madhubani, Tanjore, Warli, Mandala, Mythological, Contemporary, Portraiture, Figurative, Abstract |
| **Services** | Art Branding, Logo Design, Poster Design, Photography, Cyanotype Prints, Custom Art |
| **Links** | [The Leth](https://theleth.in/), [Urban Pots](https://instagram.com/urbanpots.in/) |

**Note:** For sales credibility, avoid mentioning: student status, BFA degree, D Pharma background, grandmother stories, COVID discovery narrative.

---

## 2. Goals & Metrics

### Business Goals

- **Primary:** Generate revenue through artwork sales
- **Secondary:** Accept custom art commissions
- **Tertiary:** Build brand credibility and portfolio

### Target Metrics (Year 1)

| Metric | Target |
|--------|--------|
| Monthly Visitors | 100 |
| Monthly Orders | 10 |
| Average Order Value | ₹2,000 |
| Conversion Rate | 10% |
| Return Customer Rate | 20% |

### Success Criteria

- [ ] Website loads under 3 seconds
- [ ] Complete purchase in under 5 minutes
- [ ] Mobile-friendly on all pages
- [ ] Zero downtime during business hours
- [ ] Admin can manage artworks without developer help

---

## 3. Architecture Overview

### High-Level View

```
┌──────────────────────────────────────────────────────────────┐
│                         USERS                                 │
│    Buyers (Browse, Purchase) │ Admin (Manage Artworks)       │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE CDN                            │
│              (Security, Caching, Performance)                │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                      APPLICATION                             │
│  ┌────────────────────┐    ┌────────────────────┐           │
│  │   React Frontend   │    │  Spring Boot API   │           │
│  │   (User Interface) │───►│  (Business Logic)  │           │
│  └────────────────────┘    └────────────────────┘           │
└──────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
       ┌──────────┐    ┌──────────┐    ┌──────────┐
       │PostgreSQL│    │Cloudinary│    │ Razorpay │
       │(Database)│    │ (Images) │    │(Payments)│
       └──────────┘    └──────────┘    └──────────┘
```

### Technology Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 7, Tailwind CSS 4 |
| Backend | Spring Boot 4.0.3, Java 21 |
| Database | PostgreSQL (Neon hosted) |
| Auth | JWT with Refresh Tokens |
| Phone OTP | 2Factor (₹0.165/SMS) |
| Images | Cloudinary CDN |
| Payments | Razorpay (2% fee) |
| Email Receiving | Cloudflare Email Routing (FREE) |
| Email Sending | Resend (3,000/month FREE) |
| WhatsApp | Business App (FREE) → Interakt when scaling |
| Hosting | Google Cloud Run |
| CDN | Cloudflare |

> **Note:** Information in this document is based on pricing/features as of March 2026. Always verify current pricing before implementation as services frequently change their offerings (e.g., Zoho Mail removed free tier in 2024).

---

## 4. Features & Status

### Status Legend
- ✅ Complete
- 🟡 In Progress
- 🔴 Not Started

### Public Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Shop Page** | Browse artworks with filters | 🔴 |
| **Product Detail** | View artwork, select size, add to cart | 🔴 |
| **Shopping Cart** | Manage items, view total | 🔴 |
| **Guest Checkout** | Buy without creating account | 🔴 |
| **User Checkout** | Buy with saved addresses | 🔴 |
| **Order Tracking** | Track order status | 🔴 |
| **Custom Orders** | Request art commissions | 🔴 |
| **Gallery** | Portfolio showcase | 🔴 |
| **About Page** | Artist story | 🔴 |
| **Newsletter** | Subscribe for new artwork updates | 🔴 |
| **Reviews Display** | View customer reviews with photos | 🔴 |

### User Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Login/Signup** | Email + password authentication | 🔴 |
| **Social Login** | Google OAuth2 | 🔴 |
| **User Profile** | Manage account details | 🔴 |
| **Address Book** | Save shipping addresses | 🔴 |
| **Order History** | View past orders | 🔴 |
| **Wishlist** | Save artworks for later | 🔴 |
| **Submit Reviews** | Rate & review purchased artworks with photos | 🔴 |
| **Request Returns** | Request return for eligible orders | 🔴 |
| **Apply Coupons** | Use discount codes at checkout | 🔴 |

### Admin Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Dashboard** | Overview stats, recent orders | 🔴 |
| **Artwork CRUD** | Create, edit, delete artworks | 🔴 |
| **Order Management** | View & update order status | 🔴 |
| **Custom Order Management** | Handle commission requests | 🔴 |
| **Coupon Management** | Create & manage discount codes | 🔴 |
| **Review Moderation** | Approve/reject customer reviews | 🔴 |
| **Return Processing** | Handle return requests | 🔴 |
| **GST Invoice** | Auto-generate GST invoices | 🔴 |
| **Newsletter** | View subscribers (send via Resend) | 🔴 |

### Integrations

| Integration | Purpose | Status |
|-------------|---------|--------|
| Cloudinary | Image storage & CDN | 🔴 |
| Razorpay | Payment processing (2% fee) | 🔴 |
| Cloudflare Email Routing | Receive emails (FREE) | 🔴 |
| Resend | Send transactional emails (FREE tier) | 🔴 |
| 2Factor | Phone OTP verification (₹0.165/SMS) | 🔴 |
| WhatsApp Business App | Manual order updates (FREE) | 🔴 |
| Interakt/AiSensy | WhatsApp API (when scaling) | 🔴 |
| Google Analytics | Visitor tracking | 🔴 |

---

## 5. User Flows

### Purchase Flow (Guest)

```
Home → Shop → Product → Add to Cart → Verify Phone (OTP) → Shipping Address 
    → Select Payment Type → Pay → Confirmation
```

### Purchase Flow (Logged In)

```
Login → Shop → Product → Add to Cart → Verify Phone (if not verified)
    → Select Address → Select Payment Type → Pay → Confirmation
```

### Payment Options by Order Type

| Order Type | Payment Options |
|------------|-----------------|
| Regular artwork | Full Prepaid OR 30% Advance + COD |
| Custom order | Full Prepaid only (no COD) |

**Why no COD for custom orders?**
Custom/personalized artworks cannot be resold if buyer refuses delivery.

### Phone Verification Flow

```
Enter Phone (+91) → Send OTP → Enter 6-digit OTP → Verified ✓
                      ↓
              (Max 3 OTPs per 10 min)
              (Max 5 verify attempts per OTP)
              (OTP expires in 5 min)
```

### Custom Order Flow

```
Custom Order Page → Fill Form → Verify Phone (OTP) → Upload Reference 
    → Submit → Email Confirmation
            → Admin Reviews
            → Quote Sent (email + SMS)
            → Customer Accepts
            → Full Payment Required (no COD)
            → Work Begins
```

### Admin Order Flow

```
Dashboard → Orders List → View Order → Update Status → Customer Notified
```

### Review Flow

```
Order Delivered → Email: "Review your purchase" → User submits review + photos
    → Admin approves → Review visible on product page
```

### Coupon Flow

```
Admin creates coupon (code, discount, validity) 
    → User enters code at checkout → System validates → Discount applied
```

### Return Flow

```
Order Delivered → User requests return (within 5 days for regular)
    → Admin reviews → Approved/Rejected
    → If approved: User ships back → Admin receives → Refund processed
```

**Return Policy:**
| Order Type | Damaged | Within 5 Days | After 5 Days |
|------------|---------|---------------|--------------|
| Regular | ✅ Return | ✅ Return | ❌ No return |
| Custom | ✅ Return | ❌ No return | ❌ No return |

### Newsletter Flow

```
User enters email → Subscribed → Receives updates on new artworks
    → Can unsubscribe anytime via link in email OR in user settings
```

### Shipping & Discount Policy

#### Shipping Rates

| Order Value | Shipping | Delivery Time |
|-------------|----------|---------------|
| Below ₹1,999 | ₹99 flat | 5-7 business days |
| ₹1,999 and above | **FREE** | 5-7 business days |
| Express (any value) | +₹249 | 2-3 business days |

**Shipping Partners:** India Post, DTDC, Delhivery, BlueDart (based on location and artwork size)

#### GST & Pricing

| Item | GST Rate | HSN Code | Notes |
|------|----------|----------|-------|
| Original Paintings | 12% | 9701 | Handmade artworks |
| Art Prints | 12% | 4911 | Printed reproductions |
| Custom Artworks | 12% | 9701 | Commission work |

**GST Registration Strategy (Phased Approach):**

| Phase | Turnover | GST Status | Invoice Type |
|-------|----------|------------|--------------|
| **Phase 1** | ₹0 - ₹30L | No GSTIN | Regular invoice (no GST breakup) |
| **Phase 2** | ₹30L+ | Apply for GSTIN | Tax invoice with GST |
| **Phase 3** | ₹40L+ | Mandatory | Monthly GST filing |

**Phase 1 (Launch):**
- Sell through own website without GSTIN (legal for own website, not marketplaces)
- Price artworks inclusively (don't show GST breakup)
- Keep sales records for future registration
- Issue regular invoices (not tax invoices)

**Phase 2 (Scale):**
- Apply for GSTIN when approaching ₹30-40L turnover
- Show GST breakup on invoices
- Start monthly GSTR-1 and GSTR-3B filing

**Pricing Example:**
```
Artwork cost + profit = ₹1,500
Future GST (12%)     = ₹  180  ← Build into price now
Rounded price        = ₹1,699  ← Display price
```

> **Note:** Even without GSTIN, price as if GST is included. This way, prices don't need to change when you register.

#### Payment Terms

| Payment Type | Options |
|--------------|---------|
| Regular Orders | Full Prepaid OR 30% Advance + COD |
| Custom Orders | **Full Prepaid only** (no COD) |
| Payment Mode | **Manual** (Razorpay checkout) |

**Why no COD for custom orders?** Custom/personalized artworks cannot be resold if buyer refuses delivery.

#### First Order Benefits

| Benefit | Details |
|---------|---------|
| Discount Code | `WELCOME10` |
| Discount | 10% off (max ₹500) |
| Shipping | FREE (no minimum) |
| Validity | First order only |

#### Discount Rules

- Only one coupon per order
- Coupons cannot be combined
- First order discount auto-applied for new customers
- Admin can create time-limited promotional coupons

#### Refund Policy

**Regular Orders:**

| Scenario | Refund |
|----------|--------|
| Cancelled before shipping | Full refund within 2-3 business days |
| Cancelled after shipping initiated | Order Amount − Shipping Charge |
| Damaged on arrival | Full refund OR replacement (customer choice) |
| Return within 5 days of delivery | Full refund (artwork must be undamaged) |
| Return after 5 days | No refund |

**Custom Orders:**

| Scenario | Refund |
|----------|--------|
| Cancelled before work starts | Full refund |
| Cancelled after work starts | **Non-refundable** (cannot be resold) |
| Damaged on arrival | Full refund OR replacement |

**Refund Timeline:** 5-7 business days after approval (depends on payment method)

#### Unsubscribe Options

1. **Email link** (required by law) - One-click unsubscribe in every newsletter
2. **User settings** (logged-in users) - Email Preferences toggle

### Content Pages

| Page | Purpose | Status |
|------|---------|--------|
| Home | Landing page with featured artworks | 🔴 |
| Shop | Browse & filter artworks | 🔴 |
| Gallery | Portfolio showcase | 🔴 |
| About | Artist story | 🔴 |
| Custom Orders | Commission request form | 🔴 |
| Contact | Contact form | 🔴 |
| **Artwork Care** | How to maintain & preserve artwork | 🔴 |
| Privacy Policy | Data handling | 🔴 |
| Terms of Service | Legal terms | 🔴 |
| Refund Policy | Return & refund terms | 🔴 |
| Shipping Info | Delivery information | 🔴 |

### WhatsApp Notification Flow

```
Order Placed → WhatsApp: Order confirmation
Order Shipped → WhatsApp: Tracking details
Order Delivered → WhatsApp: Delivery confirmation + review request
```

### GST Invoice Flow

```
Order Paid → System generates invoice (PDF) → Attached to order
    → User can download from Order History → Also sent via email
```

---

## 6. Development Phases

### Phase 1: Core E-commerce 🔴
**Goal:** Working shop where someone can browse and buy

| Task | Status |
|------|--------|
| Project setup (frontend + backend) | 🔴 |
| Database schema | 🔴 |
| Artwork API | 🔴 |
| Shop page with filters | 🔴 |
| Product detail page | 🔴 |
| Cart functionality | 🔴 |
| Guest checkout | 🔴 |
| Admin artwork CRUD | 🔴 |
| Admin orders view | 🔴 |
| Cloudinary integration | 🔴 |

### Phase 2: Authentication & User 🔴
**Goal:** User accounts with saved data

| Task | Status |
|------|--------|
| JWT authentication | 🔴 |
| Login/Signup | 🔴 |
| Email verification | 🔴 |
| Phone verification (2Factor OTP) | 🔴 |
| Password reset | 🔴 |
| User profile | 🔴 |
| Address book | 🔴 |
| Order history | 🔴 |
| Wishlist | 🔴 |
| Social login (Google) | 🔴 |

### Phase 3: Content Pages 🔴
**Goal:** Build trust and credibility

| Task | Status |
|------|--------|
| Home page (all sections) | 🔴 |
| Gallery/portfolio | 🔴 |
| About page | 🔴 |
| Policies page | 🔴 |
| Contact form | 🔴 |

### Phase 4: Payments & Notifications 🔴
**Goal:** Complete payment and notification system

| Task | Status |
|------|--------|
| Custom order form | 🔴 |
| Razorpay integration | 🔴 |
| Order tracking | 🔴 |
| Email notifications (Zoho) | 🔴 |
| WhatsApp notifications | 🔴 |
| GST Invoice generation | 🔴 |

### Phase 5: Reviews, Coupons & Returns 🔴
**Goal:** Build trust and incentivize purchases

| Task | Status |
|------|--------|
| Customer reviews with photos | 🔴 |
| Review moderation (admin) | 🔴 |
| Coupon system | 🔴 |
| Newsletter subscription | 🔴 |
| Return request system | 🔴 |
| Return processing (admin) | 🔴 |

### Phase 6: Polish & Launch 🔴
**Goal:** Production-ready quality

| Task | Status |
|------|--------|
| Animations (Framer Motion) | 🔴 |
| Skeleton loaders | 🔴 |
| Error handling | 🔴 |
| Mobile optimization | 🔴 |
| Performance optimization | 🔴 |
| SEO implementation | 🔴 |
| Security headers | 🔴 |
| Cookie consent | 🔴 |
| Legal pages | 🔴 |
| Final QA | 🔴 |

---

## 7. Cost Summary

### Monthly Operating Costs

| Service | Cost | Notes |
|---------|------|-------|
| Domain (anjoriarts.com) | ~₹100/mo | Annual payment |
| Neon PostgreSQL | Free | 0.5GB storage |
| Cloudinary | Free | 25 credits/month |
| Cloud Run | ~₹500/mo | Pay per use (set min-instances: 0) |
| Cloudflare | Free | CDN + Email Routing |
| Resend | Free | 3,000 emails/month |
| 2Factor (SMS OTP) | ~₹5/mo | ₹0.165/SMS (~20-30 OTPs/month) |
| WhatsApp Business App | Free | Manual sending (Phase 1) |
| **Total** | **~₹605/mo** | Extremely low cost for full e-commerce |

### Transaction Costs

| Service | Fee | Notes |
|---------|-----|-------|
| Razorpay UPI | 2% | Free UPI ended in 2024 |
| Razorpay Cards | 2% | |
| Razorpay Net Banking | 2% | |

**Note:** Factor 2% transaction fee into artwork pricing.

### Email Setup (Cloudflare + Resend)

**4 Email Addresses:**

| Email | Purpose | Used In |
|-------|---------|---------|
| `hello@anjoriarts.com` | General contact, newsletter, support | Contact page, general inquiries |
| `orders@anjoriarts.com` | Order confirmations, shipping | Order emails, Shipping page |
| `legal@anjoriarts.com` | Privacy, terms, refund policy | Privacy, Terms, Refund pages |
| `no-reply@anjoriarts.com` | OTP, password reset, system alerts | System emails (sending only) |

**Receiving (Cloudflare Email Routing - FREE):**
All 4 addresses forward to your personal Gmail inbox.

**Sending (Resend - FREE tier 3,000/month):**
- `no-reply@` for transactional (OTP, password reset)
- `orders@` for order-related
- `hello@` for newsletter

**Configuration Location:**
- Frontend: `frontend/src/config/contact.js`
- Backend: `backend/src/main/java/com/anjoriarts/constants/ContactConstants.java`

### Contact Information

| Field | Value |
|-------|-------|
| Phone | +91 80519 60916 |
| Email | hello@anjoriarts.com |
| WhatsApp | +91 80519 60916 |
| Location | Puducherry, India |

---

## 8. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Mar 2026 | Initial system design with all features defined |
| 1.1.0 | Mar 7, 2026 | Added shipping/discount policy, email addresses, updated Razorpay fees |
| 1.2.0 | Mar 7, 2026 | Replaced Zoho with Cloudflare+Resend, added GST info, refund policy, Artwork Care page |
| 1.3.0 | Mar 7, 2026 | Simplified to 4 emails, updated all pages to use centralized config |
| 1.4.0 | Mar 7, 2026 | Added Email System section, created EMAIL_TEMPLATES.md with all email content |
| 1.5.0 | Mar 7, 2026 | Replaced MSG91 with 2Factor (₹0.165/SMS), added WhatsApp strategy (FREE app → Interakt) |
| 1.6.0 | Mar 7, 2026 | Added phased GST registration strategy (launch without GSTIN, register at ₹30L+) |
| 1.7.0 | Mar 8, 2026 | Added Future Roadmap section with phased feature planning (WhatsApp, View in Room, etc.) |

### Version Numbering

- **Major (1.0, 2.0):** Production releases
- **Minor (1.1, 1.2):** Feature additions
- **Patch (1.0.1):** Bug fixes

---

---

## 9. Email System

### Email Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    INCOMING EMAILS                               │
│              (Customer → Anjori Arts)                           │
│                                                                  │
│   hello@anjoriarts.com  ───┐                                    │
│   orders@anjoriarts.com ───┼──► Cloudflare ──► Your Gmail       │
│   legal@anjoriarts.com  ───┘    (FREE)                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    OUTGOING EMAILS                               │
│              (Anjori Arts → Customer)                           │
│                                                                  │
│   Spring Boot ──► Resend API ──► Customer inbox                 │
│                   (FREE: 3k/month)                              │
│                                                                  │
│   From addresses:                                                │
│   • noreply@anjoriarts.com (OTP, alerts)                        │
│   • orders@anjoriarts.com (order updates)                       │
│   • hello@anjoriarts.com (newsletter)                           │
└─────────────────────────────────────────────────────────────────┘
```

### Email Types

| Category | Emails | Trigger |
|----------|--------|---------|
| **Transactional** | Welcome, Email Verification, Password Reset, OTP | Automatic |
| **Order** | Confirmation, Shipped, Delivered, Cancelled | Automatic |
| **Custom Order** | Received, Quote, Work Started, Completed | Automatic |
| **Marketing** | Newsletter, Promotions | Manual |
| **Support** | Contact Acknowledgment, Review/Testimonial Approved | Automatic |

### Email Flow Summary

| Event | Email Sent | From Address |
|-------|------------|--------------|
| User signs up | Welcome + 10% off code | hello@ |
| User forgets password | Reset link | noreply@ |
| Order placed | Confirmation + invoice | orders@ |
| Order shipped | Tracking details | orders@ |
| Order delivered | Care tips + review request | orders@ |
| Custom order submitted | Acknowledgment | orders@ |
| Quote sent | Quote details + pay button | orders@ |
| Contact form submitted | Acknowledgment | hello@ |
| Review approved | Notification | hello@ |

> **See [EMAIL_TEMPLATES.md](./EMAIL_TEMPLATES.md) for complete email content and HTML templates.**

---

## 10. Future Roadmap

High-impact features planned for future phases to improve conversion, trust, and user experience.

### Phase 7: Trust & Engagement
| Feature | Description | Priority | Effort |
|---------|-------------|----------|--------|
| **WhatsApp Chat Button** | Floating button for instant customer queries | High | Low |
| **Instagram Feed** | Display recent posts on homepage | Medium | Low |
| **Recently Viewed** | Section showing artworks user browsed | Medium | Low |
| **Packaging Showcase** | Show how art is safely packaged for shipping | Medium | Low |
| **FAQ Page** | Common questions about ordering, shipping, materials | High | Low |

### Phase 8: Conversion Optimization
| Feature | Description | Priority | Effort |
|---------|-------------|----------|--------|
| **Sticky Add-to-Cart (Mobile)** | Button stays visible while scrolling product page | High | Low |
| **Urgency Indicators** | "Only 1 left", "3 people viewing this" | Medium | Low |
| **Exit Intent Popup** | Capture emails with discount before user leaves | Low | Medium |
| **"Complete the Look"** | Suggest matching art pieces on product page | Low | Medium |

### Phase 9: Advanced Features
| Feature | Description | Priority | Effort |
|---------|-------------|----------|--------|
| **View in Room Preview** | AR/mockup showing art on user's wall | High | High |
| **Size Comparison Visual** | Show art next to sofa/hand for scale understanding | Medium | Medium |
| **Art Quiz** | "Find your art style" - engagement + email capture | Low | Medium |
| **Artist Process Video** | Behind-the-scenes of art creation on About page | Low | Low |

### Phase 10: SEO & Content
| Feature | Description | Priority | Effort |
|---------|-------------|----------|--------|
| **Blog/Art Guides** | "How to choose art for your space" articles | Medium | Medium |
| **Press/Features Section** | "As seen in..." credibility builder | Low | Low |
| **Customer Photos Gallery** | Photos of art in customers' homes | Medium | Low |

### Feature Priority Matrix

```
                    HIGH IMPACT
                        │
    ┌───────────────────┼───────────────────┐
    │                   │                   │
    │  WhatsApp Chat    │   View in Room    │
    │  Sticky Cart      │                   │
    │  FAQ Page         │                   │
    │                   │                   │
LOW ├───────────────────┼───────────────────┤ HIGH
EFFORT                  │                   EFFORT
    │                   │                   │
    │  Instagram Feed   │   Art Quiz        │
    │  Recently Viewed  │   Blog            │
    │  Urgency Icons    │                   │
    │                   │                   │
    └───────────────────┼───────────────────┘
                        │
                    LOW IMPACT
```

**Recommendation:** Start with high-impact, low-effort features (top-left quadrant) for maximum ROI.

---

## Related Documents

- [DB_DESIGN.md](./DB_DESIGN.md) - Database schema, tables, relationships ✅
- [schema.sql](../backend/src/main/resources/db/schema.sql) - Executable SQL queries ✅
- [seed.sql](../backend/src/main/resources/db/seed.sql) - Initial data (categories, shipping, coupons) ✅
- [EMAIL_TEMPLATES.md](./EMAIL_TEMPLATES.md) - Email content, templates, design guidelines ✅
- [TECHNICAL.md](./TECHNICAL.md) - API endpoints, request/response (for developers) 🔴
- [INFRASTRUCTURE.md](./INFRASTRUCTURE.md) - Deployment, Docker, services (for DevOps) 🔴

---

*This document provides a high-level overview for managers and stakeholders. For technical details, see the related documents.*
