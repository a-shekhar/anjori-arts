import { Resend } from "resend";
import { render } from "@react-email/render";
import * as React from "react";
import { OrderConfirmationEmail } from "@/emails/OrderConfirmationEmail";
import { AdminAlertEmail } from "@/emails/AdminAlertEmail";
import { CustomerInquiryConfirmationEmail } from "@/emails/CustomerInquiryConfirmationEmail";
import { formatPrice } from "@/lib/helpers";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Anjori Arts <noreply@anjoriarts.com>";
const ADMIN_EMAIL = "anjoriarts@gmail.com";
const ORDERS_EMAIL = "orders@anjoriarts.com";

export interface SendInquiryEmailProps {
  type: "inquiry" | "custom_order";
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    countryCode?: string;
    category?: string;
    subject?: string;
    message?: string;
    artworkType?: string;
    artworkId?: string | null;
    medium?: string;
    surface?: string;
    preferredSize?: string;
    budget?: string;
    referenceLink?: string;
    referenceImages?: string[];
    orderReference?: string;
    [key: string]: unknown;
  };
}

/**
 * Sends internal notification to Anjori Arts administrators for new inquiries or custom commissions.
 */
export async function sendNotificationEmail({ type, data }: SendInquiryEmailProps) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY is not set. Email not sent.");
    return { success: false, error: "Email configuration missing." };
  }

  const rawSubject =
    type === "inquiry"
      ? `New Inquiry: ${data.subject || "No Subject"} from ${data.firstName || ""} ${data.lastName || ""}`.trim()
      : `New Custom Order [${data.orderReference || "N/A"}] from ${data.firstName || ""} ${data.lastName || ""}`.trim();

  const details: Array<{ label: string; value: string }> = [
    { label: "Client Name", value: `${data.firstName || ""} ${data.lastName || ""}`.trim() || "N/A" },
    { label: "Email", value: data.email || "N/A" },
    { label: "Phone", value: data.phone ? `${data.countryCode || ""}${data.phone}` : "N/A" },
  ];

  if (type === "custom_order") {
    details.push(
      { label: "Reference Code", value: data.orderReference || "N/A" },
      { label: "Art Tradition", value: data.category || "N/A" },
      { label: "Medium", value: data.medium || "N/A" },
      { label: "Surface", value: data.surface || "N/A" },
      { label: "Preferred Scale", value: data.preferredSize || "N/A" },
      { label: "Budget", value: data.budget || "N/A" }
    );
  } else {
    details.push({ label: "Subject", value: data.subject || "General Inquiry" });
  }

  try {
    const htmlBody = await render(
      React.createElement(AdminAlertEmail, {
        title: type === "inquiry" ? "New Studio Inquiry" : "New Custom Commission Request",
        previewText: rawSubject,
        details,
        notes: data.message as string | undefined,
      })
    );

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      replyTo: data.email,
      subject: rawSubject,
      html: htmlBody,
    });

    if (error) {
      console.error("[email] Resend API Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    console.error("[email] Failed to send notification email:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/**
 * Sends an automated confirmation receipt to the collector acknowledging inquiry receipt.
 */
export async function sendCustomerConfirmationEmail(
  payload: SendInquiryEmailProps | SendInquiryEmailProps["data"]
) {
  const isWrapped = "data" in payload && Boolean((payload as SendInquiryEmailProps).data);
  const type = isWrapped ? (payload as SendInquiryEmailProps).type : "custom_order";
  const data = isWrapped ? (payload as SendInquiryEmailProps).data : (payload as SendInquiryEmailProps["data"]);

  if (!process.env.RESEND_API_KEY || !data.email) {
    return { success: false, error: "Email configuration missing or client email absent." };
  }

  const rawSubject =
    type === "inquiry"
      ? "We have received your inquiry • Anjori Arts"
      : `Custom Commission Received [${data.orderReference || "Anjori Arts"}]`;

  const fullName = `${data.firstName || ""} ${data.lastName || ""}`.trim() || "Collector";

  try {
    const htmlBody = await render(
      React.createElement(CustomerInquiryConfirmationEmail, {
        customerName: fullName,
        orderReference: data.orderReference || "INQ-PENDING",
        subject: data.subject || (data.category ? `${data.category} Painting` : undefined),
        message: data.message as string | undefined,
      })
    );

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [data.email],
      replyTo: ORDERS_EMAIL,
      subject: rawSubject,
      html: htmlBody,
    });

    if (error) {
      console.error("[email] Customer Confirmation Email Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    console.error("[email] Failed to send customer confirmation email:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export interface OrderEmailProps {
  order_id?: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  country_code?: string;
  total_amount: number; // in paise
  payment_method: string;
  payment_status: string;
  payment_reference?: string | null;
  receipt_url?: string | null;
  delivery_instructions?: string | null;
  shipping_address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  items?: Array<{
    title: string;
    size?: string;
    is_framed?: boolean;
    quantity: number;
    unit_price: number;
  }>;
}

/**
 * Sends order acquisition confirmation receipt to collector with full item and shipping breakdown.
 */
export async function sendOrderPlacedEmail(order: OrderEmailProps) {
  if (!process.env.RESEND_API_KEY || !order.customer_email) {
    return { success: false, error: "Email configuration missing or no email provided." };
  }

  const formattedTotal = formatPrice(order.total_amount);

  try {
    const htmlBody = await render(
      React.createElement(OrderConfirmationEmail, {
        orderNumber: order.order_number,
        customerName: order.customer_name,
        formattedTotal,
        paymentMethod: order.payment_method,
        paymentStatus: order.payment_status,
        shippingAddress: order.shipping_address,
        items: order.items?.map((item) => ({
          title: item.title,
          size: item.size || "",
          is_framed: item.is_framed || false,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      })
    );

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [order.customer_email],
      replyTo: ORDERS_EMAIL,
      subject: `Order Confirmation #${order.order_number} • Anjori Arts`,
      html: htmlBody,
    });

    if (error) {
      console.error("[email] Order Placed Email Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    console.error("[email] Failed to send order placed email:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/**
 * Alerts administrators of newly placed orders.
 */
export async function sendAdminOrderAlertEmail(order: OrderEmailProps) {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: "Email configuration missing." };
  }

  const details = [
    { label: "Order Number", value: `#${order.order_number}` },
    { label: "Collector", value: order.customer_name },
    { label: "Email", value: order.customer_email },
    { label: "Phone", value: order.customer_phone ? `${order.country_code || ""}${order.customer_phone}` : "N/A" },
    { label: "Total Amount", value: formatPrice(order.total_amount) },
    { label: "Payment Method", value: order.payment_method.toUpperCase() },
    { label: "Payment Status", value: order.payment_status.toUpperCase() },
    {
      label: "Shipping Address",
      value: `${order.shipping_address.street}, ${order.shipping_address.city}, ${order.shipping_address.state} - ${order.shipping_address.pincode}`,
    },
  ];

  if (order.delivery_instructions) {
    details.push({ label: "Delivery Instructions", value: order.delivery_instructions });
  }

  try {
    const htmlBody = await render(
      React.createElement(AdminAlertEmail, {
        title: `New Order Received #${order.order_number}`,
        previewText: `New Order #${order.order_number} by ${order.customer_name}`,
        details,
      })
    );

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      replyTo: order.customer_email,
      subject: `[NEW ORDER] #${order.order_number} by ${order.customer_name}`,
      html: htmlBody,
    });

    if (error) {
      console.error("[email] Admin Order Alert Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    console.error("[email] Failed to send admin order alert:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export interface OrderFailureData {
  order_number?: string;
  customer_email?: string;
  customer_name?: string;
  customer_phone?: string;
  country_code?: string;
  error_message: string;
  payment_method?: string;
  total_amount?: number;
  items_summary?: string;
  [key: string]: unknown;
}

/**
 * Notifies administrators of failed or flagged order submissions.
 */
export async function sendOrderFailureAlertEmail(data: OrderFailureData) {
  if (!process.env.RESEND_API_KEY) return { success: false };

  const orderRef = data.order_number || "PENDING";
  const details = [
    { label: "Order Number", value: `#${orderRef}` },
    { label: "Customer Name", value: data.customer_name || "N/A" },
    { label: "Email", value: data.customer_email || "N/A" },
    ...(data.customer_phone ? [{ label: "Phone", value: `${data.country_code || ""}${data.customer_phone}` }] : []),
    ...(data.total_amount ? [{ label: "Attempted Amount", value: formatPrice(data.total_amount) }] : []),
    ...(data.payment_method ? [{ label: "Payment Method", value: data.payment_method.toUpperCase() }] : []),
    ...(data.items_summary ? [{ label: "Items Summary", value: data.items_summary }] : []),
    { label: "Failure Reason", value: data.error_message },
  ];

  try {
    const htmlBody = await render(
      React.createElement(AdminAlertEmail, {
        title: `Order Processing Failure #${orderRef}`,
        previewText: `Order Failure Alert #${orderRef}`,
        details,
      })
    );

    await resend.emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      subject: `[ALERT] Order Failure: #${orderRef}`,
      html: htmlBody,
    });

    return { success: true };
  } catch (err: unknown) {
    console.error("[email] Failed to send order failure alert:", err);
    return { success: false };
  }
}
