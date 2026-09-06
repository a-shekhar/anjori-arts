import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
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

  const subject =
    type === "inquiry"
      ? `New Inquiry: ${data.subject} from ${data.firstName} ${data.lastName}`
      : `New Custom Order [${data.orderReference}] from ${data.firstName} ${data.lastName}`;

  // Simple HTML email body
  let htmlBody = `
    <h2>${subject}</h2>
    <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
    <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
    <p><strong>Phone:</strong> ${data.phone ? `${data.countryCode} ${data.phone}` : "Not provided"}</p>
  `;

  if (type === "inquiry") {
    htmlBody += `
      <p><strong>Category:</strong> ${data.category}</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <h3>Message:</h3>
      <p style="white-space: pre-wrap;">${data.message}</p>
    `;
  } else {
    htmlBody += `
      <p><strong>Order Reference:</strong> ${data.orderReference}</p>
      ${data.artworkId ? `<p><strong>Artwork ID:</strong> ${data.artworkId}</p>` : ""}
      <p><strong>Category:</strong> ${data.category || data.artworkType || "Custom"}</p>
      <p><strong>Medium:</strong> ${data.medium || "Not specified"}</p>
      <p><strong>Surface:</strong> ${data.surface || "Not specified"}</p>
      <p><strong>Preferred Size:</strong> ${data.preferredSize || "Not specified"}</p>
      <p><strong>Estimated Budget:</strong> ${data.budget || "Flexible"}</p>
      <p><strong>Reference Link:</strong> ${
        data.referenceLink ? `<a href="${data.referenceLink}">${data.referenceLink}</a>` : "None"
      }</p>
      ${
        data.referenceImages && data.referenceImages.length > 0
          ? `<h3>Reference Images:</h3>
             <div style="display: flex; gap: 10px; flex-wrap: wrap;">
               ${data.referenceImages
                 .map(
                   (url: string) =>
                     `<a href="${url}" target="_blank"><img src="${url}" alt="Reference Image" style="max-height: 150px; max-width: 150px; object-fit: cover; border-radius: 8px;" /></a>`
                 )
                 .join("")}
             </div>`
          : ""
      }
      <h3>Project Details:</h3>
      <p style="white-space: pre-wrap;">${data.message}</p>
    `;
  }

  try {
    const { error } = await resend.emails.send({
      from: 'Anjori Arts <noreply@anjoriarts.com>',
      to: ['anjoriarts@gmail.com'],
      replyTo: data.email,
      subject: subject,
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

  const subject = `Your Custom Order Request Received - ${data.orderReference}`;

  const htmlBody = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #222;">Thank you for your custom order request!</h2>
      <p>Hi ${data.firstName},</p>
      <p>We have successfully received your custom artwork inquiry. Your reference number is <strong>${data.orderReference}</strong>.</p>
      <p>I am so thrilled you chose me to bring your vision to life. I will personally review your project details and get back to you within 48 hours to discuss the next steps and provide a quote.</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #666;">
        <h3 style="margin-top: 0; color: #444;">Your Request Summary:</h3>
        <p><strong>Category:</strong> ${data.category || data.artworkType || "Custom"}</p>
        <p><strong>Medium:</strong> ${data.medium || "Not specified"}</p>
        <p><strong>Surface:</strong> ${data.surface || "Not specified"}</p>
        <p><strong>Preferred Size:</strong> ${data.preferredSize || "Not specified"}</p>
        <p><strong>Estimated Budget:</strong> ${data.budget || "Flexible"}</p>
        <p><strong>Project Details:</strong><br/>${data.message}</p>
      </div>

      <p>If you have any additional reference images or thoughts to share in the meantime, simply reply directly to this email. I love seeing what inspires you!</p>
      <br/>
      <p>Warmest regards,</p>
      <p><strong>Anjori Arts</strong><br/><span style="color: #666; font-size: 0.9em;">Anjori Arts</span></p>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from: 'Anjori Arts <noreply@anjoriarts.com>',
      to: [data.email],
      replyTo: 'orders@anjoriarts.com',
      subject: subject,
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

  const itemsHtml = (order.items || [])
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px 0;">
          <strong>${item.title}</strong><br/>
          <span style="font-size: 12px; color: #666;">Size: ${item.size} • ${item.is_framed ? "Framed" : "Unframed"}</span>
        </td>
        <td style="padding: 10px 0; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px 0; text-align: right;">₹${((item.unit_price * item.quantity) / 100).toLocaleString("en-IN")}</td>
      </tr>
    `
    )
    .join("");

  const subject = `Order Confirmed: ${order.order_number} | Anjori Arts`;

  const htmlBody = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
      <div style="text-align: center; padding: 24px 0; border-bottom: 1px solid #eaeaea;">
        <h1 style="font-size: 24px; font-weight: 600; margin: 0; color: #111;">Anjori Arts</h1>
        <p style="font-size: 13px; color: #777; margin: 4px 0 0 0;">Handcrafted Indian Heritage & Contemporary Fine Art</p>
      </div>

      <div style="padding: 24px 0;">
        <h2 style="font-size: 20px; color: #111; margin-bottom: 8px;">Thank you for your order, ${order.customer_name}!</h2>
        <p style="font-size: 14px; color: #555;">
          We are delighted to receive your order <strong>#${order.order_number}</strong>. Each artwork is handcrafted with utmost care and crated in museum-grade packaging with complimentary transit insurance.
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
            ${order.shipping_address.street}, ${order.shipping_address.city}, ${order.shipping_address.state} - ${order.shipping_address.pincode}
          </p>
        </div>

        <p style="font-size: 13px; color: #666;">
          You will receive shipment updates and a courier tracking link (BlueDart, Delhivery, or India Post) as soon as your artwork is crated and dispatched.
        </p>
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
      subject: subject,
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
  const whatsappUrl = `https://wa.me/${order.country_code.replace("+", "")}${cleanPhone}?text=${encodeURIComponent(
    `Hello ${order.customer_name}, regards from Anjori Arts regarding your order #${order.order_number}.`
  )}`;

  const itemsHtml = (order.items || [])
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #e5e5e5;">
        <td style="padding: 10px 0;">
          <strong>${item.title}</strong><br/>
          <span style="font-size: 12px; color: #666;">Size: ${item.size} • ${item.is_framed ? "Custom Framed" : "Unframed"}</span>
        </td>
        <td style="padding: 10px 0; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px 0; text-align: right; font-weight: 500;">₹${((item.unit_price * item.quantity) / 100).toLocaleString("en-IN")}</td>
      </tr>
    `
    )
    .join("");

  const adminOrderUrl = `https://www.anjoriarts.com/admin/orders/${order.order_id || order.order_number}`;
  const subject = `🎉 [New Order] ${order.order_number} (${formattedTotal}) — ${order.customer_name}`;

  const htmlBody = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.5;">
      <div style="background-color: #7c2d12; color: #fff; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 600;">New Artwork Order Received</h1>
        <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Order Reference: <strong>#${order.order_number}</strong></p>
      </div>

      <div style="border: 1px solid #e5e5e5; border-top: none; padding: 24px; border-radius: 0 0 8px 8px; background-color: #ffffff;">
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 16px; margin-bottom: 16px;">
          <div>
            <span style="font-size: 11px; text-transform: uppercase; color: #888; font-weight: 600;">Collector</span>
            <p style="margin: 4px 0 0 0; font-size: 15px; font-weight: bold; color: #111;">${order.customer_name}</p>
            <p style="margin: 2px 0 0 0; font-size: 13px; color: #555;">
              <a href="mailto:${order.customer_email}" style="color: #7c2d12; text-decoration: none;">${order.customer_email}</a>
            </p>
            <p style="margin: 2px 0 0 0; font-size: 13px; color: #555;">
              Phone: <strong>${order.country_code} ${order.customer_phone}</strong> 
              (<a href="${whatsappUrl}" target="_blank" style="color: #059669; font-weight: 600; text-decoration: none;">WhatsApp</a> • 
               <a href="tel:${order.country_code}${cleanPhone}" style="color: #7c2d12; text-decoration: none;">Call</a>)
            </p>
          </div>
        </div>

        <div style="margin-bottom: 20px; font-size: 13px; background-color: #fafafa; padding: 14px; border-radius: 6px; border: 1px solid #f0f0f0;">
          <strong style="color: #333; display: block; margin-bottom: 4px;">Delivery Destination:</strong>
          <span style="color: #555;">
            ${order.shipping_address.street}
            ${order.shipping_address.landmark ? `<br/>Landmark: ${order.shipping_address.landmark}` : ""}
            <br/>${order.shipping_address.city}, ${order.shipping_address.state} - <strong>${order.shipping_address.pincode}</strong>
            <br/>${order.shipping_address.country || "India"}
          </span>
          ${
            order.delivery_instructions
              ? `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #ddd; color: #b45309;">
                  <strong>Special Instructions:</strong> &ldquo;${order.delivery_instructions}&rdquo;
                 </div>`
              : ""
          }
        </div>

        <div style="margin-bottom: 20px; font-size: 13px; background-color: #f8fafc; padding: 14px; border-radius: 6px; border: 1px solid #e2e8f0;">
          <strong style="color: #333; display: block; margin-bottom: 4px;">Payment Selection:</strong>
          <span style="color: #555;">
            Method: <strong>${order.payment_method}</strong> • Status: <strong>${order.payment_status}</strong>
            ${order.payment_reference ? `<br/>UTR / Reference: <code style="background: #e2e8f0; padding: 2px 4px; border-radius: 4px;">${order.payment_reference}</code>` : ""}
            ${order.receipt_url ? `<br/>Payment Receipt: <a href="${order.receipt_url}" target="_blank" style="color: #7c2d12; font-weight: bold;">View Attached Screenshot</a>` : ""}
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
          <a href="${adminOrderUrl}" target="_blank" style="display: inline-block; background-color: #7c2d12; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 13px;">
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
      subject: subject,
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

  const subject = `⚠️ [Order Failed Alert] Checkout Issue for ${data.customer_name || "Guest Customer"}`;

  const cleanPhone = (data.customer_phone || "").replace(/\D/g, "");
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${(data.country_code || "+91").replace("+", "")}${cleanPhone}?text=${encodeURIComponent(
        `Hello ${data.customer_name || "there"}, regards from Anjori Arts. We noticed you had an issue completing your order and wanted to assist you directly.`
      )}`
    : null;

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
          <code style="font-size: 12px;">${data.error_message}</code>
        </div>

        <div style="background-color: #fafafa; border: 1px solid #eee; border-radius: 6px; padding: 14px; margin-bottom: 16px;">
          <strong>Customer Contact Information:</strong>
          <p style="margin: 6px 0 2px 0;"><strong>Name:</strong> ${data.customer_name || "Not provided"}</p>
          <p style="margin: 2px 0;"><strong>Email:</strong> <a href="mailto:${data.customer_email}">${data.customer_email || "Not provided"}</a></p>
          <p style="margin: 2px 0;">
            <strong>Phone:</strong> ${data.country_code || "+91"} ${data.customer_phone || "Not provided"}
            ${
              whatsappUrl
                ? `— <a href="${whatsappUrl}" target="_blank" style="color: #059669; font-weight: bold; text-decoration: none;">Reach out on WhatsApp ➔</a>`
                : ""
            }
          </p>
          ${data.total_amount ? `<p style="margin: 2px 0;"><strong>Attempted Amount:</strong> ₹${(data.total_amount / 100).toLocaleString("en-IN")}</p>` : ""}
          ${data.payment_method ? `<p style="margin: 2px 0;"><strong>Attempted Payment:</strong> ${data.payment_method}</p>` : ""}
          ${data.items_summary ? `<p style="margin: 2px 0;"><strong>Artworks:</strong> ${data.items_summary}</p>` : ""}
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
      subject: subject,
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

