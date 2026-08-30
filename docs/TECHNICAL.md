# Anjori Arts - Technical Document

> **Version:** 1.0.0  
> **Last Updated:** March 1, 2026  
> **API Base URL:** `/api/v1`  
> **Audience:** Developers

---

## Table of Contents

1. [API Overview](#1-api-overview)
2. [Authentication](#2-authentication)
3. [Endpoints by Feature](#3-endpoints-by-feature)
4. [Common Patterns](#4-common-patterns)
5. [Error Handling](#5-error-handling)
6. [Code Structure](#6-code-structure)
7. [Best Practices](#7-best-practices)

---

## 1. API Overview

### Base URLs

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:8080/api/v1` |
| Production | `https://api.anjoriarts.com/api/v1` |

### Content Type

```
Content-Type: application/json
```

### Standard Response Format

**Success:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2026-03-01T10:30:00Z"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  },
  "timestamp": "2026-03-01T10:30:00Z"
}
```

---

## 2. Authentication

### JWT Flow

```
┌─────────┐                              ┌─────────┐
│ Client  │                              │ Server  │
└────┬────┘                              └────┬────┘
     │                                        │
     │  POST /auth/login (email, password)    │
     │───────────────────────────────────────►│
     │                                        │
     │  200 OK + accessToken                  │
     │  Set-Cookie: refreshToken (httpOnly)   │
     │◄───────────────────────────────────────│
     │                                        │
     │  GET /api/v1/user/profile              │
     │  Authorization: Bearer {accessToken}   │
     │───────────────────────────────────────►│
     │                                        │
     │  200 OK + user data                    │
     │◄───────────────────────────────────────│
     │                                        │
     │  POST /auth/refresh (cookie sent auto) │
     │───────────────────────────────────────►│
     │                                        │
     │  200 OK + new accessToken              │
     │◄───────────────────────────────────────│
```

### Token Configuration

| Token | Storage | Expiry | Purpose |
|-------|---------|--------|---------|
| Access Token | Memory/LocalStorage | 15 min | API authentication |
| Refresh Token | httpOnly Cookie | 30 days | Get new access token |

### Auth Endpoints

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER"
    }
  }
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
Cookie: refreshToken=xxx
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer {accessToken}
```

---

## 2.1 Phone Verification (OTP)

Phone verification is **required** for all checkout flows (guest and registered users).

### OTP Flow

```
┌─────────┐                              ┌─────────┐                    ┌─────────┐
│ Client  │                              │ Server  │                    │ 2Factor │
└────┬────┘                              └────┬────┘                    └────┬────┘
     │                                        │                              │
     │  POST /otp/send { phone }              │                              │
     │───────────────────────────────────────►│                              │
     │                                        │  Send OTP via API            │
     │                                        │─────────────────────────────►│
     │                                        │                              │
     │  200 OK { expiresIn: 300 }             │◄─────────────────────────────│
     │◄───────────────────────────────────────│                              │
     │                                        │                              │
     │  POST /otp/verify { phone, otp }       │                              │
     │───────────────────────────────────────►│                              │
     │                                        │                              │
     │  200 OK { verified, token }            │                              │
     │◄───────────────────────────────────────│                              │
     │                                        │                              │
     │  POST /orders { ..., phoneToken }      │                              │
     │───────────────────────────────────────►│                              │
```

### Rate Limiting

| Limit | Value | Description |
|-------|-------|-------------|
| OTPs per phone | 3 per 10 min | Prevents OTP bombing |
| Verify attempts | 5 per OTP | Prevents brute force |
| OTP expiry | 5 minutes | Security timeout |

### OTP Endpoints

#### Send OTP
```http
POST /api/v1/otp/send
Content-Type: application/json

{
  "phoneNumber": "+919876543210"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "expiresInSeconds": 300,
    "attemptsRemaining": 3
  }
}
```

**Rate Limited Response (429):**
```json
{
  "success": false,
  "message": "Too many OTP requests. Please try again in 8 minutes.",
  "data": {
    "retryAfterSeconds": 480
  }
}
```

#### Verify OTP
```http
POST /api/v1/otp/verify
Content-Type: application/json

{
  "phoneNumber": "+919876543210",
  "otp": "123456"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Phone verified successfully",
  "data": {
    "verified": true,
    "phoneVerificationToken": "pv_abc123xyz..."
  }
}
```

**Failed Response (400):**
```json
{
  "success": false,
  "message": "Invalid OTP",
  "data": {
    "attemptsRemaining": 2
  }
}
```

**Exhausted Attempts (400):**
```json
{
  "success": false,
  "message": "Too many failed attempts. Please request a new OTP."
}
```

---

## 3. Endpoints by Feature

### Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Application health status |
| GET | `/actuator/health` | No | Detailed health (dev only) |

### Artworks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/artworks` | No | List all artworks (paginated) |
| GET | `/artworks/{slug}` | No | Get single artwork by slug |
| GET | `/artworks/featured` | No | Get featured artworks |
| POST | `/admin/artworks` | Admin | Create artwork |
| PUT | `/admin/artworks/{id}` | Admin | Update artwork |
| DELETE | `/admin/artworks/{id}` | Admin | Delete artwork |

#### Get Artworks
```http
GET /api/v1/artworks?page=0&size=12&sort=createdAt,desc&type=painting&medium=acrylic
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | int | 0 | Page number (0-indexed) |
| size | int | 12 | Items per page |
| sort | string | createdAt,desc | Sort field and direction |
| type | string | - | Filter by type |
| medium | string | - | Filter by medium |
| surface | string | - | Filter by surface |
| minPrice | int | - | Minimum price |
| maxPrice | int | - | Maximum price |
| search | string | - | Search in title/description |

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "slug": "sunrise-mandala",
        "title": "Sunrise Mandala",
        "type": "MANDALA",
        "medium": "ACRYLIC",
        "surface": "CANVAS",
        "basePrice": 2500,
        "thumbnail": "https://res.cloudinary.com/...",
        "isAvailable": true
      }
    ],
    "page": 0,
    "size": 12,
    "totalElements": 50,
    "totalPages": 5
  }
}
```

### Cart

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/cart` | No* | Get cart contents |
| POST | `/cart/items` | No* | Add item to cart |
| PUT | `/cart/items/{id}` | No* | Update item quantity |
| DELETE | `/cart/items/{id}` | No* | Remove item from cart |
| DELETE | `/cart` | No* | Clear cart |

*Guest cart uses session ID from cookie

#### Add to Cart
```http
POST /api/v1/cart/items
Content-Type: application/json

{
  "artworkId": 1,
  "variantId": 3,
  "quantity": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cart-123",
    "items": [
      {
        "id": 1,
        "artworkId": 1,
        "title": "Sunrise Mandala",
        "variantId": 3,
        "size": "12x16 inches",
        "price": 2500,
        "quantity": 1,
        "thumbnail": "https://..."
      }
    ],
    "subtotal": 2500,
    "itemCount": 1
  }
}
```

### Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/orders` | No* | Create order (checkout) |
| GET | `/orders/{id}` | User | Get order details |
| GET | `/user/orders` | User | Get user's order history |
| GET | `/admin/orders` | Admin | Get all orders |
| PUT | `/admin/orders/{id}/status` | Admin | Update order status |

#### Create Order (Guest Checkout)
```http
POST /api/v1/orders
Content-Type: application/json

{
  "email": "customer@example.com",
  "phone": "+919876543210",
  "phoneVerificationToken": "pv_abc123xyz...",
  "paymentType": "COD_ADVANCE",
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "9876543210",
    "addressLine1": "123 Main St",
    "addressLine2": "Apt 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "landmark": "Near Central Mall"
  },
  "notes": "Please pack carefully"
}
```

**Payment Type Rules:**

| Order Type | Allowed Payment Types | Description |
|------------|----------------------|-------------|
| Regular artwork | `FULL_PREPAID`, `COD_ADVANCE` | COD with 30% advance allowed |
| Custom order | `FULL_PREPAID` only | No COD (can't resell personalized items) |

**Request Validation:**
- `phoneVerificationToken` is **required** - must be obtained from `/otp/verify`
- Token is validated against the phone number
- Token expires after 30 minutes or single use

**Response (COD_ADVANCE):**
```json
{
  "success": true,
  "data": {
    "orderId": "AA-20260301-001",
    "total": 2500,
    "paymentType": "COD_ADVANCE",
    "advanceAmount": 750,
    "codAmount": 1750,
    "razorpayOrderId": "order_xxx",
    "message": "Pay ₹750 now. Remaining ₹1,750 on delivery."
  }
}
```

### User

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/user/profile` | User | Get profile |
| PUT | `/user/profile` | User | Update profile |
| GET | `/user/addresses` | User | Get addresses |
| POST | `/user/addresses` | User | Add address |
| PUT | `/user/addresses/{id}` | User | Update address |
| DELETE | `/user/addresses/{id}` | User | Delete address |

### Custom Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/custom-orders` | No | Submit request |
| GET | `/custom-orders/{id}` | No* | Get request status |
| GET | `/admin/custom-orders` | Admin | List all requests |
| PUT | `/admin/custom-orders/{id}` | Admin | Update request |

### Reviews

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/artworks/{id}/reviews` | No | Get approved reviews for artwork |
| POST | `/artworks/{id}/reviews` | User | Submit review (must have purchased) |
| GET | `/user/reviews` | User | Get user's reviews |
| PUT | `/admin/reviews/{id}` | Admin | Approve/reject/feature review |
| DELETE | `/admin/reviews/{id}` | Admin | Delete review |

#### Submit Review
```http
POST /api/v1/artworks/1/reviews
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "orderId": 123,
  "rating": 5,
  "title": "Beautiful artwork!",
  "comment": "The colors are vibrant and the details are amazing.",
  "images": ["base64_image_1", "base64_image_2"]
}
```

**Validation:**
- User must have a delivered order containing this artwork
- One review per user per artwork
- Rating: 1-5 stars
- Max 3 images per review

**Response:**
```json
{
  "success": true,
  "message": "Review submitted for approval",
  "data": {
    "id": 1,
    "status": "PENDING_APPROVAL"
  }
}
```

#### Get Artwork Reviews
```http
GET /api/v1/artworks/1/reviews?page=0&size=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "rating": 5,
        "title": "Beautiful artwork!",
        "comment": "The colors are vibrant...",
        "images": ["https://cloudinary.com/..."],
        "userName": "John D.",
        "createdAt": "2026-03-01T10:30:00Z",
        "isFeatured": true
      }
    ],
    "averageRating": 4.8,
    "totalReviews": 12,
    "ratingBreakdown": {
      "5": 10,
      "4": 1,
      "3": 1,
      "2": 0,
      "1": 0
    }
  }
}
```

### Coupons

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/coupons/validate` | No | Validate coupon at checkout |
| GET | `/admin/coupons` | Admin | List all coupons |
| POST | `/admin/coupons` | Admin | Create coupon |
| PUT | `/admin/coupons/{id}` | Admin | Update coupon |
| DELETE | `/admin/coupons/{id}` | Admin | Delete coupon |

#### Validate Coupon
```http
POST /api/v1/coupons/validate
Content-Type: application/json

{
  "code": "WELCOME10",
  "cartTotal": 250000
}
```

**Response (Valid):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "code": "WELCOME10",
    "discountType": "PERCENTAGE",
    "discountValue": 10,
    "discountAmount": 25000,
    "message": "10% off applied! You save ₹250"
  }
}
```

**Response (Invalid):**
```json
{
  "success": false,
  "message": "Minimum order amount is ₹500",
  "data": {
    "valid": false,
    "reason": "MIN_ORDER_NOT_MET",
    "minOrderAmount": 50000
  }
}
```

#### Create Coupon (Admin)
```http
POST /api/v1/admin/coupons
Authorization: Bearer {adminToken}
Content-Type: application/json

