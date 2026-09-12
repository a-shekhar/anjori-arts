import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Safely escapes HTML special characters to prevent HTML/script injection in email templates.
 */
export function escapeHtml(str: unknown): string {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Validates that a given URL is safe (http or https) and escapes attribute-breaking characters.
 * Returns null if the URL is invalid or uses an unsafe protocol (e.g. javascript:, data:, etc.).
 */
export function sanitizeUrl(url: unknown): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return escapeHtml(trimmed);
    }
  } catch {
    return null;
  }
  return null;
}

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

export async function sendNotificationEmail({ type, data }: SendInquiryEmailProps) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Email not sent.");
    return { success: false, error: "Email configuration missing." };
  }

  const rawSubject =
    type === "inquiry"
      ? `New Inquiry: ${data.subject || "No Subject"} from ${data.firstName || ""} ${data.lastName || ""}`.trim()
      : `New Custom Order [${data.orderReference || "N/A"}] from ${data.firstName || ""} ${data.lastName || ""}`.trim();

  // Escaped variables for HTML body
  const safeHeadingSubject = escapeHtml(rawSubject);
  const safeFirstName = escapeHtml(data.firstName || "");
  const safeLastName = escapeHtml(data.lastName || "");
  const safeEmail = escapeHtml(data.email || "");
  const safePhone = escapeHtml(data.phone || "");
  const safeCountryCode = escapeHtml(data.countryCode || "");
  const safeMessage = escapeHtml(data.message || "");

  // Simple HTML email body
  let htmlBody = `
    <h2>${safeHeadingSubject}</h2>
    <p><strong>Name:</strong> ${safeFirstName} ${safeLastName}</p>
    <p><strong>Email:</strong> ${safeEmail ? `<a href="mailto:${safeEmail}">${safeEmail}</a>` : "Not provided"}</p>
    <p><strong>Phone:</strong> ${safePhone ? `${safeCountryCode} ${safePhone}`.trim() : "Not provided"}</p>
  `;

  if (type === "inquiry") {
    const safeCategory = escapeHtml(data.category || "General");
    const safeSubject = escapeHtml(data.subject || "No Subject");
    htmlBody += `
      <p><strong>Category:</strong> ${safeCategory}</p>
      <p><strong>Subject:</strong> ${safeSubject}</p>
      <h3>Message:</h3>
      <p style="white-space: pre-wrap;">${safeMessage}</p>
    `;
  } else {
    const safeOrderRef = escapeHtml(data.orderReference || "N/A");
    const safeArtworkId = data.artworkId ? escapeHtml(data.artworkId) : null;
    const safeCategory = escapeHtml(data.category || data.artworkType || "Not specified / Open to suggestions");
    const safeMedium = escapeHtml(data.medium || "Not specified");
    const safeSurface = escapeHtml(data.surface || "Not specified");
    const safePreferredSize = escapeHtml(data.preferredSize || "Not specified");
    const safeBudget = escapeHtml(data.budget || "Flexible");

    const safeRefLinkUrl = sanitizeUrl(data.referenceLink);
    const refLinkHtml = safeRefLinkUrl
      ? `<a href="${safeRefLinkUrl}" target="_blank" rel="noopener noreferrer">${safeRefLinkUrl}</a>`
      : data.referenceLink
      ? escapeHtml(data.referenceLink)
      : "None";

    const validReferenceImages = (data.referenceImages || [])
      .map((url) => sanitizeUrl(url))
      .filter((url): url is string => Boolean(url));

    htmlBody += `
      <p><strong>Order Reference:</strong> ${safeOrderRef}</p>
      ${safeArtworkId ? `<p><strong>Artwork ID:</strong> ${safeArtworkId}</p>` : ""}
      <p><strong>Category:</strong> ${safeCategory}</p>
      <p><strong>Medium:</strong> ${safeMedium}</p>
      <p><strong>Surface:</strong> ${safeSurface}</p>
      <p><strong>Preferred Size:</strong> ${safePreferredSize}</p>
      <p><strong>Estimated Budget:</strong> ${safeBudget}</p>
      <p><strong>Reference Link:</strong> ${refLinkHtml}</p>
      ${
        validReferenceImages.length > 0
          ? `<h3>Reference Images:</h3>
             <div style="display: flex; gap: 10px; flex-wrap: wrap;">
               ${validReferenceImages
                 .map(
                   (url: string) =>
                     `<a href="${url}" target="_blank" rel="noopener noreferrer"><img src="${url}" alt="Reference Image" style="max-height: 150px; max-width: 150px; object-fit: cover; border-radius: 8px;" /></a>`
                 )
                 .join("")}
             </div>`
          : ""
      }
      <h3>Project Details:</h3>
      <p style="white-space: pre-wrap;">${safeMessage}</p>
      <p style="white-space: pre-wrap;">${safeMessage || "<em>None provided (refer to attached photos/link or discuss during consultation)</em>"}</p>
    `;
  }

  try {
    const { error } = await resend.emails.send({
      from: 'Anjori Arts <noreply@anjoriarts.com>',
      to: ['anjoriarts@gmail.com'],
      replyTo: data.email,
      subject: rawSubject,
      html: htmlBody,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to send email:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function sendCustomerConfirmationEmail(data: SendInquiryEmailProps["data"]) {
  if (!process.env.RESEND_API_KEY || !data.email) {
    return { success: false, error: "Email configuration missing or no email provided." };
  }

  const rawSubject = `Your Custom Order Request Received - ${data.orderReference || ""}`.trim();
  const safeFirstName = escapeHtml(data.firstName || "there");
  const safeOrderReference = escapeHtml(data.orderReference || "N/A");
  const safeCategory = escapeHtml(data.category || data.artworkType || "Open to suggestions");
  const safeMedium = escapeHtml(data.medium || "Not specified");
  const safeSurface = escapeHtml(data.surface || "Not specified");
  const safePreferredSize = escapeHtml(data.preferredSize || "Not specified");
  const safeBudget = escapeHtml(data.budget || "Flexible");
  const safeMessage = data.message ? escapeHtml(data.message) : "<em>Shared via references / To be discussed during consultation</em>";

  const htmlBody = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #222;">Thank you for your custom order request!</h2>
      <p>Hi ${safeFirstName},</p>
      <p>We have successfully received your custom artwork inquiry. Your reference number is <strong>${safeOrderReference}</strong>.</p>
      <p>I am so thrilled you chose me to bring your vision to life. I will personally review your project details and get back to you within 48 hours to discuss the next steps and provide a quote.</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #666;">
        <h3 style="margin-top: 0; color: #444;">Your Request Summary:</h3>
        <p><strong>Category:</strong> ${safeCategory}</p>
        <p><strong>Medium:</strong> ${safeMedium}</p>
        <p><strong>Surface:</strong> ${safeSurface}</p>
        <p><strong>Preferred Size:</strong> ${safePreferredSize}</p>
        <p><strong>Estimated Budget:</strong> ${safeBudget}</p>
        <p><strong>Project Details:</strong><br/>${safeMessage}</p>
      </div>

      <div style="text-align: center; margin: 26px 0; padding: 20px; background-color: #f7f9f8; border-radius: 8px; border: 1px solid #e4ded1;">
        <p style="margin: 0 0 12px 0; font-size: 13px; color: #4a463f; font-weight: 500;">
          Have additional reference images or specific dimensions in mind?
        </p>
        <a href="mailto:orders@anjoriarts.com?subject=Regarding%20Inquiry%20%23${encodeURIComponent(safeOrderReference)}"
           style="display: inline-block; background-color: #355f5d; color: #ffffff; padding: 11px 24px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; letter-spacing: 0.02em;">
          ✉️ Reply to Orders Team
        </a>
        <p style="margin: 8px 0 0 0; font-size: 11px; color: #777;">
          You can also simply hit <strong>Reply</strong> in your email app.
        </p>
      </div>

      <p>Warmest regards,</p>
      <p><strong>Anjori Arts</strong><br/><span style="color: #666; font-size: 0.9em;">Anjori Arts</span></p>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from: 'Anjori Arts <noreply@anjoriarts.com>',
      to: [data.email],
      replyTo: 'orders@anjoriarts.com',
      subject: rawSubject,
      html: htmlBody,
    });

    if (error) {
      console.error("Customer Confirmation Email Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to send customer confirmation email:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function sendOrderPlacedEmail(order: {
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number; // in paise
  payment_method: string;
  payment_status: string;
  shipping_address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  items?: Array<{
    title: string;
    size: string;
    is_framed: boolean;
    quantity: number;
    unit_price: number;
  }>;
}) {
  if (!process.env.RESEND_API_KEY || !order.customer_email) {
    return { success: false, error: "Email configuration missing or no email provided." };
  }

  const formattedTotal = (order.total_amount / 100).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  const safeCustomerName = escapeHtml(order.customer_name);
  const safeOrderNumber = escapeHtml(order.order_number);
  const safeStreet = escapeHtml(order.shipping_address.street);
  const safeCity = escapeHtml(order.shipping_address.city);
  const safeState = escapeHtml(order.shipping_address.state);
  const safePincode = escapeHtml(order.shipping_address.pincode);

  const itemsHtml = (order.items || [])
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px 0;">
          <strong>${escapeHtml(item.title)}</strong><br/>
          <span style="font-size: 12px; color: #666;">Size: ${escapeHtml(item.size)} • ${item.is_framed ? "Framed" : "Unframed"}</span>
        </td>
        <td style="padding: 10px 0; text-align: center;">${Number(item.quantity) || 1}</td>
        <td style="padding: 10px 0; text-align: right;">₹${(((Number(item.unit_price) || 0) * (Number(item.quantity) || 1)) / 100).toLocaleString("en-IN")}</td>
      </tr>
    `
    )
    .join("");

  const rawSubject = `Order Confirmed: ${order.order_number} | Anjori Arts`;

  const htmlBody = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
      <div style="text-align: center; padding: 24px 0; border-bottom: 1px solid #eaeaea;">
        <h1 style="font-size: 24px; font-weight: 600; margin: 0; color: #111;">Anjori Arts</h1>
        <p style="font-size: 13px; color: #777; margin: 4px 0 0 0;">Handcrafted Indian Heritage & Contemporary Fine Art</p>
      </div>

      <div style="padding: 24px 0;">
        <h2 style="font-size: 20px; color: #111; margin-bottom: 8px;">Thank you for your order, ${safeCustomerName}!</h2>
        <p style="font-size: 14px; color: #555;">
          We are delighted to receive your order <strong>#${safeOrderNumber}</strong>. Each artwork is handcrafted with utmost care and crated in museum-grade packaging with complimentary transit insurance.
        </p>

        <div style="background-color: #fbfbfb; border: 1px solid #ececec; border-radius: 8px; padding: 18px; margin: 20px 0;">
          <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #222;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="border-bottom: 2px solid #ddd; text-align: left; color: #888;">
                <th style="padding-bottom: 8px;">Artwork</th>
                <th style="padding-bottom: 8px; text-align: center;">Qty</th>
                <th style="padding-bottom: 8px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding-top: 12px; font-weight: bold; text-align: right;">Total Amount:</td>
                <td style="padding-top: 12px; font-weight: bold; text-align: right; color: #111; font-size: 15px;">${formattedTotal}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style="margin: 20px 0; padding: 16px; background-color: #f9f9f9; border-radius: 8px; font-size: 13px;">
          <p style="margin: 0 0 6px 0;"><strong>Shipping Destination:</strong></p>
          <p style="margin: 0; color: #555;">
            ${safeStreet}, ${safeCity}, ${safeState} - ${safePincode}
          </p>
        </div>

        <p style="font-size: 13px; color: #666;">
          You will receive shipment updates and a courier tracking link (BlueDart, Delhivery, or India Post) as soon as your artwork is crated and dispatched.
        </p>

        <div style="text-align: center; margin: 24px 0 10px 0; padding: 18px 20px; background-color: #f7f9f8; border-radius: 8px; border: 1px solid #e4ded1;">
          <p style="margin: 0 0 10px 0; font-size: 13px; color: #4a463f; font-weight: 500;">
            Need to update delivery instructions or have questions about your order?
          </p>
          <a href="mailto:orders@anjoriarts.com?subject=Regarding%20Order%20%23${encodeURIComponent(safeOrderNumber)}"
             style="display: inline-block; background-color: #355f5d; color: #ffffff; padding: 11px 24px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; letter-spacing: 0.02em;">
            ✉️ Reply to Orders Team
          </a>
          <p style="margin: 8px 0 0 0; font-size: 11px; color: #777;">
            You can also simply hit <strong>Reply</strong> in your email app.
          </p>
        </div>
      </div>

      <div style="border-top: 1px solid #eaeaea; padding-top: 18px; text-align: center; font-size: 12px; color: #999;">
        <p>Anjori Arts • Puducherry, India • support@anjoriarts.com • +91 80519 60916</p>
      </div>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from: 'Anjori Arts <noreply@anjoriarts.com>',
      to: [order.customer_email],
      bcc: ['anjoriarts@gmail.com'],
      replyTo: 'orders@anjoriarts.com',
      subject: rawSubject,
      html: htmlBody,
    });

    if (error) {
      console.error("sendOrderPlacedEmail error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to send order email:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function sendAdminOrderAlertEmail(order: {
  order_id?: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  country_code: string;
  total_amount: number; // in paise
  payment_method: string;
  payment_status: string;
  payment_reference?: string | null;
  receipt_url?: string | null;
  delivery_instructions?: string | null;
  shipping_address: {
    street: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
  };
  items?: Array<{
    title: string;
    size: string;
    is_framed: boolean;
    quantity: number;
    unit_price: number;
  }>;
}) {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: "Email configuration missing." };
  }

  const formattedTotal = (order.total_amount / 100).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  const cleanPhone = order.customer_phone.replace(/\D/g, "");
  const cleanCountryCode = order.country_code.replace(/\D/g, "");
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanCountryCode}${cleanPhone}?text=${encodeURIComponent(
        `Hello ${order.customer_name}, regards from Anjori Arts regarding your order #${order.order_number}.`
      )}`
    : null;

  const safeCustomerName = escapeHtml(order.customer_name);
  const safeCustomerEmail = escapeHtml(order.customer_email);
  const safeCustomerPhone = escapeHtml(order.customer_phone);
  const safeCountryCode = escapeHtml(order.country_code);
  const safeOrderNumber = escapeHtml(order.order_number);
  const safeStreet = escapeHtml(order.shipping_address.street);
  const safeLandmark = order.shipping_address.landmark ? escapeHtml(order.shipping_address.landmark) : null;
  const safeCity = escapeHtml(order.shipping_address.city);
  const safeState = escapeHtml(order.shipping_address.state);
  const safePincode = escapeHtml(order.shipping_address.pincode);
  const safeCountry = escapeHtml(order.shipping_address.country || "India");
  const safePaymentMethod = escapeHtml(order.payment_method);
  const safePaymentStatus = escapeHtml(order.payment_status);
  const safePaymentReference = order.payment_reference ? escapeHtml(order.payment_reference) : null;
  const safeDeliveryInstructions = order.delivery_instructions ? escapeHtml(order.delivery_instructions) : null;
  const safeReceiptUrl = sanitizeUrl(order.receipt_url);

  const itemsHtml = (order.items || [])
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #e5e5e5;">
        <td style="padding: 10px 0;">
          <strong>${escapeHtml(item.title)}</strong><br/>
          <span style="font-size: 12px; color: #666;">Size: ${escapeHtml(item.size)} • ${item.is_framed ? "Custom Framed" : "Unframed"}</span>
        </td>
        <td style="padding: 10px 0; text-align: center;">${Number(item.quantity) || 1}</td>
        <td style="padding: 10px 0; text-align: right; font-weight: 500;">₹${(((Number(item.unit_price) || 0) * (Number(item.quantity) || 1)) / 100).toLocaleString("en-IN")}</td>
      </tr>
    `
    )
    .join("");

  const rawAdminOrderId = order.order_id || order.order_number;
  const adminOrderUrl = `https://www.anjoriarts.com/admin/orders/${encodeURIComponent(rawAdminOrderId)}`;
  const rawSubject = `🎉 [New Order] ${order.order_number} (${formattedTotal}) — ${order.customer_name}`;

  const htmlBody = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.5;">
      <div style="background-color: #7c2d12; color: #fff; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 600;">New Artwork Order Received</h1>
        <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Order Reference: <strong>#${safeOrderNumber}</strong></p>
      </div>

      <div style="border: 1px solid #e5e5e5; border-top: none; padding: 24px; border-radius: 0 0 8px 8px; background-color: #ffffff;">
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 16px; margin-bottom: 16px;">
          <div>
            <span style="font-size: 11px; text-transform: uppercase; color: #888; font-weight: 600;">Collector</span>
            <p style="margin: 4px 0 0 0; font-size: 15px; font-weight: bold; color: #111;">${safeCustomerName}</p>
            <p style="margin: 2px 0 0 0; font-size: 13px; color: #555;">
              <a href="mailto:${safeCustomerEmail}" style="color: #7c2d12; text-decoration: none;">${safeCustomerEmail}</a>
            </p>
            <p style="margin: 2px 0 0 0; font-size: 13px; color: #555;">
              Phone: <strong>${safeCountryCode} ${safeCustomerPhone}</strong> 
              ${
                whatsappUrl
                  ? `(<a href="${escapeHtml(whatsappUrl)}" target="_blank" rel="noopener noreferrer" style="color: #059669; font-weight: 600; text-decoration: none;">WhatsApp</a> • `
                  : "("
              }
               <a href="tel:${cleanCountryCode}${cleanPhone}" style="color: #7c2d12; text-decoration: none;">Call</a>)
            </p>
          </div>
        </div>

        <div style="margin-bottom: 20px; font-size: 13px; background-color: #fafafa; padding: 14px; border-radius: 6px; border: 1px solid #f0f0f0;">
          <strong style="color: #333; display: block; margin-bottom: 4px;">Delivery Destination:</strong>
          <span style="color: #555;">
            ${safeStreet}
            ${safeLandmark ? `<br/>Landmark: ${safeLandmark}` : ""}
            <br/>${safeCity}, ${safeState} - <strong>${safePincode}</strong>
            <br/>${safeCountry}
          </span>
          ${
            safeDeliveryInstructions
              ? `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #ddd; color: #b45309;">
                  <strong>Special Instructions:</strong> &ldquo;${safeDeliveryInstructions}&rdquo;
                 </div>`
              : ""
          }
        </div>

        <div style="margin-bottom: 20px; font-size: 13px; background-color: #f8fafc; padding: 14px; border-radius: 6px; border: 1px solid #e2e8f0;">
          <strong style="color: #333; display: block; margin-bottom: 4px;">Payment Selection:</strong>
          <span style="color: #555;">
            Method: <strong>${safePaymentMethod}</strong> • Status: <strong>${safePaymentStatus}</strong>
            ${safePaymentReference ? `<br/>UTR / Reference: <code style="background: #e2e8f0; padding: 2px 4px; border-radius: 4px;">${safePaymentReference}</code>` : ""}
            ${safeReceiptUrl ? `<br/>Payment Receipt: <a href="${safeReceiptUrl}" target="_blank" rel="noopener noreferrer" style="color: #7c2d12; font-weight: bold;">View Attached Screenshot</a>` : ""}
          </span>
        </div>

        <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #222; text-transform: uppercase; letter-spacing: 0.5px;">Ordered Artworks</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 16px;">
          <thead>
            <tr style="border-bottom: 2px solid #ddd; text-align: left; color: #888; font-size: 11px; text-transform: uppercase;">
              <th style="padding-bottom: 8px;">Artwork</th>
              <th style="padding-bottom: 8px; text-align: center;">Qty</th>
              <th style="padding-bottom: 8px; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding-top: 14px; font-weight: bold; text-align: right; font-size: 14px;">Total Order Value:</td>
              <td style="padding-top: 14px; font-weight: bold; text-align: right; color: #7c2d12; font-size: 17px;">${formattedTotal}</td>
            </tr>
          </tfoot>
        </table>

        <div style="text-align: center; margin-top: 24px; padding-top: 18px; border-top: 1px solid #eee;">
          <a href="${escapeHtml(adminOrderUrl)}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #7c2d12; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 13px;">
            Open in Admin Dashboard ➔
          </a>
        </div>
      </div>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from: 'Anjori Arts <noreply@anjoriarts.com>',
      to: ['anjoriarts@gmail.com'],
      replyTo: order.customer_email,
      subject: rawSubject,
      html: htmlBody,
    });

    if (error) {
      console.error("sendAdminOrderAlertEmail error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to send admin order alert email:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function sendOrderFailureAlertEmail(data: {
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  country_code?: string;
  error_message: string;
  total_amount?: number;
  payment_method?: string;
  items_summary?: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: "Email configuration missing." };
  }

  const rawSubject = `⚠️ [Order Failed Alert] Checkout Issue for ${data.customer_name || "Guest Customer"}`;

  const cleanPhone = (data.customer_phone || "").replace(/\D/g, "");
  const cleanCountryCode = (data.country_code || "+91").replace(/\D/g, "");
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanCountryCode}${cleanPhone}?text=${encodeURIComponent(
        `Hello ${data.customer_name || "there"}, regards from Anjori Arts. We noticed you had an issue completing your order and wanted to assist you directly.`
      )}`
    : null;

  const safeCustomerName = escapeHtml(data.customer_name || "Not provided");
  const safeCustomerEmail = data.customer_email ? escapeHtml(data.customer_email) : null;
  const safeCustomerPhone = data.customer_phone ? escapeHtml(data.customer_phone) : null;
  const safeCountryCode = escapeHtml(data.country_code || "+91");
  const safeErrorMessage = escapeHtml(data.error_message);
  const safePaymentMethod = data.payment_method ? escapeHtml(data.payment_method) : null;
  const safeItemsSummary = data.items_summary ? escapeHtml(data.items_summary) : null;

  const htmlBody = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.5;">
      <div style="background-color: #b91c1c; color: #fff; padding: 18px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 18px; font-weight: 600;">Checkout Failure Alert</h1>
        <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">A customer attempted to place an order but encountered an error.</p>
      </div>

      <div style="border: 1px solid #e5e5e5; border-top: none; padding: 24px; border-radius: 0 0 8px 8px; background-color: #ffffff; font-size: 13px;">
        <p style="color: #666; margin-top: 0;">
          This alert allows you to proactively follow up with the collector so the acquisition is not lost.
        </p>

        <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 14px; margin-bottom: 16px; color: #991b1b;">
          <strong>Error Detail:</strong><br/>
          <code style="font-size: 12px;">${safeErrorMessage}</code>
        </div>

        <div style="background-color: #fafafa; border: 1px solid #eee; border-radius: 6px; padding: 14px; margin-bottom: 16px;">
          <strong>Customer Contact Information:</strong>
          <p style="margin: 6px 0 2px 0;"><strong>Name:</strong> ${safeCustomerName}</p>
          <p style="margin: 2px 0;"><strong>Email:</strong> ${safeCustomerEmail ? `<a href="mailto:${safeCustomerEmail}">${safeCustomerEmail}</a>` : "Not provided"}</p>
          <p style="margin: 2px 0;">
            <strong>Phone:</strong> ${safeCountryCode} ${safeCustomerPhone || "Not provided"}
            ${
              whatsappUrl
                ? `— <a href="${escapeHtml(whatsappUrl)}" target="_blank" rel="noopener noreferrer" style="color: #059669; font-weight: bold; text-decoration: none;">Reach out on WhatsApp ➔</a>`
                : ""
            }
          </p>
          ${data.total_amount ? `<p style="margin: 2px 0;"><strong>Attempted Amount:</strong> ₹${(data.total_amount / 100).toLocaleString("en-IN")}</p>` : ""}
          ${safePaymentMethod ? `<p style="margin: 2px 0;"><strong>Attempted Payment:</strong> ${safePaymentMethod}</p>` : ""}
          ${safeItemsSummary ? `<p style="margin: 2px 0;"><strong>Artworks:</strong> ${safeItemsSummary}</p>` : ""}
        </div>

        <p style="font-size: 11px; color: #888; text-align: center; margin-bottom: 0;">
          Anjori Arts Automated System Alert • Puducherry, India
        </p>
      </div>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from: 'Anjori Arts <noreply@anjoriarts.com>',
      to: ['anjoriarts@gmail.com'],
      replyTo: data.customer_email || 'orders@anjoriarts.com',
      subject: rawSubject,
      html: htmlBody,
    });

    if (error) {
      console.error("sendOrderFailureAlertEmail error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to send order failure email:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
