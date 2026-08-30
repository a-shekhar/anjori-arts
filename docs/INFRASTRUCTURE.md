# Anjori Arts - Infrastructure Guide

> **Version:** 1.0.0  
> **Last Updated:** March 1, 2026  
> **Audience:** DevOps, Self-deployment

---

## Table of Contents

1. [Overview](#1-overview)
2. [Docker Setup](#2-docker-setup)
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
│                  (CDN, Security, SSL)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    GOOGLE CLOUD RUN                          │
│              (Container hosting, auto-scaling)               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Docker Container                          │  │
│  │  ┌─────────────────┐    ┌─────────────────────────┐   │  │
│  │  │  React (static) │    │  Spring Boot (API)      │   │  │
│  │  │       :80       │◄───│       :8080             │   │  │
│  │  └─────────────────┘    └─────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
          │                    │                    │
          ▼                    ▼                    ▼
   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
   │  Neon        │    │  Cloudinary  │    │  Zoho Mail   │
   │ (PostgreSQL) │    │  (Images)    │    │  (Email)     │
   └──────────────┘    └──────────────┘    └──────────────┘
          │                    │                    │
          ▼                    ▼                    ▼
   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
   │   2Factor    │    │   Razorpay   │    │  WhatsApp    │
   │  (SMS OTP)   │    │  (Payments)  │    │  (Notifs)    │
   └──────────────┘    └──────────────┘    └──────────────┘
```

### Services Summary

| Service | Purpose | Cost |
|---------|---------|------|
| Cloud Run | Container hosting | ~₹500/mo |
| Neon | PostgreSQL database | Free (0.5GB) |
| Cloudinary | Image CDN + Invoices | Free (25 credits) |
| Cloudflare | CDN, Security, Email Routing | Free |
| Resend | Transactional email | Free (3,000/mo) |
| 2Factor | Phone OTP verification | ₹0.165/SMS |
| WhatsApp Business App | Order notifications (manual) | Free |
| Razorpay | Payments | 2% all methods |

---

## 2. Docker Setup

### Dockerfile

```dockerfile
# Multi-stage build: Frontend → Backend → Production

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend
FROM eclipse-temurin:21-jdk-alpine AS backend-build
WORKDIR /app/backend
COPY backend/pom.xml ./
COPY backend/src ./src
COPY backend/.mvn ./.mvn
COPY backend/mvnw ./
RUN chmod +x mvnw && ./mvnw package -DskipTests

# Stage 3: Production Image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy backend JAR
COPY --from=backend-build /app/backend/target/*.jar app.jar

# Copy frontend build to static resources
COPY --from=frontend-build /app/frontend/dist ./static

# JVM options for containers
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

### Docker Compose (Local Development)

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=dev
    env_file:
      - ./backend/.env
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

### Docker Commands

```bash
# Build image
docker build -t anjoriarts/app:latest .

# Run with env file
docker run -p 8080:8080 --env-file backend/.env anjoriarts/app:latest

# Run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop
docker-compose down

# Push to Docker Hub
docker login
docker push anjoriarts/app:latest
```

---

## 3. Environment Variables

### Complete Reference

```bash
# ============================================
# DATABASE (Neon PostgreSQL)
# ============================================
DB_URL=jdbc:postgresql://ep-xxx.us-east-2.aws.neon.tech/anjori_prod?sslmode=require
DB_USERNAME=your_username
DB_PASSWORD=your_password

# ============================================
# JWT AUTHENTICATION
# ============================================
JWT_SECRET=your-super-secret-key-at-least-32-characters-long
JWT_ACCESS_EXPIRATION=900000          # 15 minutes
JWT_REFRESH_EXPIRATION=2592000000     # 30 days

# ============================================
# REDIS (Optional - for distributed caching)
# ============================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ============================================
# CLOUDINARY (Image CDN)
# ============================================
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ============================================
# EMAIL (Zoho Mail)
# ============================================
MAIL_HOST=smtp.zoho.in
MAIL_PORT=587
MAIL_USERNAME=orders@anjoriarts.com
MAIL_PASSWORD=your_app_password

# ============================================
# OAUTH2 (Google Login)
# ============================================
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

# ============================================
# RAZORPAY (Payments)
# ============================================
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=xxx

# ============================================
# 2FACTOR (Phone OTP)
# ============================================
TWOFACTOR_API_KEY=your_api_key
TWOFACTOR_OTP_LENGTH=6
TWOFACTOR_OTP_EXPIRY=300

# ============================================
# WHATSAPP (Phase 1: Manual via Business App)
# ============================================
# No API keys needed for Phase 1 (manual sending)
# When scaling, use Interakt or AiSensy:
# INTERAKT_API_KEY=your_api_key
# INTERAKT_PHONE_NUMBER=your_verified_number

# ============================================
# GST INVOICE
# ============================================
INVOICE_SELLER_NAME=Anjori Arts
INVOICE_SELLER_ADDRESS=Your Address, City, State - PIN
INVOICE_SELLER_GSTIN=YOUR_GSTIN_NUMBER
INVOICE_HSN_CODE=9701

# ============================================
# APPLICATION
# ============================================
SPRING_PROFILES_ACTIVE=prod
FRONTEND_URL=https://anjoriarts.com
CORS_ORIGINS=https://anjoriarts.com
```

---

## 4. Service Configuration

### 4.1 Neon (PostgreSQL)

**Setup:**
1. Create account at [neon.tech](https://neon.tech)
2. Create project "anjori-arts"
3. Create branches: `main` (prod), `dev`
4. Copy connection string

**Connection String Format:**
```
jdbc:postgresql://ep-xxx.region.aws.neon.tech/anjori_prod?sslmode=require
```

**Best Practices:**
- Use connection pooling (Neon has built-in PgBouncer)
- Enable auto-suspend for dev branch
- Set up daily backups (automatic)

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

### 4.3 Zoho Mail

**Setup:**

1. **Sign up** at [zoho.com/mail](https://www.zoho.com/mail)
2. **Add domain:** anjoriarts.com
3. **Verify domain** with TXT record

**DNS Records:**

| Type | Host | Value |
|------|------|-------|
| TXT | @ | zoho-verification=xxx |
| MX | @ | mx.zoho.in (Priority: 10) |
| MX | @ | mx2.zoho.in (Priority: 20) |
| TXT | @ | v=spf1 include:zoho.in ~all |

**DKIM Setup:**
1. Go to Email Authentication in Zoho admin
2. Add DKIM TXT record provided
3. Verify DKIM status

**Create Email Addresses:**
- orders@anjoriarts.com (order notifications)
- support@anjoriarts.com (customer support)
- noreply@anjoriarts.com (automated emails)

**SMTP Settings:**
```
Host: smtp.zoho.in
Port: 587
Security: TLS
Username: orders@anjoriarts.com
Password: (app-specific password)
```

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