{
  "code": "DIWALI25",
  "description": "Diwali special - 25% off",
  "discountType": "PERCENTAGE",
  "discountValue": 25,
  "minOrderAmount": 100000,
  "maxDiscount": 50000,
  "maxUses": 100,
  "maxUsesPerUser": 1,
  "validFrom": "2026-10-20T00:00:00Z",
  "validTo": "2026-11-05T23:59:59Z"
}
```

### Newsletter

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/newsletter/subscribe` | No | Subscribe email |
| POST | `/newsletter/unsubscribe` | No | Unsubscribe email |
| GET | `/admin/newsletter/subscribers` | Admin | List subscribers |
| POST | `/admin/newsletter/send` | Admin | Send newsletter (future) |

#### Subscribe
```http
POST /api/v1/newsletter/subscribe
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully subscribed to newsletter"
}
```

#### Unsubscribe
```http
POST /api/v1/newsletter/unsubscribe
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Returns

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/orders/{id}/return` | User | Request return |
| GET | `/user/returns` | User | Get user's return requests |
| PUT | `/admin/returns/{id}` | Admin | Approve/reject return |

#### Request Return
```http
POST /api/v1/orders/123/return
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "reason": "DAMAGED",
  "description": "Frame was cracked during shipping",
  "images": ["base64_image_of_damage"]
}
```

