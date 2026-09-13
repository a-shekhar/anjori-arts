import * as React from "react";
import { Section, Text, Heading } from "@react-email/components";
import { EmailLayout } from "./EmailLayout";

export interface AdminAlertEmailProps {
  title: string;
  previewText: string;
  details: Array<{ label: string; value: string }>;
  notes?: string;
}

export function AdminAlertEmail({
  title,
  previewText,
  details,
  notes,
}: AdminAlertEmailProps) {
  return (
    <EmailLayout previewText={previewText}>
      <Heading as="h2" style={headingStyle}>
        {title}
      </Heading>

      <Section style={cardStyle}>
        <Text style={cardHeadingStyle}>
          Event Overview
        </Text>
        {details.map((item, idx) => (
          <Text key={idx} style={rowStyle}>
            <strong style={{ color: "#2b2926" }}>{item.label}:</strong> {item.value}
          </Text>
        ))}
      </Section>

      {notes && (
        <Section style={{ marginTop: "20px" }}>
          <Text style={sectionTitleStyle}>
            Customer Notes / Message:
          </Text>
          <Text style={notesStyle}>
            {notes}
          </Text>
        </Section>
      )}
    </EmailLayout>
  );
}

const headingStyle: React.CSSProperties = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: "20px",
  fontWeight: 600,
  color: "#2b2926",
  lineHeight: "1.3",
  margin: "0 0 16px 0",
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

const rowStyle: React.CSSProperties = {
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
