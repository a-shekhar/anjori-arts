import * as React from "react";
import { Section, Text, Heading, Link } from "@react-email/components";
import { EmailLayout } from "./EmailLayout";

export interface CustomerInquiryConfirmationEmailProps {
  customerName: string;
  orderReference: string;
  subject?: string;
  message?: string;
}

export function CustomerInquiryConfirmationEmail({
  customerName,
  orderReference,
  subject,
  message,
}: CustomerInquiryConfirmationEmailProps) {
  return (
    <EmailLayout previewText={`We have received your inquiry [${orderReference}] • Anjori Arts`}>
      <Heading as="h2" style={headingStyle}>
        Inquiry Received 🎨
      </Heading>

      <Text style={paragraphStyle}>
        Hello {customerName},
      </Text>

      <Text style={paragraphStyle}>
        Thank you for reaching out to Anjori Arts. Every artwork and bespoke commission in our studio is crafted slowly by hand—honoring traditional Indian art forms while crafting something deeply meaningful for your space.
      </Text>

      {/* Reference Box */}
      <Section style={referenceBoxStyle}>
        <Text style={referenceBoxLabelStyle}>
          Your Inquiry Reference:
        </Text>
        <Text style={referenceCodeStyle}>
          {orderReference}
        </Text>
      </Section>

      {subject && (
        <Section style={cardStyle}>
          <Text style={cardHeadingStyle}>
            Project Details
          </Text>
          <Text style={infoRowStyle}>
            <strong>Tradition / Subject:</strong> {subject}
          </Text>
        </Section>
      )}

      {message && (
        <Section style={{ marginTop: "20px" }}>
          <Text style={sectionTitleStyle}>
            Your Notes / Inspiration
          </Text>
          <Text style={notesStyle}>
            {message}
          </Text>
        </Section>
      )}

      {/* Reply Card */}
      <Section style={supportCardStyle}>
        <Text style={supportCardTextStyle}>
          Have additional reference images or specific dimensions in mind?
        </Text>
        <Link
          href={`mailto:orders@anjoriarts.com?subject=Regarding%20Inquiry%20%23${encodeURIComponent(orderReference)}`}
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

const referenceBoxStyle: React.CSSProperties = {
  backgroundColor: "#e7efeb",
  border: "1px solid #c8dbd4",
  borderRadius: "10px",
  padding: "18px 20px",
  textAlign: "center" as const,
  margin: "24px 0",
};

const referenceBoxLabelStyle: React.CSSProperties = {
  margin: "0 0 6px 0",
  fontSize: "12px",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  color: "#355f5d",
};

const referenceCodeStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "24px",
  fontWeight: 700,
  letterSpacing: "4px",
  color: "#2b2926",
  margin: "0",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#f7f9f8",
  borderRadius: "10px",
  border: "1px solid #e4ded1",
  padding: "18px 20px",
  marginTop: "16px",
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
  margin: "0 0 8px 0",
};

const infoRowStyle: React.CSSProperties = {
  color: "#4a463f",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "4px 0",
};

const notesStyle: React.CSSProperties = {
  color: "#4a463f",
  fontSize: "13px",
  lineHeight: "20px",
  backgroundColor: "#faf7f0",
  border: "1px solid #e4ded1",
  borderRadius: "8px",
  padding: "14px 18px",
  whiteSpace: "pre-wrap" as const,
  margin: "0",
};

const supportCardStyle: React.CSSProperties = {
  textAlign: "center" as const,
  padding: "20px",
  backgroundColor: "#f7f9f8",
  borderRadius: "8px",
  border: "1px solid #e4ded1",
  marginTop: "28px",
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
