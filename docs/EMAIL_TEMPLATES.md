# Anjori Arts - Email Architecture & Templates Guide

> **Version:** 2.0.0  
> **Last Updated:** September 2026  
> **Architecture:** Next.js 16 Server Actions (`src/lib/email.ts`) + Resend API / SMTP + Cloudflare Email Routing + Supabase Auth  
> **Supabase Auth Templates Guide:** See [SUPABASE_EMAIL_TEMPLATES.md](./SUPABASE_EMAIL_TEMPLATES.md) for ready-to-paste authentication email templates.

---

## Table of Contents

0. [Supabase Authentication Email Templates](./SUPABASE_EMAIL_TEMPLATES.md)
1. [Email Architecture](#1-email-architecture)
2. [Transactional Emails](#2-transactional-emails)
3. [Order Emails](#3-order-emails)
4. [Custom Order Emails](#4-custom-order-emails)
5. [Marketing Emails](#5-marketing-emails)
6. [Support Emails](#6-support-emails)
7. [Design Guidelines](#7-design-guidelines)

---

## 1. Email Architecture

### Email Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    INCOMING EMAILS                               │
│                 (Customer → Anjori Arts)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Customer sends to:               Cloudflare Routes to:        │
│   • support@anjoriarts.com   ───► anjoriarts@gmail.com          │
│   • orders@anjoriarts.com    ───► anjoriarts@gmail.com          │
│   • admin@anjoriarts.com     ───► anjoriarts@gmail.com          │
│   • hello@anjoriarts.com     ───► anjoriarts@gmail.com          │
│   • legal@anjoriarts.com     ───► anjoriarts@gmail.com          │
│   • * (Catch-All)            ───► anjoriarts@gmail.com          │
│                                                                 │
│   Cost: FREE ($0 / Cloudflare Email Routing)                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    OUTGOING EMAILS                               │
│                 (Anjori Arts → Customer)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Next.js 16 Server Actions / Supabase Auth                      │
│         │                                                       │
│         ▼                                                       │
│   ┌─────────────┐                                               │
│   │   RESEND    │──► Customer receives email from:              │
│   │  API & SMTP │    • noreply@anjoriarts.com (auth, orders)    │
│   └─────────────┘    • Reply-To: orders@anjoriarts.com          │
│                      • Reply-To: support@anjoriarts.com         │
│                                                                 │
│   In-Email CTA: "✉️ Reply to Orders / Support" action buttons   │
│   Cost: FREE (Resend 3,000 emails/month)                        │
└─────────────────────────────────────────────────────────────────┘
```

### Email Addresses & Purpose

| Address | Role | Destination / Handling | Trigger |
| :--- | :--- | :--- | :--- |
| `noreply@anjoriarts.com` | Automated Outgoing Sender | Outbound only via Resend API (`src/lib/email.ts`) and Supabase SMTP | System / Order Placement / Auth |
| `support@anjoriarts.com` | Customer Care & General Support | Forwarded via Cloudflare $\rightarrow$ `anjoriarts@gmail.com`. Available in Gmail "Send mail as" | Inbound Customer Inquiries |
| `orders@anjoriarts.com` | Order Receipts & Tracking Replies | Forwarded via Cloudflare $\rightarrow$ `anjoriarts@gmail.com`. Configured as `replyTo` in transactional emails | Checkout & Order Inquiries |
| `admin@anjoriarts.com` | Administrative Notifications | Forwarded via Cloudflare $\rightarrow$ `anjoriarts@gmail.com`. Defined in `siteConfig.email.admin` | Internal Admin System Alerts |
| `hello@anjoriarts.com` | Newsletters & Studio Announcements | Forwarded via Cloudflare $\rightarrow$ `anjoriarts@gmail.com` | Marketing / Welcome Updates |
| `legal@anjoriarts.com` | Legal, IP & Terms Correspondence | Forwarded via Cloudflare $\rightarrow$ `anjoriarts@gmail.com` | Legal & Compliance Inquiries |

### Email Categories

| Category | Examples | Priority |
|----------|----------|----------|
| **Transactional** | OTP, password reset, email verification | Critical (immediate) |
| **Order** | Confirmation, shipped, delivered | High (immediate) |
| **Custom Order** | Received, quote, accepted | High (immediate) |
| **Marketing** | Newsletter, promotions | Low (batched) |
| **Support** | Contact acknowledgment, testimonial approved | Medium |

---

## 2. Transactional Emails

### 2.1 Welcome Email

**Trigger:** User signs up  
**From:** `hello@anjoriarts.com`  
**Subject:** `Welcome to Anjori Arts, {firstName}! 🎨`

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                         ANJORI ARTS
                    Handcrafted with Love

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hi {firstName},

Welcome to the Anjori Arts family! 🎨

I'm Jyotsna, the artist behind every piece you see here. Each artwork 
is handcrafted using traditional techniques passed down through 
generations of Mithila artists.

Here's what you can explore:

🖼️  BROWSE THE COLLECTION
    Madhubani, Mandala, Tanjore, and more traditional art forms
    → https://anjoriarts.com/shop

✨  YOUR FIRST ORDER GIFT
    Use code WELCOME10 for 10% off your first purchase
    (Valid for 30 days, max discount ₹500)

🎨  CUSTOM ARTWORK
    Want something unique? I create personalized pieces just for you
    → https://anjoriarts.com/custom

📸  GALLERY & EXHIBITIONS
    See my portfolio and recent exhibitions
    → https://anjoriarts.com/gallery

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Questions? Just reply to this email or reach out:
📧 hello@anjoriarts.com
📱 WhatsApp: +91 80519 60916

With warmth,
Jyotsna Sharma
Anjori Arts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Follow the journey:
Instagram @anjori.arts | Facebook @anjoriarts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 2.2 Email Verification

**Trigger:** User signs up (if email verification enabled)  
**From:** `noreply@anjoriarts.com`  
**Subject:** `Verify your email for Anjori Arts`

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                         ANJORI ARTS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hi {firstName},

Please verify your email address to complete your registration.

        ┌─────────────────────────────────┐
        │                                 │
        │      [ VERIFY MY EMAIL ]        │
        │                                 │
        └─────────────────────────────────┘

Or copy this link into your browser:
{verificationUrl}

This link expires in 24 hours.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If you didn't create an account, please ignore this email.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 2.3 Password Reset

**Trigger:** User clicks "Forgot Password"  
**From:** `noreply@anjoriarts.com`  
**Subject:** `Reset your Anjori Arts password`

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                         ANJORI ARTS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hi {firstName},

We received a request to reset your password.

        ┌─────────────────────────────────┐
        │                                 │
        │     [ RESET MY PASSWORD ]       │
        │                                 │
        └─────────────────────────────────┘

Or copy this link into your browser:
{resetUrl}

⚠️  This link expires in 1 hour.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Didn't request this? You can safely ignore this email.
Your password will remain unchanged.

For security, we recommend:
• Using a unique password for Anjori Arts
• Not sharing your password with anyone

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 2.4 OTP Verification (Phone)

**Trigger:** Phone verification during checkout  
**From:** `noreply@anjoriarts.com`  
**Subject:** `Your Anjori Arts verification code: {otp}`

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                         ANJORI ARTS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your verification code is:

        ┌─────────────────────────────────┐
        │                                 │
        │            {OTP}                │
        │                                 │
        └─────────────────────────────────┘

Enter this code to verify your phone number.

⏱️  Code expires in 5 minutes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If you didn't request this code, please ignore this email.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 3. Order Emails

### 3.1 Order Confirmation

**Trigger:** Payment successful  
**From:** `orders@anjoriarts.com`  
**Subject:** `Order Confirmed! #{orderNumber} 🎨`

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                         ANJORI ARTS
                      Order Confirmed ✓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hi {firstName},

Thank you for your order! 🎉

Your handcrafted artwork is being carefully prepared for shipping.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ORDER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Order Number: #{orderNumber}
Order Date:   {orderDate}

┌─────────────────────────────────────────────────────────┐
│ ITEMS                                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ [IMG] {artworkTitle}                                    │
│       Size: {size}                                      │
│       Qty: {quantity}                × ₹{unitPrice}     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Subtotal:                              ₹{subtotal}      │
│ Shipping:                              ₹{shipping}      │
│ Discount ({couponCode}):              -₹{discount}      │
│                                       ─────────────     │
│ TOTAL:                                 ₹{total}         │
│ (Includes GST)                                          │
│                                                         │
└─────────────────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SHIPPING ADDRESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{shippingName}
{addressLine1}
{addressLine2}
{city}, {state} - {pincode}
Phone: {phone}

Estimated Delivery: {estimatedDelivery}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        ┌─────────────────────────────────┐
        │                                 │
        │      [ TRACK YOUR ORDER ]       │
        │                                 │
        └─────────────────────────────────┘

        ┌─────────────────────────────────┐
        │                                 │
        │      [ DOWNLOAD INVOICE ]       │
        │                                 │
        └─────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHAT'S NEXT?

1. 📦 We'll pack your artwork with care
2. 🚚 You'll receive tracking details when shipped
3. 🎨 Enjoy your new artwork!

Questions about your order?
Reply to this email or WhatsApp: +91 80519 60916

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

With gratitude,
Jyotsna Sharma
Anjori Arts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 3.2 Order Shipped

**Trigger:** Admin marks order as shipped  
**From:** `orders@anjoriarts.com`  
**Subject:** `Your artwork is on its way! 🚚 #{orderNumber}`

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                         ANJORI ARTS
                    Your Order Has Shipped!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hi {firstName},

Great news! Your artwork is on its way to you! 🎉

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRACKING INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Order Number:    #{orderNumber}
Courier:         {courierName}
Tracking ID:     {trackingNumber}

        ┌─────────────────────────────────┐
        │                                 │
        │       [ TRACK PACKAGE ]         │
        │                                 │
        └─────────────────────────────────┘

Estimated Delivery: {estimatedDelivery}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SHIPPING TO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{shippingName}
{addressLine1}
{city}, {state} - {pincode}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 HANDLING TIP

Your artwork has been carefully packaged with protective materials.
When you receive it, please check the package for any shipping damage
before signing.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Questions? Reply to this email or WhatsApp: +91 80519 60916

With warmth,
Anjori Arts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 3.3 Order Delivered

**Trigger:** Courier marks as delivered OR admin updates status  
**From:** `orders@anjoriarts.com`  
**Subject:** `Your artwork has arrived! 🎨 #{orderNumber}`

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                         ANJORI ARTS
                       Delivered! 🎉

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hi {firstName},

Your artwork has been delivered! 🏠

I hope it brings joy and beauty to your space.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🖼️  ARTWORK CARE TIPS

• Avoid direct sunlight to preserve colors
• Dust gently with a soft, dry cloth
• Keep away from moisture
• Handle with clean, dry hands

Full care guide: https://anjoriarts.com/artwork-care

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⭐ SHARE YOUR EXPERIENCE

Your feedback helps other art lovers discover handcrafted art.
Would you take a moment to share your experience?

        ┌─────────────────────────────────┐
        │                                 │
        │      [ WRITE A REVIEW ]         │
        │                                 │
        └─────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📸 TAG US!

Share a photo of your artwork in its new home:
Instagram: @anjori.arts
#AnjoriArts #HandcraftedArt

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Need Help?

• Damaged artwork? Contact us within 5 days for return/replacement
• Questions? Reply to this email or WhatsApp: +91 80519 60916

Thank you for supporting handmade art! 🙏

With gratitude,
Jyotsna Sharma
Anjori Arts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 3.4 Order Cancelled

**Trigger:** Admin cancels order OR customer cancels  
**From:** `orders@anjoriarts.com`  
**Subject:** `Order Cancelled - #{orderNumber}`

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                         ANJORI ARTS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hi {firstName},

Your order #{orderNumber} has been cancelled.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REFUND DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Refund Amount: ₹{refundAmount}
Refund Method: Original payment method
Timeline: 5-7 business days

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

We'd love to have you back! Browse our collection anytime:

        ┌─────────────────────────────────┐
        │                                 │
        │       [ BROWSE ARTWORKS ]       │
        │                                 │
        └─────────────────────────────────┘

Questions? Reply to this email.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 4. Custom Order Emails

### 4.1 Custom Order Received

**Trigger:** Customer submits custom order form  
**From:** `orders@anjoriarts.com`  
**Subject:** `Custom Order Request Received - #{requestNumber}`

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                         ANJORI ARTS
                   Custom Order Request

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hi {firstName},

Thank you for your custom artwork request! 🎨

I've received your vision and I'm excited to bring it to life.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR REQUEST SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Request Number: #{requestNumber}
Submitted: {submittedDate}

Art Style: {artType}
Preferred Size: {sizePreference}
Budget Range: ₹{budgetMin} - ₹{budgetMax}
Deadline: {deadline}

Your Description:
"{description}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT HAPPENS NEXT?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 📝 I'll review your request (within 24-48 hours)
2. 💬 I may reach out for clarifications
3. 💰 You'll receive a quote with timeline
4. ✅ Once you approve, I'll begin creating your artwork

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Have questions or want to add details?
Reply to this email or WhatsApp: +91 80519 60916

Looking forward to creating something special for you!

Warm regards,
Jyotsna Sharma
Anjori Arts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 4.2 Custom Order Quote

**Trigger:** Admin sends quote to customer  
**From:** `orders@anjoriarts.com`  
**Subject:** `Your Custom Artwork Quote - #{requestNumber}`

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                         ANJORI ARTS
                    Custom Artwork Quote

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hi {firstName},

I've reviewed your custom artwork request and prepared a quote for you.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUOTE DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Request: #{requestNumber}

┌─────────────────────────────────────────────────────────┐
│                                                         │
│ Art Style:      {artType}                               │
│ Size:           {finalSize}                             │
│ Medium:         {medium}                                │
│ Surface:        {surface}                               │
│                                                         │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ QUOTED PRICE:   ₹{quotedPrice}                          │
│ (Includes GST & Shipping)                               │
│                                                         │
│ Estimated Time: {estimatedDays} days after payment      │
│                                                         │
└─────────────────────────────────────────────────────────┘

{artistNotes}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  IMPORTANT: Custom orders require full payment upfront.
    Custom artwork cannot be resold, so COD is not available.

This quote is valid for 7 days.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        ┌─────────────────────────────────┐
        │                                 │
        │      [ ACCEPT & PAY NOW ]       │
        │                                 │
        └─────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Questions about the quote?
Reply to this email or WhatsApp: +91 80519 60916

Excited to create this for you!

Warm regards,
Jyotsna Sharma
Anjori Arts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 4.3 Custom Order Work Started

**Trigger:** Admin marks custom order as "In Progress"  
**From:** `orders@anjoriarts.com`  
**Subject:** `Work has begun on your artwork! 🎨 #{requestNumber}`

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                         ANJORI ARTS
                    Creating Your Artwork

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hi {firstName},

Exciting news! I've started working on your custom artwork! 🎉

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Request: #{requestNumber}
Started: {startDate}
Expected Completion: {expectedDate}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

I'll keep you updated on the progress. Feel free to reach out
if you have any questions!

WhatsApp: +91 80519 60916

With excitement,
Jyotsna Sharma
Anjori Arts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 5. Marketing Emails

### 5.1 Newsletter

**Trigger:** Manual send from admin  
**From:** `hello@anjoriarts.com`  
**Subject:** `New Arrivals at Anjori Arts 🎨`

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                         ANJORI ARTS
                     Monthly Art Update

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hi {firstName},

Here's what's new in the studio this month! 🎨

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ NEW ARRIVALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[IMG] {artwork1Title}
      {artwork1Style} | Starting ₹{artwork1Price}
      → View Artwork

[IMG] {artwork2Title}
      {artwork2Style} | Starting ₹{artwork2Price}
      → View Artwork

[IMG] {artwork3Title}
      {artwork3Style} | Starting ₹{artwork3Price}
      → View Artwork

        ┌─────────────────────────────────┐
        │                                 │
        │      [ VIEW ALL NEW WORKS ]     │
        │                                 │
        └─────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📸 FROM THE STUDIO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{studioUpdate}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Follow the journey:
Instagram @anjori.arts | Facebook @anjoriarts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You're receiving this because you subscribed to Anjori Arts updates.
[Unsubscribe] | [Update Preferences]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 6. Support Emails

### 6.1 Contact Form Acknowledgment

**Trigger:** User submits contact form  
**From:** `hello@anjoriarts.com`  
**Subject:** `We received your message!`

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                         ANJORI ARTS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hi {firstName},

Thank you for reaching out! I've received your message and will 
get back to you within 24-48 hours.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your Message:
"{message}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For urgent queries:
📱 WhatsApp: +91 80519 60916

Warm regards,
Jyotsna Sharma
Anjori Arts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 6.2 Testimonial Approved

**Trigger:** Admin approves testimonial  
**From:** `hello@anjoriarts.com`  
**Subject:** `Your testimonial is now live! ⭐`

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                         ANJORI ARTS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hi {firstName},

Thank you so much for sharing your experience! ⭐

Your testimonial is now live on our website and will help other 
art lovers discover handcrafted art.

        ┌─────────────────────────────────┐
        │                                 │
        │    [ VIEW YOUR TESTIMONIAL ]    │
        │                                 │
        └─────────────────────────────────┘

Thank you for being part of the Anjori Arts family! 🙏

With gratitude,
Jyotsna Sharma
Anjori Arts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 6.3 Review Approved

**Trigger:** Admin approves product review  
**From:** `hello@anjoriarts.com`  
**Subject:** `Your review is now live! ⭐`

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                         ANJORI ARTS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hi {firstName},

Your review for "{artworkTitle}" is now live! ⭐

Thank you for taking the time to share your experience. Your 
feedback helps other art lovers make confident purchases.

        ┌─────────────────────────────────┐
        │                                 │
        │      [ VIEW YOUR REVIEW ]       │
        │                                 │
        └─────────────────────────────────┘

Thank you for your support! 🙏

Warm regards,
Jyotsna Sharma
Anjori Arts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 7. Design Guidelines

### Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Primary (Purple) | `#7c3aed` | Buttons, links |
| Accent (Amber) | `#f59e0b` | Highlights, stars |
| Text | `#1f2937` | Body text |
| Muted | `#6b7280` | Secondary text |
| Background | `#ffffff` | Email background |

### Typography

- **Headings:** System font stack (Arial, sans-serif)
- **Body:** 16px, line-height 1.6
- **Buttons:** 14px, bold, uppercase

### Button Styling

```css
background: #7c3aed;
color: white;
padding: 14px 28px;
border-radius: 8px;
text-decoration: none;
font-weight: bold;
```

### Email Best Practices

1. **Width:** Max 600px for compatibility
2. **Images:** Host on Cloudinary with fallback alt text
3. **Links:** Use full URLs, no URL shorteners
4. **Unsubscribe:** Required in all marketing emails
5. **Preview Text:** First 50 chars visible in inbox
6. **Mobile:** Single column, large tap targets

---

## Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `{firstName}` | User's first name | Priya |
| `{orderNumber}` | Order ID | ORD-1234567890 |
| `{requestNumber}` | Custom order ID | CR-1234567890 |
| `{trackingNumber}` | Courier tracking | DTDC123456 |
| `{otp}` | 6-digit OTP | 847291 |
| `{verificationUrl}` | Email verify link | https://... |
| `{resetUrl}` | Password reset link | https://... |

---

## Related Documents

- [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) - System architecture
- [TECHNICAL.md](./TECHNICAL.md) - API implementation details

---

*Last updated: March 7, 2026*
