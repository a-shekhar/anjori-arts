# Anjori Arts - Infrastructure Guide

> **Version:** 2.0.0  
> **Last Updated:** September 2026  
> **Architecture:** Next.js 16 (App Router) on Vercel + Supabase (PostgreSQL / Auth) + Cloudflare DNS & Email Routing + Resend  
> **Audience:** DevOps, Self-deployment, Project Operations

---

## Table of Contents

1. [Overview](#1-overview)
2. [DNS & Domain Configuration](#2-dns--domain-configuration)
3. [Environment Variables](#3-environment-variables)
4. [Service Configuration](#4-service-configuration)
5. [Deployment](#5-deployment)
6. [Monitoring](#6-monitoring)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Overview

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLOUDFLARE                              │
│         (DNS, Security, Email Routing to Gmail)             │
│   Nameservers: imani.ns.cloudflare.com, valentin...         │
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
    [ WEB TRAFFIC (DNS ONLY) ]     [ INBOUND EMAIL ROUTING ]
               │                               │
               ▼                               ▼
┌─────────────────────────────┐   ┌───────────────────────────┐
│     VERCEL GLOBAL EDGE      │   │   anjoriarts@gmail.com    │
│  (Next.js 16 App Router)    │   │  (Unified Support Inbox)  │
│  • React Server Components  │   └───────────────────────────┘
│  • Server Actions & API     │
│  • Global Edge CDN          │
└──────────────┬──────────────┘
               │
      ┌────────┴────────┬────────────────┬──────────────┐
      ▼                 ▼                ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Supabase   │ │  Cloudinary  │ │    Resend    │ │   Razorpay   │
│ (PostgreSQL, │ │ (Art Images, │ │(Transactional│ │ (Payments &  │
│  Auth, RLS)  │ │ CDN Delivery)│ │ Email & SMTP)│ │  Webhooks)   │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

### Services Summary

| Service | Purpose | Plan / Cost |
|---|---|---|
| **Vercel** | Next.js 16 Hosting & Edge Network | Hobby / Pro ($0–$20/mo) |
| **Supabase** | Managed PostgreSQL, Row Level Security, Auth | Free Tier (500MB DB, 50k MAU) |
| **Cloudflare** | DNS Management & Inbound Email Routing (`*@anjoriarts.com` $\rightarrow$ `anjoriarts@gmail.com`) | Free ($0/mo) |
| **Resend** | Outbound Transactional Emails & SMTP Relay | Free (3,000 emails/mo) |
| **Cloudinary** | Responsive Art Imagery, Auto-Format & Cloud Storage | Free (25 Monthly Credits) |
| **Razorpay** | UPI, Cards, NetBanking payment gateway | 2% per successful transaction |
| **Upstash Redis** | Server Action Rate Limiting | Free (10,000 requests/day) |
| **Sentry** | Full-stack Error Monitoring & Performance Tracing | Free Tier |

---

## 2. DNS & Domain Configuration

The domain `anjoriarts.com` is registered on **GoDaddy**, with DNS authority managed on **Cloudflare (Free Plan)**.

### Nameservers
Configured in GoDaddy domain settings:
* `imani.ns.cloudflare.com`
* `valentin.ns.cloudflare.com`

### Active DNS Records Table (Cloudflare)

| Type | Name / Host | Target / Value | Proxy Status | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` *(anjoriarts.com)* | `76.76.21.21` | **DNS Only** | Vercel Global Edge IP |
| **CNAME** | `www` | `9e592364e2a787a1.vercel-dns-017.com` | **DNS Only** | Vercel WWW CNAME |
| **MX** | `@` | `route1.mx.cloudflare.net` (9)<br>`route2.mx.cloudflare.net` (70)<br>`route3.mx.cloudflare.net` (53) | DNS Only | Cloudflare Inbound Email Routing |
| **MX** | `send` | `feedback-smtp.us-east-1.amazonses.com` (10) | DNS Only | Resend Return-Path Mail Server |
| **TXT** | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBA...` | DNS Only | Resend DKIM Cryptographic Signature |
| **TXT** | `_dmarc` | `v=DMARC1; p=none;` | DNS Only | Domain Email Authentication Policy |
| **TXT** | `send` | `v=spf1 include:amazonses.com ~all` | DNS Only | Resend SPF Authorization |
| **TXT** | `@` | Google Site Verification keys | DNS Only | Google Search Console Ownership |

> **Crucial Rule for Vercel Hosting:** Keep the apex `A` and `www` `CNAME` records set to **DNS Only (Grey Cloud)**. This allows Vercel to issue and auto-renew Let's Encrypt SSL certificates without proxy interference.

---

## 3. Environment Variables

### Complete Production Reference

```bash
# ============================================
# SUPABASE (PostgreSQL, Auth & Storage)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi... # Server-side only (never expose to client)

# ============================================
# RESEND (Transactional Email & SMTP)
# ============================================
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
# SMTP Host: smtp.resend.com | Port: 465 (SSL) | User: resend | Pass: $RESEND_API_KEY

# ============================================
# CLOUDINARY (Media Asset Delivery & Optimization)
# ============================================
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ============================================
# RAZORPAY (Payments Gateway)
# ============================================
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# ============================================
# UPSTASH REDIS (Rate Limiting)
# ============================================
UPSTASH_REDIS_REST_URL=https://your-endpoint.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxx

# ============================================
# SITE & SEO
# ============================================
NEXT_PUBLIC_SITE_URL=https://www.anjoriarts.com

# ============================================
# GOOGLE GEMINI AI (Art Assistant)
# ============================================
GEMINI_API_KEY=AIzaxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ============================================
# SENTRY (Error Telemetry & Monitoring)
# ============================================
NEXT_PUBLIC_SENTRY_DSN=https://xxxxxxxx@o0.ingest.sentry.io/0
SENTRY_ORG=anjori-arts
SENTRY_PROJECT=storefront
SENTRY_AUTH_TOKEN=sntrys_xxxxxxxxxxxxxxxxxxxx
```

---

## 4. Service Configuration

### 4.1 Supabase (PostgreSQL, Auth & Storage)

**Setup:**
1. Log in to [supabase.com](https://supabase.com)
2. Project: `anjori-arts`
3. Retrieve API keys from **Project Settings ➔ API**:
   - Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
   - Anon Public Key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - Service Role Secret (`SUPABASE_SERVICE_ROLE_KEY` - kept server-side only)
4. Enable Row Level Security (RLS) across all production tables (`artworks`, `orders`, `profiles`, `custom_orders`).
5. Configure Custom SMTP in **Project Settings ➔ Authentication ➔ SMTP Settings** using Resend credentials (`smtp.resend.com:465`).

---

### 4.2 Cloudinary

**Setup:**
1. Create account at [cloudinary.com](https://cloudinary.com)
2. Note: Cloud Name, API Key, API Secret

**Folder Structure:**
```
anjori-arts/
├── artworks/           # Product images
├── avatars/            # User avatars
├── custom-orders/      # Commission references
└── misc/               # Other uploads
```

**Image Transformations:**
```
# Thumbnail (300x300, crop)
https://res.cloudinary.com/xxx/image/upload/c_fill,w_300,h_300/artworks/image.jpg

# Product image (800x auto)
https://res.cloudinary.com/xxx/image/upload/w_800,q_auto,f_auto/artworks/image.jpg
```

---

### 4.3 Cloudflare Email Routing & Resend SMTP

**Inbound Email Architecture (Cloudflare Email Routing):**
1. Domain DNS points to Cloudflare (`imani.ns.cloudflare.com`, `valentin.ns.cloudflare.com`).
2. Cloudflare Email Routing is enabled with global MX records (`route1.mx.cloudflare.net`).
3. Verified destination address: `anjoriarts@gmail.com`.
4. **Catch-All Rule:** `*@anjoriarts.com` $\rightarrow$ `anjoriarts@gmail.com`.
   - Inbound messages to `support@`, `orders@`, `admin@`, `hello@`, `legal@` land directly in `anjoriarts@gmail.com`.

**Outbound Transactional Email (Resend):**
1. Domain verified in Resend via DKIM (`resend._domainkey.anjoriarts.com`) and SPF.
2. Next.js server actions send emails using `resend.emails.send(...)` (`src/lib/email.ts`).
3. SMTP Relay configured for Supabase Auth:
   - **Host:** `smtp.resend.com`
   - **Port:** `465` (SSL) or `587` (TLS)
   - **Username:** `resend`
   - **Password:** `<RESEND_API_KEY>`
4. Gmail "Send mail as" configured with `smtp.resend.com` so the owner can reply directly from `support@anjoriarts.com` or `orders@anjoriarts.com` inside Gmail.

---

### 4.4 Razorpay

**Setup:**
1. Create account at [razorpay.com](https://razorpay.com)
2. Complete KYC verification
3. Get API keys from Dashboard → Settings → API Keys

**Test Mode:**
```
Key ID: rzp_test_xxx
Key Secret: xxx
```

**Live Mode:**
```
Key ID: rzp_live_xxx
Key Secret: xxx
```

**UPI-Only Strategy:**
- Razorpay UPI: 0% fees
- Cards: 2% (avoid if possible)
- Display "Pay via UPI" prominently

**Payment Types Supported:**
| Type | Description | When Used |
|------|-------------|-----------|
| `FULL_PREPAID` | Full amount paid upfront | All orders |
| `COD_ADVANCE` | 30% advance + 70% COD | Regular orders only |

---

### 4.5 2Factor (Phone OTP)

**Setup:**
1. Create account at [2factor.in](https://2factor.in)
2. Get API Key from Dashboard
3. Complete DLT registration (mandatory in India)

**Pricing:**
- SMS OTP: ₹0.165/SMS (pay only for delivered within 15 sec)
- Transactional SMS: ₹0.16/SMS
- No monthly charges, lifetime validity on credits

**API Configuration:**
```yaml
twofactor:
  api-key: ${TWOFACTOR_API_KEY}
  otp-length: 6
  otp-expiry: 300             # 5 minutes
  
# Rate Limiting (application-side)
otp:
  max-requests-per-phone: 3   # per 10 minutes
  max-verify-attempts: 5      # per OTP
  verification-token-expiry: 1800  # 30 minutes
```

**API Endpoints Used:**
```
# Send OTP
GET https://2factor.in/API/V1/{api_key}/SMS/{phone}/AUTOGEN

# Verify OTP
GET https://2factor.in/API/V1/{api_key}/SMS/VERIFY/{session_id}/{otp}

# Resend OTP
GET https://2factor.in/API/V1/{api_key}/SMS/VERIFY/{session_id}/RESEND
```

**Response Example:**
```json
{
  "Status": "Success",
  "Details": "session_id_here"
}
```

**DLT Registration (Mandatory in India):**
1. Register on DLT portal (Jio/Airtel/BSNL)
2. Register sender ID (ANJORI)
3. Register message template
4. 2Factor handles DLT compliance automatically

---

### 4.6 WhatsApp Notifications

Send order notifications via WhatsApp for better engagement.

**Phase 1: WhatsApp Business App (FREE)**

For low volume (< 20 orders/month), use the free WhatsApp Business App:
- Download WhatsApp Business from Play Store/App Store
- Set up business profile with Anjori Arts info
- Manually send order updates (takes ~2 min/order)
- Cost: **₹0**

**Phase 2: WhatsApp API (When Scaling)**

| Provider | Monthly Fee | Per Message | Best For |
|----------|-------------|-------------|----------|
| **Interakt** (by Jio) | ₹799/mo | Included (1,000 conv.) | Small businesses |
| **AiSensy** | ₹0 | ~₹0.50/conv | Pay-as-you-go |
| **Gupshup** | ₹0 | ~₹0.45/conv | API integration |
| Meta Cloud API | ₹0 | Meta rates | Direct, complex setup |

**Recommended for Scaling:** Interakt (Indian company, good support, reasonable pricing)

**Setup:**
1. Create Meta Business account at [business.facebook.com](https://business.facebook.com)
2. Set up WhatsApp Business Platform
3. Verify business (may take a few days)
4. Get Phone Number ID and Access Token

**Environment Variables:**
```bash
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_BUSINESS_ID=your_business_id
```

**Message Templates (must be pre-approved):**

```
# Order Confirmation
Template: order_confirmation
Hello {{1}}! 🎨
Your order #{{2}} has been confirmed.
Total: ₹{{3}}
We'll notify you when it ships!

# Order Shipped
Template: order_shipped
Great news {{1}}! 🚚
Your order #{{2}} has been shipped.
Tracking: {{3}}
Expected delivery: {{4}}

# Order Delivered
Template: order_delivered  
Hi {{1}}! 📦
Your order #{{2}} has been delivered.
We hope you love your artwork!
Leave a review: {{3}}
```

**API Integration:**
```java
// WhatsAppService.java
public void sendOrderConfirmation(Order order) {
    String url = "https://graph.facebook.com/v17.0/" + phoneNumberId + "/messages";
    // Send template message with order details
}
```

---

### 4.7 PDF Generation (GST Invoice)

Auto-generate GST-compliant invoices for orders.

**Library:** OpenPDF (free, Java-based, fork of iText)

**Maven Dependency:**
```xml
<dependency>
    <groupId>com.github.librepdf</groupId>
    <artifactId>openpdf</artifactId>
    <version>1.3.30</version>
</dependency>
```

**GST Invoice Required Fields:**
- Invoice number (unique, sequential)
- Invoice date
- Seller details (name, address, GSTIN)
- Buyer details (name, address, GSTIN if B2B)
- Item details (description, HSN code, quantity, rate, amount)
- Tax breakdown (CGST, SGST or IGST)
- Total amount in words
- Signature/authorized signatory

**HSN Code for Paintings:** 9701 (Paintings, drawings and pastels)

**Invoice Naming Convention:**
```
AA-INV-2026-0001  (AA = Anjori Arts, INV = Invoice, Year, Sequential)
```

**Storage:**
- Generate PDF on order payment
- Store in Cloudinary (folder: `invoices/`)
- Link stored in order record

**Sample Configuration:**
```yaml
invoice:
  seller:
    name: "Anjori Arts"
    address: "Your Address, City, State - PIN"
    gstin: "YOUR_GSTIN_NUMBER"
  hsn-code: "9701"
  prefix: "AA-INV"
  logo-path: "/static/logo.png"
```

---

### 4.8 Cloudflare

**Setup:**
1. Add site at [cloudflare.com](https://cloudflare.com)
2. Update nameservers at domain registrar
3. Wait for propagation (~24 hours)

**Recommended Settings:**

| Setting | Value |
|---------|-------|
| SSL Mode | Full (strict) |
| Always Use HTTPS | On |
| Auto Minify | HTML, CSS, JS |
| Brotli | On |
| Browser Cache TTL | 1 month |

**Page Rules:**
```
# Cache API responses (5 minutes)
anjoriarts.com/api/v1/artworks*
Cache Level: Standard
Edge Cache TTL: 5 minutes

# Bypass cache for auth
anjoriarts.com/api/v1/auth/*
Cache Level: Bypass
```

**Security Headers (via Transform Rules):**
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

---

### 4.9 Google Cloud Run

**Setup:**
1. Install gcloud CLI
2. Authenticate: `gcloud auth login`
3. Set project: `gcloud config set project anjori-arts`

**Deploy Command:**
```bash
gcloud run deploy anjori-arts \
  --image=gcr.io/anjori-arts/app:latest \
  --platform=managed \
  --region=asia-south1 \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=2 \
  --set-env-vars="SPRING_PROFILES_ACTIVE=prod"
```

**Recommended Settings:**

| Setting | Value |
|---------|-------|
| Region | asia-south1 (Mumbai) |
| Memory | 512Mi |
| CPU | 1 |
| Min Instances | 0 (cost saving) |
| Max Instances | 2 (scaling limit) |
| Concurrency | 80 |
| Request Timeout | 300s |

**Cost Estimate:**
- ~₹500/month for low traffic
- Auto-scales to zero when idle

---

### 4.10 Google Analytics

**Setup:**
1. Create GA4 property at [analytics.google.com](https://analytics.google.com)
2. Get Measurement ID (G-XXXXXXXXXX)
3. Add to frontend

**Frontend Integration:**
```javascript
// src/main.jsx
import ReactGA from 'react-ga4';

ReactGA.initialize('G-XXXXXXXXXX');

// Track page views
useEffect(() => {
  ReactGA.send({ hitType: 'pageview', page: location.pathname });
}, [location]);
```

**Key Events to Track:**
- `view_item` - Product viewed
- `add_to_cart` - Item added to cart
- `begin_checkout` - Checkout started
- `purchase` - Order completed

---

## 5. Deployment

### Deployment Checklist

**Pre-deployment:**
- [ ] All tests passing
- [ ] Environment variables set
- [ ] Database migrations ready
- [ ] Docker image built and tested locally

**Deployment:**
- [ ] Push Docker image to registry
- [ ] Deploy to Cloud Run
- [ ] Verify health check: `GET /actuator/health`
- [ ] Test critical flows (shop, cart, checkout)

**Post-deployment:**
- [ ] Monitor error rates
- [ ] Check response times
- [ ] Verify emails sending
- [ ] Test payment flow

### CI/CD Pipeline (GitHub Actions)

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Docker image
        run: docker build -t gcr.io/${{ secrets.GCP_PROJECT }}/app:${{ github.sha }} .
      
      - name: Push to GCR
        run: |
          gcloud auth configure-docker
          docker push gcr.io/${{ secrets.GCP_PROJECT }}/app:${{ github.sha }}
      
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy anjori-arts \
            --image=gcr.io/${{ secrets.GCP_PROJECT }}/app:${{ github.sha }} \
            --region=asia-south1
```

---

## 6. Monitoring

### Health Endpoints

| Endpoint | Auth | Description |
|----------|------|-------------|
| `/actuator/health` | No | Basic health check |
| `/actuator/info` | No | App info |
| `/actuator/metrics` | Admin | Detailed metrics (dev only) |

### UptimeRobot (Free Monitoring)

1. Create account at [uptimerobot.com](https://uptimerobot.com)
2. Add monitor: `https://anjoriarts.com/actuator/health`
3. Set interval: 5 minutes
4. Add email alerts

**Benefits:**
- Free monitoring
- Keeps Cloud Run warm (reduces cold starts)
- Email alerts on downtime

### Logging

**Application Logs:**
```bash
# Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision" --limit=100

# Filter by severity
gcloud logging read "resource.type=cloud_run_revision AND severity>=ERROR"
```

**Log Levels by Environment:**

| Environment | Level |
|-------------|-------|
| Development | DEBUG |
| Production | INFO |

---

## 7. Troubleshooting

### Cold Start Issues

**Problem:** First request takes 10+ seconds

**Solutions:**
1. Enable min-instances=1 (costs more)
2. Use UptimeRobot ping every 5 minutes
3. Optimize Docker image (use Alpine, layered JARs)
4. Frontend: Show skeleton loaders

### Database Connection Issues

**Problem:** "Connection refused" or timeouts

**Solutions:**
1. Check Neon branch is active (not suspended)
2. Verify connection string has `?sslmode=require`
3. Check IP allowlist if applicable
4. Review connection pool settings

### Email Not Sending

**Problem:** Emails not being delivered

**Solutions:**
1. Verify SMTP credentials
2. Check SPF/DKIM records
3. Review Zoho sending limits (free: 50/day)
4. Check spam folder
5. Test with different email providers

### Image Upload Failures

**Problem:** Cloudinary uploads failing

**Solutions:**
1. Verify API credentials
2. Check file size limits (10MB max)
3. Review Cloudinary usage limits
4. Check network connectivity

### OTP Not Delivered

**Problem:** SMS OTP not being received

**Solutions:**
1. Verify 2Factor API key is correct
2. Check DLT registration status (mandatory in India)
3. Verify phone number format (+91XXXXXXXXXX)
4. Check 2Factor dashboard for delivery reports
5. Review sender ID approval status
6. Check if number is on DND (Do Not Disturb) - transactional SMS should still work

### OTP Rate Limit Hit

**Problem:** "Too many OTP requests" error

**Solutions:**
1. Wait for rate limit window (10 minutes)
2. Check for abuse patterns in logs
3. Consider implementing CAPTCHA for repeat offenders
4. Review rate limiting configuration

---

## Related Documents

- [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) - Project overview (for managers)
- [TECHNICAL.md](./TECHNICAL.md) - API endpoints (for developers)
- [DB_DESIGN.md](./DB_DESIGN.md) - Database schema (for DBAs)

---

*This document is for DevOps and self-deployment. Keep it updated as infrastructure changes.*
