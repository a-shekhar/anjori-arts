"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { withAdminAuth } from "@/lib/auth-admin";
import type {
  AdminCustomerSummary,
  AdminCustomerDetail,
  AdminCustomersStats,
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  CustomOrder,
  CustomOrderStatus,
  UserAddress,
} from "@/types";

function mapOrder(order: any, items: OrderItem[] = []): Order {
  return {
    id: order.id,
    order_number: order.order_number,
    user_id: order.user_id ?? null,
    customer_name: order.customer_name,
    customer_email: order.customer_email,
    customer_phone: order.customer_phone,
    country_code: order.country_code || "+91",
    shipping_address: order.shipping_address || {},
    delivery_instructions: order.delivery_instructions ?? null,
    subtotal: Number(order.subtotal) || 0,
    delivery_charge: Number(order.delivery_charge) || 0,
    discount_amount: Number(order.discount_amount) || 0,
    total_amount: Number(order.total_amount) || 0,
    currency: order.currency || "INR",
    payment_method: order.payment_method,
    payment_status: order.payment_status as PaymentStatus,
    payment_reference: order.payment_reference ?? null,
    receipt_url: order.receipt_url ?? null,
    order_status: order.order_status as OrderStatus,
    courier_name: order.courier_name ?? null,
    tracking_number: order.tracking_number ?? null,
    tracking_url: order.tracking_url ?? null,
    estimated_delivery: order.estimated_delivery ?? null,
    admin_notes: order.admin_notes ?? null,
    gateway_order_id: order.gateway_order_id ?? null,
    paid_at: order.paid_at ?? null,
    cancellation_reason: order.cancellation_reason ?? null,
    refund_reference: order.refund_reference ?? null,
    refund_amount: Number(order.refund_amount) || 0,
    created_at: order.created_at,
    updated_at: order.updated_at,
    items,
  };
}

function mapCustomOrder(order: any): CustomOrder {
  return {
    id: order.id,
    order_reference: order.order_reference,
    user_id: order.user_id ?? null,
    status: order.status as CustomOrderStatus,
    created_at: order.created_at,
    first_name: order.first_name,
    last_name: order.last_name,
    email: order.email,
    country_code: order.country_code,
    phone: order.phone ?? null,
    category: order.category ?? null,
    medium: order.medium ?? null,
    surface: order.surface ?? null,
    preferred_size: order.preferred_size ?? null,
    budget: order.budget ?? null,
    reference_link: order.reference_link ?? null,
    reference_images: Array.isArray(order.reference_images) ? order.reference_images : [],
    message: order.message ?? null,
    final_category: order.final_category ?? null,
    final_medium: order.final_medium ?? null,
    final_surface: order.final_surface ?? null,
    final_size: order.final_size ?? null,
    final_budget: order.final_budget ?? null,
    items: Array.isArray(order.items) ? order.items : [],
    quote_total: typeof order.quote_total === "number" ? order.quote_total : Number(order.quote_total) || 0,
    deposit_percentage:
      typeof order.deposit_percentage === "number"
        ? order.deposit_percentage
        : Number(order.deposit_percentage) || 50,
    advance_deposit:
      typeof order.advance_deposit === "number"
        ? order.advance_deposit
        : Number(order.advance_deposit) || 0,
    estimated_timeline: order.estimated_timeline ?? null,
    admin_notes: order.admin_notes ?? null,
  };
}

export interface AdminCustomersResponse {
  customers: AdminCustomerSummary[];
  stats: AdminCustomersStats;
}

/**
 * Fetch unified list of registered collectors and guest buyers with aggregated metrics.
 */