**Validation:**
- Order status must be DELIVERED
- Request within 5 days of delivery (regular orders)
- Custom orders: only for damaged items
- Required fields: reason, description

**Return Reasons:**
- `DAMAGED` - Item damaged during shipping (always allowed)
- `NOT_AS_DESCRIBED` - Item different from listing (regular orders only)
- `CHANGED_MIND` - Changed mind (regular orders, 5-day window)

**Response:**
```json
{
  "success": true,
  "data": {
    "returnId": 1,
    "status": "REQUESTED",
    "message": "Return request submitted. We'll review within 24 hours."
  }
}
```

**Return Policy:**
| Order Type | Condition | Return Allowed |
|------------|-----------|----------------|
| Regular | Damaged | Yes (always) |
| Regular | Within 5 days | Yes |
| Regular | After 5 days | No |
| Custom | Damaged | Yes |
| Custom | Any other reason | No |

---

## 4. Common Patterns

### Pagination

All list endpoints return paginated responses:

```json
{
  "content": [...],
  "page": 0,
  "size": 12,
  "totalElements": 100,
  "totalPages": 9,
  "first": true,
  "last": false
}
```

### Filtering

Use query parameters for filtering:
```
GET /artworks?type=MANDALA&medium=ACRYLIC&minPrice=1000&maxPrice=5000
```

