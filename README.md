# 🎨 Anjori Arts — Handcrafted Indian Fine Art & E-Commerce

Bespoke D2C Indian art gallery platform created for artist **Jyotsna Sharma**, specializing in Madhubani / Mithila paintings, Tanjore gold leaf artwork, Warli, Mandala, and handcrafted keepsakes.

> **Master Project Status & Punchlist:** See **[`PROJECT_TRACKER.md`](./PROJECT_TRACKER.md)** for live progress, completed milestones, and pre-launch tasks.

---

## 🛠️ Technology Stack

* **Framework:** [Next.js 16](https://nextjs.org) (App Router, Server Actions, React 19)
* **Hosting:** [Vercel](https://vercel.com) Global Edge Network
* **Database & Auth:** [Supabase](https://supabase.com) (Managed PostgreSQL, Row Level Security, Auth)
* **DNS & Inbound Routing:** [Cloudflare](https://cloudflare.com) (Nameservers & Email Routing)
* **Outbound Transactional Email:** [Resend](https://resend.com) (API & SMTP Relay)
* **Media Delivery & Optimization:** [Cloudinary](https://cloudinary.com)
* **Payment Gateway:** [Razorpay](https://razorpay.com) (UPI, NetBanking, Cards)
* **Telemetry & Monitoring:** [Sentry](https://sentry.io) & Vercel Analytics

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/a-shekhar/anjori-arts.git
cd anjori-arts
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and fill in your Supabase, Cloudinary, Razorpay, and Resend credentials:

```bash
cp .env.example .env.local
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the storefront.

---

## 📚 Documentation Directory

* **[PROJECT_TRACKER.md](./PROJECT_TRACKER.md)** — Master launch readiness dashboard, completed features, and pre-launch punchlist.
* **[docs/SYSTEM_DESIGN.md](./docs/SYSTEM_DESIGN.md)** — Comprehensive architecture, user sequence flows, and component structure.
* **[docs/INFRASTRUCTURE.md](./docs/INFRASTRUCTURE.md)** — Production infrastructure, DNS records table, Cloudflare, and environment variables.
* **[docs/EMAIL_TEMPLATES.md](./docs/EMAIL_TEMPLATES.md)** — Email architecture, address directory, and transactional email guidelines.
* **[docs/SUPABASE_EMAIL_TEMPLATES.md](./docs/SUPABASE_EMAIL_TEMPLATES.md)** — Branded authentication email templates (Reset Password, Signup Confirmation, Magic Link).
* **[docs/DB_DESIGN.md](./docs/DB_DESIGN.md)** — Supabase `arts` schema entity relationships and table descriptions.
