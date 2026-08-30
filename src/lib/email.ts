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
      <p><strong>Artwork Type:</strong> ${data.artworkType}</p>
      <p><strong>Surface:</strong> ${data.surface || "Not specified"}</p>
      <p><strong>Preferred Size:</strong> ${data.preferredSize || "Not provided"}</p>
      <p><strong>Budget:</strong> ${data.budget || "Not provided"}</p>
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
        <p><strong>Type:</strong> ${data.artworkType}</p>
        <p><strong>Surface:</strong> ${data.surface || "Not specified"}</p>
        <p><strong>Details:</strong><br/>${data.message}</p>
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
