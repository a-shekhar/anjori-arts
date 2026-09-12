# Anjori Arts - Database Design

> **Version:** 2.0.0  
> **Last Updated:** September 2026  
> **Database Provider:** Supabase Managed PostgreSQL  
> **Primary Schema:** `arts`  
> **Security Model:** Supabase Row Level Security (RLS) + Service Role Client

---

## Table of Contents

1. [Overview](#1-overview)
2. [Entity Relationship Diagram](#2-entity-relationship-diagram)
3. [Table Descriptions](#3-table-descriptions)
4. [Indexes & Performance](#4-indexes--performance)
5. [Data Types & Conventions](#5-data-types--conventions)

---

## 1. Overview

### Database Structure (`arts` Schema)

| Category | Tables |
|----------|--------|
| **User & Access Management** | `profiles` (linked to `auth.users`), `user_addresses`, `wishlists`, `cart_items` |
| **Product Catalog & Taxonomy** | `artworks`, `artwork_variants`, `artwork_mediums`, `categories`, `surfaces`, `mediums` |
| **Orders & Commerce** | `orders`, `order_items` |
| **Bespoke Commissions & CRM** | `custom_orders`, `custom_order_items`, `inquiries` |
| **Content & Social Proof** | `testimonials`, `blog_posts` |

---

## 2. Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER MANAGEMENT                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐         ┌──────────────────┐                             │
│  │    users     │ 1 ───┬──► user_addresses   │                             │
│  │              │   n  │  │                  │                             │
│  │  id (PK)     │      │  │  id (PK)         │                             │
│  │  email       │      │  │  user_id (FK)    │                             │
│  │  first_name  │      │  │  address_line    │                             │
│  │  last_name   │      │  │  city, state     │                             │
│  │  phone       │      │  │  pincode, country│                             │
│  │  country_code│      │  │  country_code    │                             │
│  └──────────────┘      │  └──────────────────┘                             │
│         │              │                                                    │
│         │ 1            │  ┌──────────────────┐                             │
│         └──────────────┼──► user_sessions    │                             │
│                     n  │  │                  │                             │
│                        │  │  id (PK)         │                             │
│                        │  │  user_id (FK)    │                             │
│                        │  │  refresh_token   │                             │
│                        │  └──────────────────┘                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRODUCT CATALOG                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐       ┌──────────────────┐       ┌──────────────────┐    │
│  │  categories  │       │    artworks      │       │  artwork_images  │    │
│  │              │ 1 ──► │                  │ 1 ──► │                  │    │
│  │  id (PK)     │   n   │  id (PK)         │   n   │  id (PK)         │    │
│  │  name        │       │  category_id(FK) │       │  artwork_id (FK) │    │
│  │  slug        │       │  title, price    │       │  image_url       │    │
│  └──────────────┘       │  medium, surface │       │  is_primary      │    │
│                         │  height_cm       │       └──────────────────┘    │
│  ┌──────────────┐       │  width_cm        │                               │
│  │  art_styles  │ n ──► │  ...             │                               │
│  │              │   n   └──────────────────┘                               │
│  │  id (PK)     │              │                                           │
│  │  name        │     (many-to-many via artwork_styles)                    │
│  └──────────────┘                                                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           ORDERS & PAYMENTS                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐       ┌──────────────────┐       ┌──────────────────┐    │
│  │    users     │       │     orders       │       │   order_items    │    │
│  │              │ 1 ──► │                  │ 1 ──► │                  │    │
│  │              │   n   │  id (PK)         │   n   │  id (PK)         │    │
│  └──────────────┘       │  user_id (FK)    │       │  order_id (FK)   │    │
│                         │  order_number    │       │  artwork_id (FK) │    │
│  ┌──────────────┐       │  status          │       │  quantity        │    │
│  │   coupons    │ 1 ──► │  coupon_id (FK)  │       │  price           │    │
│  │              │   n   │  total_amount    │       └──────────────────┘    │
│  └──────────────┘       │  ...             │                               │
│                         └──────────────────┘                               │
│                                │                                           │
│                                │ 1                                         │
│                                ▼ n                                         │
│                         ┌──────────────────┐                               │
│                         │    payments      │                               │
│                         │                  │                               │
│                         │  id (PK)         │                               │
│                         │  order_id (FK)   │                               │
│                         │  razorpay_id     │                               │
│                         │  status          │                               │
│                         └──────────────────┘                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           MARKETING & SUPPORT                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────┐    ┌──────────────────────┐                      │
│  │ newsletter_subscribers│    │  contact_submissions │                      │
│  │                      │    │                      │                      │
│  │  id (PK)             │    │  id (PK)             │                      │
│  │  email (UNIQUE)      │    │  name, email         │                      │
│  │  status              │    │  subject, message    │                      │
│  │  unsubscribe_token   │    │  status              │                      │
│  └──────────────────────┘    └──────────────────────┘                      │
│                                                                             │
│  ┌──────────────────────┐    ┌──────────────────────┐                      │
│  │      coupons         │    │    testimonials      │                      │
│  │                      │    │                      │                      │
│  │  id (PK)             │    │  id (PK)             │                      │
│  │  code (UNIQUE)       │    │  name, location      │                      │
│  │  discount_type       │    │  rating, message     │                      │
│  │  discount_value      │    │  artwork_purchased   │                      │
│  │  first_order_only    │    │  status              │                      │
│  └──────────────────────┘    └──────────────────────┘                      │
│         ▲                                                                   │
│         │ 1               ┌──────────────────────┐                         │
│         └─────────────────│    coupon_usage      │                         │
│                        n  │                      │                         │
│                           │  coupon_id (FK)      │                         │
│                           │  user_id (FK)        │                         │
│                           │  order_id (FK)       │                         │
│                           └──────────────────────┘                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Table Descriptions

### 3.1 User Management

#### `users`
Stores registered user accounts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PK | Auto-increment ID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Login email |
| password_hash | VARCHAR(255) | | BCrypt hashed password (NULL for OAuth) |
| first_name | VARCHAR(50) | NOT NULL | First name (for personalized emails) |
| last_name | VARCHAR(50) | | Last name (optional) |
| phone | VARCHAR(15) | UNIQUE | Phone number (without country code) |
| country_code | VARCHAR(5) | DEFAULT '+91' | Phone country code |
| phone_verified | BOOLEAN | DEFAULT false | OTP verification status |
| email_verified | BOOLEAN | DEFAULT false | Email verification status |
| avatar_url | VARCHAR(500) | | Profile picture URL |
| role | VARCHAR(20) | DEFAULT 'USER' | USER, ADMIN |
| auth_provider | VARCHAR(20) | DEFAULT 'LOCAL' | LOCAL, GOOGLE |
| is_active | BOOLEAN | DEFAULT true | Soft delete flag |
| created_at | TIMESTAMP | DEFAULT NOW() | Registration timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Note:** Full display name = `first_name + ' ' + last_name`. Use `first_name` for personalized emails like "Hi Priya!".

#### `user_addresses`
Stores multiple shipping addresses per user.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PK | Auto-increment ID |
| user_id | BIGINT | FK → users.id | Owner reference |
| label | VARCHAR(50) | | "Home", "Office", etc. |
| name | VARCHAR(100) | NOT NULL | Recipient name |
| phone | VARCHAR(15) | NOT NULL | Contact number (without country code) |
| country_code | VARCHAR(5) | DEFAULT '+91' | Phone country code |
| address_line1 | VARCHAR(255) | NOT NULL | Street address |
| address_line2 | VARCHAR(255) | | Apartment, floor, etc. |
| city | VARCHAR(100) | NOT NULL | City name |
| state | VARCHAR(100) | NOT NULL | State name |
| pincode | VARCHAR(6) | NOT NULL | 6-digit PIN code |
| country | VARCHAR(100) | DEFAULT 'India' | Country name |
| is_default | BOOLEAN | DEFAULT false | Default shipping address |
| created_at | TIMESTAMP | DEFAULT NOW() | |

#### `user_sessions`
Manages JWT refresh tokens for persistent login.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PK | Auto-increment ID |
| user_id | BIGINT | FK → users.id | Session owner |
| refresh_token | VARCHAR(500) | NOT NULL | JWT refresh token |
| device_info | VARCHAR(255) | | Browser/device identifier |
| ip_address | VARCHAR(45) | | Session origin IP |
| expires_at | TIMESTAMP | NOT NULL | Token expiration |
| created_at | TIMESTAMP | DEFAULT NOW() | |

---

### 3.2 Product Catalog

#### `categories`
Art categories for filtering (e.g., Madhubani, Tanjore).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PK | Auto-increment ID |
| name | VARCHAR(50) | NOT NULL | Display name |
| slug | VARCHAR(50) | UNIQUE, NOT NULL | URL-friendly name |
| description | TEXT | | Category description |
| image_url | VARCHAR(500) | | Category thumbnail |
| display_order | INT | DEFAULT 0 | Sort order on UI |
| is_active | BOOLEAN | DEFAULT true | Show/hide category |
| created_at | TIMESTAMP | DEFAULT NOW() | |

#### `art_styles`
Art styles for tagging (e.g., Traditional, Contemporary).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PK | Auto-increment ID |
| name | VARCHAR(50) | NOT NULL | Style name |
| slug | VARCHAR(50) | UNIQUE, NOT NULL | URL-friendly name |
| created_at | TIMESTAMP | DEFAULT NOW() | |

#### `artworks`
Main product table for all artworks.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PK | Auto-increment ID |
| category_id | BIGINT | FK → categories.id | Art category |
| title | VARCHAR(200) | NOT NULL | Artwork title |
| slug | VARCHAR(200) | UNIQUE, NOT NULL | URL-friendly title |
| description | TEXT | | Detailed description |
| story | TEXT | | Artist's story behind the piece |
| price | DECIMAL(10,2) | NOT NULL | Selling price in INR |
| compare_price | DECIMAL(10,2) | | Original/MRP for showing discount (strikethrough price) |
| sku | VARCHAR(50) | UNIQUE | Stock keeping unit (e.g., MBP-2026-001) |
| dimension_label | VARCHAR(100) | | Display text: "24 x 36 inches" or "Large" |
| height_cm | DECIMAL(6,2) | | Height in centimeters |
| width_cm | DECIMAL(6,2) | | Width in centimeters |
| depth_cm | DECIMAL(6,2) | | Depth in cm (for framed/3D works) |
| medium | VARCHAR(100) | | Paint/material: "Acrylic", "Natural Dyes" |
| surface | VARCHAR(100) | | What it's painted on: "Canvas", "Handmade Paper", "Silk" |
| is_framed | BOOLEAN | DEFAULT false | Includes frame |
| is_original | BOOLEAN | DEFAULT true | Original vs print |
| stock_quantity | INT | DEFAULT 1 | Available quantity |
| status | VARCHAR(20) | DEFAULT 'DRAFT' | DRAFT, ACTIVE, SOLD, ARCHIVED |
| is_featured | BOOLEAN | DEFAULT false | Show on homepage |
| view_count | INT | DEFAULT 0 | Page views |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| updated_at | TIMESTAMP | DEFAULT NOW() | |

**SKU Format:** `{CATEGORY}-{YEAR}-{SERIAL}` e.g., `MBP-2026-001` (Madhubani Painting)

#### `artwork_images`
Multiple images per artwork (gallery view).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PK | Auto-increment ID |
| artwork_id | BIGINT | FK → artworks.id | Parent artwork |
| image_url | VARCHAR(500) | NOT NULL | Cloudinary URL |
| thumbnail_url | VARCHAR(500) | | Optimized thumbnail |
| alt_text | VARCHAR(200) | | Accessibility text |
| display_order | INT | DEFAULT 0 | Image order |
| is_primary | BOOLEAN | DEFAULT false | Main display image |
| created_at | TIMESTAMP | DEFAULT NOW() | |

#### `artwork_styles`
Many-to-many: artworks ↔ art_styles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| artwork_id | BIGINT | FK, PK | Artwork reference |
| style_id | BIGINT | FK, PK | Style reference |

---

### 3.3 Orders & Payments

#### `orders`
Customer orders.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PK | Auto-increment ID |
| order_number | VARCHAR(20) | UNIQUE, NOT NULL | Human-readable: "AA-2026-00001" |
| user_id | BIGINT | FK → users.id | NULL for guest orders |
| guest_email | VARCHAR(255) | | Email for guest checkout |
| guest_phone | VARCHAR(15) | | Phone for guest checkout |
| coupon_id | BIGINT | FK → coupons.id | Applied discount |
| subtotal | DECIMAL(10,2) | NOT NULL | Items total before discount |
| discount_amount | DECIMAL(10,2) | DEFAULT 0 | Coupon discount |
| shipping_amount | DECIMAL(10,2) | DEFAULT 0 | Shipping charges |
| total_amount | DECIMAL(10,2) | NOT NULL | Final payable amount |
| status | VARCHAR(30) | DEFAULT 'PENDING' | See status values below |
| shipping_name | VARCHAR(100) | NOT NULL | Recipient name |
| shipping_phone | VARCHAR(15) | NOT NULL | Recipient phone |
| shipping_address | TEXT | NOT NULL | Full address |
| shipping_city | VARCHAR(100) | NOT NULL | City |
| shipping_state | VARCHAR(100) | NOT NULL | State |
| shipping_pincode | VARCHAR(6) | NOT NULL | PIN code |
| tracking_number | VARCHAR(100) | | Courier tracking ID |
| tracking_url | VARCHAR(500) | | Courier tracking link |
| notes | TEXT | | Customer notes |
| admin_notes | TEXT | | Internal notes |
| shipped_at | TIMESTAMP | | Shipping timestamp |
| delivered_at | TIMESTAMP | | Delivery timestamp |
| cancelled_at | TIMESTAMP | | Cancellation timestamp |
| created_at | TIMESTAMP | DEFAULT NOW() | Order placed timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | |

**Order Status Values:**
- `PENDING` - Order placed, awaiting payment
- `PAYMENT_FAILED` - Payment attempt failed
- `CONFIRMED` - Payment successful
- `PROCESSING` - Being prepared
- `SHIPPED` - Handed to courier
- `DELIVERED` - Received by customer
- `CANCELLED` - Order cancelled
- `RETURN_REQUESTED` - Return initiated
- `RETURNED` - Return completed
- `REFUNDED` - Refund processed

#### `order_items`
Individual items within an order.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PK | Auto-increment ID |
| order_id | BIGINT | FK → orders.id | Parent order |
| artwork_id | BIGINT | FK → artworks.id | Purchased artwork |
| quantity | INT | DEFAULT 1 | Number of items |
| unit_price | DECIMAL(10,2) | NOT NULL | Price at purchase time |
| total_price | DECIMAL(10,2) | NOT NULL | quantity × unit_price |
| created_at | TIMESTAMP | DEFAULT NOW() | |

#### `payments`
Payment transactions via Razorpay.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PK | Auto-increment ID |
| order_id | BIGINT | FK → orders.id | Related order |
| razorpay_order_id | VARCHAR(100) | | Razorpay order ID |
| razorpay_payment_id | VARCHAR(100) | | Razorpay payment ID |
| razorpay_signature | VARCHAR(255) | | Payment verification |
| amount | DECIMAL(10,2) | NOT NULL | Payment amount |
| currency | VARCHAR(3) | DEFAULT 'INR' | Currency code |
| method | VARCHAR(30) | | UPI, CARD, NETBANKING |
| status | VARCHAR(20) | DEFAULT 'PENDING' | PENDING, SUCCESS, FAILED, REFUNDED |
| error_code | VARCHAR(50) | | Failure reason code |
| error_description | TEXT | | Failure details |
| refund_id | VARCHAR(100) | | Razorpay refund ID |
| refunded_at | TIMESTAMP | | Refund timestamp |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| updated_at | TIMESTAMP | DEFAULT NOW() | |

#### `shipping_config`
Configurable shipping rates.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PK | Auto-increment ID |
| name | VARCHAR(50) | NOT NULL | 'standard', 'express' |
| display_name | VARCHAR(100) | NOT NULL | "Standard Delivery" |
| base_rate | DECIMAL(10,2) | NOT NULL | Shipping charge |
| free_threshold | DECIMAL(10,2) | | Free shipping above this amount |
| estimated_days_min | INT | | Minimum delivery days |
| estimated_days_max | INT | | Maximum delivery days |
| is_active | BOOLEAN | DEFAULT true | Enable/disable option |
| created_at | TIMESTAMP | DEFAULT NOW() | |

---

### 3.4 Custom Orders

#### `custom_orders`
Commission/custom art requests.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PK | Auto-increment ID |
| request_number | VARCHAR(20) | UNIQUE | "CR-2026-00001" |
| user_id | BIGINT | FK → users.id | NULL for guest |
| name | VARCHAR(100) | NOT NULL | Customer name |
| email | VARCHAR(255) | NOT NULL | Contact email |
| phone | VARCHAR(15) | NOT NULL | Contact phone |
| art_type | VARCHAR(50) | | Madhubani, Tanjore, etc. |
| size_preference | VARCHAR(100) | | Preferred dimensions |
| budget_min | DECIMAL(10,2) | | Budget range start |
| budget_max | DECIMAL(10,2) | | Budget range end |
| description | TEXT | NOT NULL | Detailed requirements |
| deadline | DATE | | Desired completion date |
| status | VARCHAR(30) | DEFAULT 'NEW' | See status values below |
| quoted_price | DECIMAL(10,2) | | Artist's quote |
| admin_notes | TEXT | | Internal notes |
| order_id | BIGINT | FK → orders.id | Linked order after acceptance |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| updated_at | TIMESTAMP | DEFAULT NOW() | |

**Custom Order Status Values:**
- `NEW` - Request submitted
- `REVIEWING` - Artist reviewing
- `QUOTED` - Price quote sent
- `ACCEPTED` - Customer accepted quote
- `IN_PROGRESS` - Work started
- `COMPLETED` - Artwork ready
- `DELIVERED` - Shipped/delivered
- `CANCELLED` - Request cancelled
- `REJECTED` - Request declined by artist

#### `custom_order_images`
Reference images uploaded with custom requests.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PK | Auto-increment ID |
| custom_order_id | BIGINT | FK → custom_orders.id | Parent request |
| image_url | VARCHAR(500) | NOT NULL | Cloudinary URL |
| created_at | TIMESTAMP | DEFAULT NOW() | |

---

### 3.5 Marketing

#### `coupons`
Discount codes and promotions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PK | Auto-increment ID |
| code | VARCHAR(20) | UNIQUE, NOT NULL | "WELCOME10" |
| description | VARCHAR(200) | | Internal description |
| discount_type | VARCHAR(20) | NOT NULL | PERCENTAGE, FIXED |
| discount_value | DECIMAL(10,2) | NOT NULL | 10 for 10%, 100 for ₹100 |
| min_order_amount | DECIMAL(10,2) | | Minimum cart value |
| max_discount | DECIMAL(10,2) | | Cap for percentage discounts |
| free_shipping | BOOLEAN | DEFAULT false | Waive shipping charges |
| usage_limit | INT | | Total uses allowed (NULL = unlimited) |
| usage_count | INT | DEFAULT 0 | Current usage count |
| per_user_limit | INT | DEFAULT 1 | Uses per customer |
| first_order_only | BOOLEAN | DEFAULT false | New customers only |
| valid_from | TIMESTAMP | | Start date |
| valid_until | TIMESTAMP | | Expiry date |
| is_active | BOOLEAN | DEFAULT true | Enable/disable |
| created_at | TIMESTAMP | DEFAULT NOW() | |

#### `coupon_usage`
Track coupon usage per customer.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PK | Auto-increment ID |
| coupon_id | BIGINT | FK → coupons.id | Used coupon |
| user_id | BIGINT | FK → users.id | NULL for guest |
| guest_email | VARCHAR(255) | | Guest identifier |
| order_id | BIGINT | FK → orders.id | Order where applied |
| used_at | TIMESTAMP | DEFAULT NOW() | |

#### `newsletter_subscribers`
Email newsletter subscriptions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PK | Auto-increment ID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Subscriber email |
| status | VARCHAR(20) | DEFAULT 'ACTIVE' | ACTIVE, UNSUBSCRIBED, BOUNCED |
| unsubscribe_token | UUID | DEFAULT gen_random_uuid() | One-click unsubscribe link |
| subscribed_at | TIMESTAMP | DEFAULT NOW() | Subscription timestamp |
| unsubscribed_at | TIMESTAMP | | Unsubscribe timestamp |
| ip_address | VARCHAR(45) | | Subscription origin |
| created_at | TIMESTAMP | DEFAULT NOW() | |

---

### 3.6 Reviews & Support

#### `reviews`
Customer reviews on purchased artworks.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PK | Auto-increment ID |
| artwork_id | BIGINT | FK → artworks.id | Reviewed artwork |
| order_id | BIGINT | FK → orders.id | Purchase reference |
| user_id | BIGINT | FK → users.id | Reviewer |
| rating | INT | NOT NULL, CHECK 1-5 | Star rating |
| title | VARCHAR(200) | | Review headline |
| content | TEXT | | Review body |
| status | VARCHAR(20) | DEFAULT 'PENDING' | PENDING, APPROVED, REJECTED |
| admin_notes | TEXT | | Rejection reason |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| updated_at | TIMESTAMP | DEFAULT NOW() | |

#### `review_images`
Photos attached to reviews.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PK | Auto-increment ID |
| review_id | BIGINT | FK → reviews.id | Parent review |
| image_url | VARCHAR(500) | NOT NULL | Cloudinary URL |
| created_at | TIMESTAMP | DEFAULT NOW() | |

#### `testimonials`
Customer testimonials for homepage/testimonials page.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PK | Auto-increment ID |
| user_id | BIGINT | FK → users.id | NULL if submitted by guest or added manually |
| name | VARCHAR(100) | NOT NULL | Display name |
| location | VARCHAR(100) | NOT NULL | City, State |
| rating | INT | NOT NULL, CHECK 1-5 | Star rating |
| message | TEXT | NOT NULL | Testimonial content (min 20 chars) |
| artwork_purchased | VARCHAR(200) | | Which artwork they bought |
| is_featured | BOOLEAN | DEFAULT false | Show on homepage |
| display_order | INT | DEFAULT 0 | Sort order for featured |
| status | VARCHAR(20) | DEFAULT 'PENDING' | PENDING, APPROVED, REJECTED |
| admin_notes | TEXT | | Internal notes |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| updated_at | TIMESTAMP | DEFAULT NOW() | |

**Status Values:**
- `PENDING` - Awaiting admin review
- `APPROVED` - Visible on website
- `REJECTED` - Not displayed

#### `contact_submissions`
Contact form submissions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PK | Auto-increment ID |
| name | VARCHAR(100) | NOT NULL | Sender name |
| email | VARCHAR(255) | NOT NULL | Sender email |
| phone | VARCHAR(15) | | Sender phone |
| subject | VARCHAR(50) | | Dropdown selection |
| message | TEXT | NOT NULL | Message content |
| status | VARCHAR(20) | DEFAULT 'NEW' | NEW, READ, REPLIED, ARCHIVED |
| admin_notes | TEXT | | Internal notes |
| replied_at | TIMESTAMP | | Response timestamp |
| ip_address | VARCHAR(45) | | Submission origin |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| updated_at | TIMESTAMP | DEFAULT NOW() | |

**Subject Options:**
- General Inquiry
- Custom Order
- Order Status
- Shipping Question
- Return/Refund
- Collaboration
- Other

---

### 3.7 System Tables

#### `otp_verifications`
Phone/email OTP verification tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PK | Auto-increment ID |
| identifier | VARCHAR(255) | NOT NULL | Phone or email |
| identifier_type | VARCHAR(10) | NOT NULL | PHONE, EMAIL |
| otp_hash | VARCHAR(255) | NOT NULL | Hashed OTP |
| attempts | INT | DEFAULT 0 | Verification attempts |
| is_verified | BOOLEAN | DEFAULT false | Verification status |
| expires_at | TIMESTAMP | NOT NULL | OTP expiration |
| created_at | TIMESTAMP | DEFAULT NOW() | |

**Rate Limits:**
- Max 3 OTPs per 10 minutes per identifier
- Max 5 verification attempts per OTP
- OTP expires in 5 minutes

#### `wishlist`
User saved artworks.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PK | Auto-increment ID |
| user_id | BIGINT | FK → users.id | Owner |
| artwork_id | BIGINT | FK → artworks.id | Saved artwork |
| created_at | TIMESTAMP | DEFAULT NOW() | |

**Unique Constraint:** (user_id, artwork_id)

---

## 4. Indexes & Performance

### Primary Indexes (Auto-created)
- All `id` columns have automatic B-tree indexes

### Recommended Additional Indexes

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);

-- Artworks
CREATE INDEX idx_artworks_category ON artworks(category_id);
CREATE INDEX idx_artworks_status ON artworks(status);
CREATE INDEX idx_artworks_slug ON artworks(slug);
CREATE INDEX idx_artworks_featured ON artworks(is_featured) WHERE is_featured = true;

-- Orders
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- Newsletter
CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_token ON newsletter_subscribers(unsubscribe_token);

-- Contact
CREATE INDEX idx_contact_status ON contact_submissions(status);
CREATE INDEX idx_contact_created ON contact_submissions(created_at DESC);

-- Testimonials
CREATE INDEX idx_testimonials_status ON testimonials(status);
CREATE INDEX idx_testimonials_featured ON testimonials(is_featured) WHERE is_featured = true;
```

---

## 5. Data Types & Conventions

### Naming Conventions
- Tables: `snake_case`, plural (`users`, `orders`)
- Columns: `snake_case`
- Primary keys: `id`
- Foreign keys: `{table_singular}_id` (e.g., `user_id`)

### Common Field Types
| Purpose | Type | Example |
|---------|------|---------|
| ID | BIGSERIAL | Auto-increment |
| Money | DECIMAL(10,2) | Prices in INR |
| Email | VARCHAR(255) | Standard length |
| Phone | VARCHAR(15) | Without country code (10 digits for India) |
| Country Code | VARCHAR(5) | "+91", "+1", etc. |
| URL | VARCHAR(500) | Image/tracking URLs |
| Status | VARCHAR(20-30) | Enum-like values |
| Timestamps | TIMESTAMP | Without timezone |
| Dimensions | DECIMAL(6,2) | Height/width in cm |

### Soft Delete Pattern
Use `is_active` BOOLEAN instead of actual DELETE for:
- `users`
- `artworks`
- `categories`

### Audit Fields
All tables include:
- `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
- `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP` (where applicable)

---

## 6. Design Decisions

### Status Fields: VARCHAR vs Lookup Tables

**Decision:** Use `VARCHAR` with `CHECK` constraints for status fields instead of separate lookup tables.

**Implementation:**
```sql
status VARCHAR(20) DEFAULT 'NEW' CHECK (status IN ('NEW', 'READ', 'REPLIED', 'ARCHIVED'))
```

**Reasoning:**

| Factor | VARCHAR Approach | Lookup Table |
|--------|------------------|--------------|
| Storage | ~8-20 bytes | 4-8 bytes (FK) |
| Query speed | Faster (no JOIN) | Requires JOIN |
| Code complexity | Simpler | More complex |
| Adding new status | ALTER TABLE | INSERT row |
| UI colors/labels | Frontend config | DB + API |

**Why VARCHAR for Anjori Arts:**
1. **Fixed statuses** - Status values won't change frequently
2. **No metadata in DB** - Colors and labels are UI concerns, handled in frontend
3. **Single application** - No need for shared status definitions across apps
4. **Simplicity** - No extra tables, no JOINs, cleaner queries

**Frontend Handling:**
- Status display (labels, colors) defined in `frontend/src/config/statusConfig.js`
- Backend validates with CHECK constraint
- Frontend maps status value to UI properties

**When to use Lookup Tables instead:**
- Multi-language support (store translations in DB)
- Dynamic statuses (admin can add new statuses from UI)
- Multiple applications sharing same database
- Need to track status metadata history

**Status values used:**

| Table | Statuses |
|-------|----------|
| orders | PENDING, PAYMENT_FAILED, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURN_REQUESTED, RETURNED, REFUNDED |
| custom_orders | NEW, REVIEWING, QUOTED, ACCEPTED, IN_PROGRESS, COMPLETED, DELIVERED, CANCELLED, REJECTED |
| contact_submissions | NEW, READ, REPLIED, ARCHIVED |
| reviews | PENDING, APPROVED, REJECTED |
| testimonials | PENDING, APPROVED, REJECTED |
| payments | PENDING, SUCCESS, FAILED, REFUNDED |
| newsletter_subscribers | ACTIVE, UNSUBSCRIBED, BOUNCED |

---

## Related Documents

- [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) - High-level architecture
- [schema.sql](../backend/src/main/resources/db/schema.sql) - Executable SQL
- [statusConfig.js](../frontend/src/config/statusConfig.js) - Frontend status UI config