export const getAdminCustomers = withAdminAuth(
  async (): Promise<AdminCustomersResponse> => {
    try {
      const adminDb = createAdminClient();

      // 1. Fetch Auth users, Profiles, Orders, Custom Orders concurrently
      const [authRes, profilesRes, ordersRes, customOrdersRes] = await Promise.all([
        adminDb.auth.admin.listUsers({ page: 1, perPage: 1000 }),
        adminDb.from("profiles").select("id, role, created_at, updated_at"),
        adminDb
          .from("orders")
          .select(
            "id, order_number, user_id, customer_name, customer_email, customer_phone, total_amount, payment_status, order_status, created_at, shipping_address"
          )
          .order("created_at", { ascending: false }),
        adminDb
          .from("custom_orders")
          .select("id, order_reference, user_id, email, status, created_at"),
      ]);

      const authUsers = authRes.data?.users || [];
      const profiles = profilesRes.data || [];
      const orders = ordersRes.data || [];
      const customOrders = customOrdersRes.data || [];

      // Build quick lookup maps
      const profileMap = new Map<string, "USER" | "ADMIN">();
      for (const p of profiles) {
        profileMap.set(p.id, p.role as "USER" | "ADMIN");
      }

      // Group orders by user_id and normalized email
      const ordersByUserId = new Map<string, typeof orders>();
      const ordersByEmail = new Map<string, typeof orders>();

      for (const ord of orders) {
        if (ord.user_id) {
          const list = ordersByUserId.get(ord.user_id) || [];
          list.push(ord);
          ordersByUserId.set(ord.user_id, list);
        }
        if (ord.customer_email) {
          const normEmail = ord.customer_email.trim().toLowerCase();
          const list = ordersByEmail.get(normEmail) || [];
          list.push(ord);
          ordersByEmail.set(normEmail, list);
        }
      }

      // Group custom orders
      const customOrdersByUserId = new Map<string, typeof customOrders>();
      const customOrdersByEmail = new Map<string, typeof customOrders>();

      for (const co of customOrders) {
        if (co.user_id) {
          const list = customOrdersByUserId.get(co.user_id) || [];
          list.push(co);
          customOrdersByUserId.set(co.user_id, list);
        }
        if (co.email) {
          const normEmail = co.email.trim().toLowerCase();
          const list = customOrdersByEmail.get(normEmail) || [];
          list.push(co);
          customOrdersByEmail.set(normEmail, list);
        }
      }

      const registeredEmails = new Set<string>();
      const customers: AdminCustomerSummary[] = [];

      // 2. Process Registered Collectors
      for (const user of authUsers) {
        const userEmail = (user.email || "").trim().toLowerCase();
        if (userEmail) {
          registeredEmails.add(userEmail);
        }

        // Combine orders matching user_id OR email
        const userOrdersById = ordersByUserId.get(user.id) || [];
        const userOrdersByEmail = userEmail ? ordersByEmail.get(userEmail) || [] : [];
        
        // De-duplicate orders by id
        const orderIdMap = new Map<string, (typeof orders)[0]>();
        for (const o of [...userOrdersById, ...userOrdersByEmail]) {
          orderIdMap.set(o.id, o);
        }
        const userOrders = Array.from(orderIdMap.values());

        // Custom orders
        const coList = [
          ...(customOrdersByUserId.get(user.id) || []),
          ...(userEmail ? customOrdersByEmail.get(userEmail) || [] : []),
        ];
        const hasActiveCommission = coList.some(
          (co) => co.status !== "completed" && co.status !== "cancelled"
        );

        // Compute revenue (exclude cancelled/failed orders)
        const validOrders = userOrders.filter(
          (o) => o.order_status !== "cancelled" && o.payment_status !== "failed"
        );
        const totalSpent = validOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

        // Find primary customer name and phone
        const meta = user.user_metadata || {};
        const metaName =
          meta.full_name ||
          [meta.first_name, meta.last_name].filter(Boolean).join(" ");
        const primaryName =
          metaName ||
          userOrders[0]?.customer_name ||
          (user.email ? user.email.split("@")[0] : "Registered Collector");

        const primaryPhone =
          meta.phone ||
          user.phone ||
          userOrders[0]?.customer_phone ||
          null;

        const authProvider =
          user.app_metadata?.provider ||
          (Array.isArray(user.app_metadata?.providers) ? user.app_metadata.providers[0] : null) ||
          "email";

        // Latest order date
        const sortedOrderDates = userOrders
          .map((o) => o.created_at)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        const lastOrderDate = sortedOrderDates[0] || null;

        customers.push({
          id: user.id,
          userId: user.id,
          name: primaryName,
          email: user.email || "No Email",
          phone: primaryPhone,
          type: "registered",
          role: profileMap.get(user.id) || "USER",
          createdAt: user.created_at,
          lastSignInAt: user.last_sign_in_at ?? null,
          totalOrders: userOrders.length,
          totalSpent,
          lastOrderDate,
          authProvider,
          hasActiveCommission,
        });
      }

      // 3. Process Guest Buyers (Unique emails not registered in auth.users)
      const guestEmailGroups = new Map<string, typeof orders>();

      for (const ord of orders) {
        if (!ord.user_id) {
          const email = (ord.customer_email || "").trim().toLowerCase();
          if (email && !registeredEmails.has(email)) {
            const list = guestEmailGroups.get(email) || [];
            list.push(ord);
            guestEmailGroups.set(email, list);
          }
        }
      }

      for (const [guestEmail, gOrders] of guestEmailGroups.entries()) {
        const sortedGOrders = [...gOrders].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const latest = sortedGOrders[0];
        const earliest = sortedGOrders[sortedGOrders.length - 1];

        const validOrders = sortedGOrders.filter(
          (o) => o.order_status !== "cancelled" && o.payment_status !== "failed"
        );
        const totalSpent = validOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

        const coList = customOrdersByEmail.get(guestEmail) || [];
        const hasActiveCommission = coList.some(
          (co) => co.status !== "completed" && co.status !== "cancelled"
        );

        customers.push({
          id: `guest:${guestEmail}`,
          userId: null,
          name: latest.customer_name || "Guest Buyer",
          email: guestEmail,
          phone: latest.customer_phone || null,
          type: "guest",
          role: "USER",
          createdAt: earliest.created_at,
          lastSignInAt: null,
          totalOrders: sortedGOrders.length,
          totalSpent,
          lastOrderDate: latest.created_at,
          authProvider: "guest",
          hasActiveCommission,
        });
      }

      // Sort customers: most recent order first, otherwise most recent signup
      customers.sort((a, b) => {
        const dateA = a.lastOrderDate ? new Date(a.lastOrderDate).getTime() : new Date(a.createdAt).getTime();
        const dateB = b.lastOrderDate ? new Date(b.lastOrderDate).getTime() : new Date(b.createdAt).getTime();
        return dateB - dateA;
      });

      // Compute stats
      const totalCustomers = customers.length;
      const registeredCollectors = customers.filter((c) => c.type === "registered").length;
      const guestBuyers = customers.filter((c) => c.type === "guest").length;
      const totalRepeatCollectors = customers.filter((c) => c.totalOrders > 1).length;
      const totalCustomerRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

      return {
        customers,
        stats: {
          totalCustomers,
          registeredCollectors,
          guestBuyers,
          totalRepeatCollectors,
          totalCustomerRevenue,
        },
      };
    } catch (err) {
      console.error("[getAdminCustomers] Unexpected error:", err);
      return {
        customers: [],
        stats: {
          totalCustomers: 0,
          registeredCollectors: 0,
          guestBuyers: 0,
          totalRepeatCollectors: 0,
          totalCustomerRevenue: 0,
        },
      };
    }
  },
  {
    fallback: {
      customers: [],
      stats: {
        totalCustomers: 0,
        registeredCollectors: 0,
        guestBuyers: 0,
        totalRepeatCollectors: 0,
        totalCustomerRevenue: 0,
      },
    },
  }
);