### Sorting

Use `sort` parameter:
```
GET /artworks?sort=price,asc
GET /artworks?sort=createdAt,desc
```

### Search

Use `search` parameter:
```
GET /artworks?search=mandala
```

---

## 5. Error Handling

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (not logged in) |
| 403 | Forbidden (no permission) |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 429 | Too Many Requests (rate limited) |
| 500 | Server Error |

### Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Email is required",
    "password": "Password must be at least 8 characters"
  },
  "timestamp": "2026-03-01T10:30:00Z",
  "path": "/api/v1/auth/register"
}
```

### Exception Handling (Backend)

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(404)
            .body(ApiResponse.error(ex.getMessage()));
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage())
        );
        return ResponseEntity.badRequest()
            .body(ApiResponse.error("Validation failed", errors));
    }
}
```

---

## 6. Code Structure

### Backend Structure

```
backend/src/main/java/com/anjoriarts/
├── configuration/        # Security, CORS, Cache config
│   ├── SecurityConfig.java
│   ├── CorsConfig.java
│   ├── CacheConfig.java
│   └── JacksonConfig.java
├── controller/           # REST endpoints
│   ├── ArtworkController.java
│   ├── CartController.java
│   ├── OrderController.java
│   ├── AuthController.java
│   ├── OtpController.java
│   ├── ReviewController.java
│   ├── CouponController.java
│   ├── NewsletterController.java
│   └── ReturnController.java
├── service/              # Business logic
│   ├── ArtworkService.java
│   ├── CartService.java
│   ├── OrderService.java
│   ├── OtpService.java
│   ├── SmsService.java
│   ├── ReviewService.java
│   ├── CouponService.java
│   ├── NewsletterService.java
│   ├── ReturnService.java
│   ├── WhatsAppService.java
│   └── InvoiceService.java
├── repository/           # Data access
│   ├── ArtworkRepository.java
│   └── OrderRepository.java
├── entity/               # JPA entities
│   ├── Artwork.java
│   └── Order.java
├── dto/                  # Request/Response objects
│   ├── request/
│   └── response/
├── security/             # JWT, OAuth2
│   ├── JwtTokenProvider.java
│   ├── JwtAuthFilter.java
│   └── UserDetailsServiceImpl.java
├── exception/            # Custom exceptions
│   ├── ResourceNotFoundException.java
│   └── GlobalExceptionHandler.java
└── util/                 # Helpers
    └── SlugUtil.java
```

### Frontend Structure

```
frontend/src/
├── components/           # Reusable UI
│   ├── ui/              # Button, Input, Card
│   ├── layout/          # Navbar, Footer
│   ├── modals/          # Modal components
│   └── PhoneVerification.jsx  # OTP input component
├── features/            # Feature pages
│   ├── shop/
│   ├── cart/
│   ├── checkout/        # Includes phone verification step
│   └── admin/
├── hooks/               # Custom hooks
│   └── useAuth.js
├── services/            # API calls
│   └── api.js
├── context/             # React Context
│   ├── AuthContext.jsx
│   └── CartContext.jsx
└── utils/               # Helpers
    └── formatPrice.js
```

---

## 7. Best Practices

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Classes | PascalCase | `ArtworkService` |
| Methods | camelCase | `findBySlug()` |
| Variables | camelCase | `artworkList` |
| Constants | SCREAMING_SNAKE | `MAX_IMAGES` |
| DB Tables | snake_case | `order_items` |
| DB Columns | snake_case | `created_at` |
| API Endpoints | kebab-case | `/custom-orders` |
| React Components | PascalCase | `ProductCard.jsx` |

### Layer Responsibilities

| Layer | Responsibility |
|-------|----------------|
| Controller | HTTP handling, validation, response formatting |
| Service | Business logic, orchestration, transactions |
| Repository | Data access only |

### Frontend API Calls

```javascript
// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshed = await refreshToken();
      if (refreshed) {
        return api(error.config);
      }
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### TanStack Query Usage

```javascript
// hooks/useArtworks.js
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export function useArtworks(filters) {
  return useQuery({
    queryKey: ['artworks', filters],
    queryFn: () => api.get('/artworks', { params: filters }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

---

## Related Documents

- [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) - Project overview (for managers)
- [DB_DESIGN.md](./DB_DESIGN.md) - Database schema (for DBAs)
- [INFRASTRUCTURE.md](./INFRASTRUCTURE.md) - Deployment guide (for DevOps)

---

*This document is for developers. Keep it updated as APIs change.*
