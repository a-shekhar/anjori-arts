export const siteConfig = {
  name: "Anjori Arts",
  description:
    "Discover bespoke Indian art and modern design concepts — Tanjore, Madhubani, Warli, portraiture, custom branding, cyanotype prints, handcrafted earrings, and more.",
  url: "https://www.anjoriarts.com",
  ogImage: "https://www.anjoriarts.com/images/og-default.jpg",
  creator: "Anjori Arts",
  email: {
    primary: "anjoriarts@gmail.com",
    support: "support@anjoriarts.com",
    orders: "orders@anjoriarts.com",
    admin: "admin@anjoriarts.com",
  },
  phone: "+91 80519 60916",
  address: "Puducherry, India",
  social: {
    instagram: "https://www.instagram.com/anjoriarts",
    facebook: "https://www.facebook.com/people/Anjori-Arts/61576973495407/",
    youtube: "https://www.youtube.com/@anjoriarts",
    pinterest: "https://in.pinterest.com/anjoriarts/",
    whatsapp: "https://wa.me/918051960916",
  },
  keywords: [
    "handmade paintings",
    "Indian art",
    "Madhubani painting",
    "Tanjore painting",
    "Warli art",
    "mandala art",
    "mandala painting",
    "mythological art",
    "devotional art",
    "contemporary artwork",
    "portraiture",
    "figurative painting",
    "customised art",
    "branding artwork",
    "logo based artistic concept",
    "poster designing",
    "cyanotype prints",
    "handcrafted earrings",
    "buy paintings online India",
  ],
} as const;

export type SiteConfig = typeof siteConfig;

export const hasWhatsApp = !siteConfig.social.whatsapp.includes("XXXXXXXXXX");
export const phoneHref = `tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`;
export const inquiryHref = hasWhatsApp
  ? siteConfig.social.whatsapp
  : `mailto:${siteConfig.email.primary}`;


