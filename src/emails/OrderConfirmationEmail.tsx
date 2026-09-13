import * as React from "react";
import { Section, Text, Heading, Link } from "@react-email/components";
import { EmailLayout } from "./EmailLayout";
import { siteConfig } from "@/config/site";

export interface OrderItemEmailProps {
  title: string;
  size: string;
  is_framed: boolean;
  quantity: number;
  unit_price: number;
}

export interface OrderConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
  formattedTotal: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  items?: OrderItemEmailProps[];
}

export function OrderConfirmationEmail({
  orderNumber,
  customerName,
  formattedTotal,
  paymentMethod,
  paymentStatus,
  shippingAddress,
  items = [],
}: OrderConfirmationEmailProps) {
  const cleanOrderNumber = orderNumber.startsWith("#") ? orderNumber.slice(1) : orderNumber;

  return (
    <EmailLayout previewText={`Order Confirmation #${cleanOrderNumber} • Anjori Arts`}>
      <Heading as="h2" style={headingStyle}>
        Acquisition Confirmed 🎨
      </Heading>

      <Text style={paragraphStyle}>
        Hello {customerName},
      </Text>

      <Text style={paragraphStyle}>
        Thank you for acquiring handcrafted artwork from Anjori Arts. Every painting in our studio is created with patience, honoring sacred traditional Indian art forms. We have safely recorded your order and our studio is preparing it for museum-grade packaging and transit.
      </Text>

      {/* Order Summary Card */}
      <Section style={cardStyle}>
        <Text style={cardHeadingStyle}>
          Order Summary
        </Text>
        <Text style={infoRowStyle}>
          <strong>Order Reference:</strong> <span style={monoStyle}>#{cleanOrderNumber}</span>
        </Text>
        <Text style={infoRowStyle}>
          <strong>Payment Method:</strong> {paymentMethod.toUpperCase()}
        </Text>
        <Text style={infoRowStyle}>
          <strong>Payment Status:</strong> {paymentStatus.toUpperCase()}
        </Text>
        <Text style={infoRowStyle}>
          <strong>Total Order Value:</strong> <span style={priceStyle}>{formattedTotal}</span>
        </Text>
      </Section>

      {/* Ordered Artworks */}
      {items.length > 0 && (
        <Section style={{ marginTop: "24px" }}>
          <Text style={sectionTitleStyle}>
            Ordered Artworks
          </Text>
          {items.map((item, idx) => (
            <Section key={idx} style={itemRowStyle}>
              <Text style={itemTitleStyle}>
                {item.title}
              </Text>
              <Text style={itemDetailsStyle}>
                {item.size ? `Scale: ${item.size}` : "Original"} &bull; {item.is_framed ? "Custom Framed" : "Unframed"} &bull; Qty: {item.quantity}
              </Text>
            </Section>
          ))}
        </Section>
      )}

      {/* Shipping Address Card */}
      <Section style={cardStyle}>
        <Text style={cardHeadingStyle}>
          Delivery Destination
        </Text>
        <Text style={infoRowStyle}>{shippingAddress.street}</Text>
        <Text style={infoRowStyle}>
          {shippingAddress.city}, {shippingAddress.state} - <strong>{shippingAddress.pincode}</strong>
        </Text>
        <Text style={infoRowStyle}>India</Text>
      </Section>

      {/* CTA Button to Collector Dashboard */}
      <Section style={ctaSectionStyle}>
        <Link
          href={`${siteConfig.url}/account/orders`}
          style={ctaButtonStyle}
        >
          View Order in Collector Account &rarr;
        </Link>
      </Section>

      {/* Support Box */}
      <Section style={supportCardStyle}>
        <Text style={supportCardTextStyle}>
          Questions about your shipment or custom framing?
        </Text>
        <Link
          href={`mailto:orders@anjoriarts.com?subject=Regarding%20Order%20%23${encodeURIComponent(cleanOrderNumber)}`}
          style={supportButtonStyle}
        >
          ✉️ Reply to Orders Team (orders@anjoriarts.com)
        </Link>
        <Text style={supportSubtextStyle}>
          You can also simply hit <strong>Reply</strong> in your email client.
        </Text>
      </Section>
    </EmailLayout>
  );
}

const headingStyle: React.CSSProperties = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: "22px",
  fontWeight: 600,
  color: "#2b2926",
  lineHeight: "1.3",
  margin: "0 0 16px 0",
};

const paragraphStyle: React.CSSProperties = {
  color: "#4a463f",
  fontSize: "15px",
  lineHeight: "1.65",
  margin: "0 0 16px 0",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#f7f9f8",
  borderRadius: "10px",
  border: "1px solid #e4ded1",
  padding: "18px 20px",
  marginTop: "20px",
};

const cardHeadingStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  color: "#355f5d",
  margin: "0 0 10px 0",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  color: "#355f5d",
  margin: "0 0 10px 0",
};

const infoRowStyle: React.CSSProperties = {
  color: "#4a463f",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "4px 0",
};

const monoStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "14px",
  fontWeight: 700,
  color: "#2b2926",
};

const priceStyle: React.CSSProperties = {
  fontWeight: 700,
  color: "#355f5d",
  fontSize: "15px",
};

const itemRowStyle: React.CSSProperties = {
  padding: "12px 0",
  borderBottom: "1px solid #e4ded1",
};

const itemTitleStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 600,
  color: "#2b2926",
  margin: "0 0 4px 0",
};

const itemDetailsStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#69655d",
  margin: "0",
};

const ctaSectionStyle: React.CSSProperties = {
  textAlign: "center" as const,
  margin: "30px 0 20px 0",
};

const ctaButtonStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "14px 32px",
  fontSize: "14px",
  fontWeight: 600,
  color: "#ffffff",
  textDecoration: "none",
  borderRadius: "10px",
  backgroundColor: "#5f9795",
  boxShadow: "0 4px 12px rgba(95, 151, 149, 0.28)",
  letterSpacing: "0.02em",
};

const supportCardStyle: React.CSSProperties = {
  textAlign: "center" as const,
  padding: "20px",
  backgroundColor: "#f7f9f8",
  borderRadius: "8px",
  border: "1px solid #e4ded1",
  marginTop: "24px",
};

const supportCardTextStyle: React.CSSProperties = {
  margin: "0 0 12px 0",
  fontSize: "13px",
  color: "#4a463f",
  fontWeight: 500,
};

const supportButtonStyle: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#355f5d",
  color: "#ffffff",
  padding: "10px 22px",
  borderRadius: "6px",
  textDecoration: "none",
  fontSize: "13px",
  fontWeight: 600,
  letterSpacing: "0.02em",
};

const supportSubtextStyle: React.CSSProperties = {
  margin: "10px 0 0 0",
  fontSize: "11px",
  color: "#787265",
};
