export const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Traditions", href: "/categories" },
  { label: "Commissions", href: "/custom-order" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
] as const;

export const ADMIN_NAV_LINKS = [
  { label: "Dashboard", href: "/admin" },
  { label: "Artworks", href: "/admin/artworks" },
  { label: "Categories", href: "/admin/categories" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Custom Orders", href: "/admin/custom-orders" },
  { label: "Testimonials", href: "/admin/testimonials" },
  { label: "Blog", href: "/admin/blog" },
] as const;

export const USER_NAV_LINKS = [
  { label: "Profile", href: "/user/profile" },
  { label: "Addresses", href: "/user/addresses" },
  { label: "Orders", href: "/user/orders" },
  { label: "Wishlist", href: "/user/wishlist" },
] as const;

export const FOOTER_LINKS = {
  shop: [
    { label: "All Artworks", href: "/shop" },
    { label: "Custom Order", href: "/custom-order" },
  ],
  explore: [
    { label: "About Us", href: "/about" },
    { label: "Art Traditions", href: "/categories" },
    { label: "Collector Stories", href: "/stories" },
    { label: "Share Your Story", href: "/share-story" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  support: [
    { label: "Shipping", href: "/shipping" },
    { label: "Returns & Refunds", href: "/returns" },
    { label: "FAQ", href: "/faq" },
    { label: "Artwork Care", href: "/care" },
  ],
  legal: [
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
} as const;