/**
 * Fetch complete customer profile including addresses, all orders with line items, and custom orders.
 */
export const getAdminCustomerDetail = withAdminAuth(
  async (customerId: string): Promise<AdminCustomerDetail | null> => {
    try {
      const adminDb = createAdminClient();

      if (customerId.startsWith("guest:")) {
        const guestEmail = customerId.replace("guest:", "").trim().toLowerCase();

        const [ordersRes, customOrdersRes] = await Promise.all([
          adminDb
            .from("orders")
            .select("*, items:order_items(*)")
            .ilike("customer_email", guestEmail)
            .order("created_at", { ascending: false }),
          adminDb
            .from("custom_orders")
            .select("*")
            .ilike("email", guestEmail)
            .order("created_at", { ascending: false }),
        ]);

        const orders = (ordersRes.data || []).map((o) => mapOrder(o, o.items || []));
        const customOrders = (customOrdersRes.data || []).map((co) => mapCustomOrder(co));

        if (orders.length === 0 && customOrders.length === 0) {
          return null;
        }

        const latestOrder = orders[0];
        const earliestOrder = orders[orders.length - 1];

        // Synthesize address list from past orders
        const addressMap = new Map<string, UserAddress>();
        for (const ord of orders) {
          const ship = ord.shipping_address;
          if (ship && ship.street && ship.city) {
            const key = `${ship.street}-${ship.city}-${ship.pincode}`.toLowerCase();
            if (!addressMap.has(key)) {
              addressMap.set(key, {
                id: ord.id,
                user_id: "",
                recipient_name: ord.customer_name,
                phone: ord.customer_phone,
                street: ship.street,
                landmark: ship.landmark || null,
                city: ship.city,
                state: ship.state,
                pincode: ship.pincode,
                address_type: "home",
                is_default: addressMap.size === 0,
                created_at: ord.created_at,
              });
            }
          }
        }

        const validOrders = orders.filter(
          (o) => o.order_status !== "cancelled" && o.payment_status !== "failed"
        );
        const totalSpent = validOrders.reduce((sum, o) => sum + o.total_amount, 0);

        return {
          id: customerId,
          userId: null,
          name: latestOrder?.customer_name || "Guest Buyer",
          email: guestEmail,
          phone: latestOrder?.customer_phone || null,
          type: "guest",
          role: "USER",
          createdAt: earliestOrder ? earliestOrder.created_at : new Date().toISOString(),
          lastSignInAt: null,
          totalOrders: orders.length,
          totalSpent,
          lastOrderDate: latestOrder?.created_at || null,
          authProvider: "guest",
          hasActiveCommission: customOrders.some(
            (co) => co.status !== "completed" && co.status !== "cancelled"
          ),
          addresses: Array.from(addressMap.values()),
          orders,
          customOrders,
        };
      }

      // Registered User
      const [userRes, profileRes, addressesRes, ordersRes, customOrdersRes] = await Promise.all([
        adminDb.auth.admin.getUserById(customerId),
        adminDb.from("profiles").select("role").eq("id", customerId).maybeSingle(),
        adminDb.from("user_addresses").select("*").eq("user_id", customerId).order("is_default", { ascending: false }),
        adminDb
          .from("orders")
          .select("*, items:order_items(*)")
          .eq("user_id", customerId)
          .order("created_at", { ascending: false }),
        adminDb
          .from("custom_orders")
          .select("*")
          .eq("user_id", customerId)
          .order("created_at", { ascending: false }),
      ]);

      const user = userRes.data?.user;
      if (!user) {
        return null;
      }

      const role = (profileRes.data?.role as "USER" | "ADMIN") || "USER";
      const addresses = (addressesRes.data || []) as UserAddress[];
      let orders = (ordersRes.data || []).map((o) => mapOrder(o, o.items || []));
      let customOrders = (customOrdersRes.data || []).map((co) => mapCustomOrder(co));

      // Also check if any orders were placed with this email when not logged in
      if (user.email) {
        const userEmail = user.email.trim().toLowerCase();
        const { data: emailOrders } = await adminDb
          .from("orders")
          .select("*, items:order_items(*)")
          .ilike("customer_email", userEmail)
          .is("user_id", null);

        if (emailOrders && emailOrders.length > 0) {
          const extraOrders = emailOrders.map((o) => mapOrder(o, o.items || []));
          orders = [...orders, ...extraOrders].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        }

        const { data: emailCustomOrders } = await adminDb
          .from("custom_orders")
          .select("*")
          .ilike("email", userEmail)
          .is("user_id", null);

        if (emailCustomOrders && emailCustomOrders.length > 0) {
          const extraCOs = emailCustomOrders.map((co) => mapCustomOrder(co));
          customOrders = [...customOrders, ...extraCOs].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        }
      }

      const meta = user.user_metadata || {};
      const primaryName =
        meta.full_name ||
        [meta.first_name, meta.last_name].filter(Boolean).join(" ") ||
        orders[0]?.customer_name ||
        (user.email ? user.email.split("@")[0] : "Registered Collector");

      const primaryPhone =
        meta.phone ||
        user.phone ||
        addresses[0]?.phone ||
        orders[0]?.customer_phone ||
        null;

      const authProvider =
        user.app_metadata?.provider ||
        (Array.isArray(user.app_metadata?.providers) ? user.app_metadata.providers[0] : null) ||
        "email";

      const validOrders = orders.filter(
        (o) => o.order_status !== "cancelled" && o.payment_status !== "failed"
      );
      const totalSpent = validOrders.reduce((sum, o) => sum + o.total_amount, 0);

      return {
        id: user.id,
        userId: user.id,
        name: primaryName,
        email: user.email || "No Email",
        phone: primaryPhone,
        type: "registered",
        role,
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at ?? null,
        totalOrders: orders.length,
        totalSpent,
        lastOrderDate: orders[0]?.created_at || null,
        authProvider,
        hasActiveCommission: customOrders.some(
          (co) => co.status !== "completed" && co.status !== "cancelled"
        ),
        addresses,
        orders,
        customOrders,
      };
    } catch (err) {
      console.error("[getAdminCustomerDetail] Unexpected error:", err);
      return null;
    }
  },
  { fallback: null }
);

