export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  cover_image?: string | null;
  alt_text?: string | null;
  display_order?: number;
};

export type ArtworkVariant = {
  id: string;
  label: string;
  widthInches: number;
  heightInches: number;
  mrp: number;
  sellingPrice: number; // in paise
  stockQuantity: number;
  isActive: boolean;
  canBeFramed?: boolean;
  framingPrice?: number;
  sku?: string | null;
};

export type Artwork = {
  id: string;
  slug: string;
  title: string;
  categoryId: string;
  price: number; // paise (₹ × 100)
  description: string;
  dimensions: string;
  surface: string;
  medium: string;
  isAvailable: boolean;
  isFeatured: boolean;
  tags: string[];
  images: { url: string; alt: string; publicId?: string }[];
  variants?: ArtworkVariant[];
  shortDescription?: string;
  artistNote?: string;
};

export type CustomOrderStatus =
  | "new"
  | "submitted"
  | "reviewed"
  | "quoted"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface CustomOrderItem {
  id: string;
  title: string;
  description?: string;
  quantity: number;
  unitPrice: number; // in Rupees
  totalPrice: number; // quantity * unitPrice
}

export type CustomOrder = {
  id: string;
  user_id?: string | null;
  order_reference: string;
  status: CustomOrderStatus | string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  country_code: string;
  phone?: string | null;
  category?: string | null;
  medium?: string | null;
  surface?: string | null;
  preferred_size?: string | null;
  budget?: string | null;
  reference_link?: string | null;
  reference_images: string[];
  message?: string | null;
  // Agreed / Admin-edited Specifications
  final_category?: string | null;
  final_medium?: string | null;
  final_surface?: string | null;
  final_size?: string | null;
  final_budget?: string | null;
  // Itemized Quotation
  items?: CustomOrderItem[];
  quote_total?: number; // in Rupees
  deposit_percentage?: number; // default 50
  advance_deposit?: number; // in Rupees
  estimated_timeline?: string | null;
  admin_notes?: string | null;
};

export type InquiryStatus =
  | "new"
  | "reviewed"
  | "in_progress"
  | "resolved"
  | "archived";

export type InquiryCategory =
  | "General Inquiry"
  | "Order Status"
  | "Custom Artwork"
  | "Collaboration"
  | "Feedback"
  | "Other"
  | string;

export interface Inquiry {
  id: string;
  inquiry_reference: string;
  status: InquiryStatus | string;
  created_at: string;
  updated_at?: string;
  first_name: string;
  last_name: string;
  email: string;
  country_code: string;
  phone?: string | null;
  category: InquiryCategory;
  subject: string;
  message: string;
  admin_notes?: string | null;
}

export type Testimonial = {
  id: string;
  author_name: string;
  author_location?: string | null;
  artwork_title?: string | null;
  category_id?: string | null;
  rating: number;
  quote: string;
  image_url?: string | null;
  image_alt?: string | null;
  is_approved: boolean;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at?: string;
};

export type OrderStatus =
  | "received"
  | "confirmed"
  | "framing_packing"
  | "dispatched"
  | "delivered"
  | "cancelled";

export type PaymentMethod =
  | "upi_qr"
  | "bank_transfer"
  | "pay_on_dispatch"
  | "razorpay";

export type PaymentStatus =
  | "pending"
  | "receipt_uploaded"
  | "verified"
  | "paid"
  | "failed"
  | "refunded";

export interface ShippingAddress {
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  artwork_id?: string | null;
  variant_id?: string | null;
  title: string;
  image_url?: string | null;
  size: string;
  is_framed: boolean;
  framing_price: number; // in paise
  unit_price: number; // in paise
  quantity: number;
  line_total: number; // in paise
  created_at?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  country_code: string;
  shipping_address: ShippingAddress;
  delivery_instructions?: string | null;
  subtotal: number; // in paise
  delivery_charge: number; // in paise
  discount_amount: number; // in paise
  total_amount: number; // in paise
  currency: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_reference?: string | null;
  receipt_url?: string | null;
  order_status: OrderStatus;
  courier_name?: string | null;
  tracking_number?: string | null;
  tracking_url?: string | null;
  estimated_delivery?: string | null;
  admin_notes?: string | null;
  gateway_order_id?: string | null;
  paid_at?: string | null;
  cancellation_reason?: string | null;
  refund_reference?: string | null;
  refund_amount?: number; // in paise
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export type { CartItem } from "@/stores/cart-store";

export type AddressType = "home" | "work" | "other";

export interface UserAddress {
  id: string;
  user_id: string;
  recipient_name: string;
  phone: string;
  street: string;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
  address_type: AddressType;
  is_default: boolean;
  created_at: string;
  updated_at?: string;
}

export interface WishlistItem {
  id: string;
  userId?: string | null;
  artworkId: string;
  createdAt: string;
  artwork?: Artwork;
}

export type CustomerType = "registered" | "guest";

export interface AdminCustomerSummary {
  id: string;
  userId?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  type: CustomerType;
  role: "USER" | "ADMIN";
  createdAt: string;
  lastSignInAt?: string | null;
  totalOrders: number;
  totalSpent: number; // in paise
  lastOrderDate?: string | null;
  authProvider?: string;
  hasActiveCommission?: boolean;
}

export interface AdminCustomerDetail extends AdminCustomerSummary {
  addresses: UserAddress[];
  orders: Order[];
  customOrders: CustomOrder[];
}

export interface AdminCustomersStats {
  totalCustomers: number;
  registeredCollectors: number;
  guestBuyers: number;
  totalRepeatCollectors: number;
  totalCustomerRevenue: number; // in paise
}


