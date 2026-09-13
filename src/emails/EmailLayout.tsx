import * as React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Link,
} from "@react-email/components";
import { siteConfig } from "@/config/site";

interface EmailLayoutProps {
  previewText: string;
  children: React.ReactNode;
}

export function EmailLayout({ previewText, children }: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head>
        <style>
          {`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');`}
        </style>
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          {/* Sun Gold Accent Stripe */}
          <Section style={goldStripeStyle}>&nbsp;</Section>

          {/* Header Banner */}
          <Section style={headerSectionStyle}>
            <Text style={kickerStyle}>
              Traditional Art &amp; Bespoke Design
            </Text>
            <Text style={brandTitleStyle}>
              Anjori Arts
            </Text>
            <Text style={taglineStyle}>
              &ldquo;Art that carries a little more meaning.&rdquo;
            </Text>
          </Section>

          {/* Main Card Content */}
          <Section style={contentSectionStyle}>
            {children}
          </Section>

          {/* Studio Sign-off & Footer */}
          <Section style={footerSectionStyle}>
            <Text style={founderNameStyle}>
              Jyotsna Sharma
            </Text>
            <Text style={founderRoleStyle}>
              Artist &amp; Founder &bull; Anjori Arts
            </Text>
            <Text style={footerInfoStyle}>
              Studio based in Puducherry, India<br />
              <Link href={siteConfig.url} style={footerLinkStyle}>
                anjoriarts.com
              </Link>
              {" • "}
              <Link href={`mailto:${siteConfig.email.primary}`} style={footerLinkStyle}>
                {siteConfig.email.primary}
              </Link>
              {" • "}
              <Link href="https://wa.me/918051960916" style={footerLinkStyle}>
                WhatsApp: +91 80519 60916
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const mainStyle: React.CSSProperties = {
  backgroundColor: "#faf7f0",
  fontFamily:
    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  color: "#2b2926",
  lineHeight: "1.65",
  padding: "36px 16px",
  margin: "0",
};

const containerStyle: React.CSSProperties = {
  backgroundColor: "#fffdf8",
  borderRadius: "14px",
  border: "1px solid #e4ded1",
  margin: "0 auto",
  maxWidth: "580px",
  overflow: "hidden",
  boxShadow: "0 10px 25px -5px rgba(43, 41, 38, 0.06)",
};

const goldStripeStyle: React.CSSProperties = {
  backgroundColor: "#ecc16b",
  height: "5px",
  fontSize: "1px",
  lineHeight: "1px",
};

const headerSectionStyle: React.CSSProperties = {
  backgroundColor: "#355f5d",
  padding: "36px 28px 30px 28px",
  textAlign: "center" as const,
  color: "#ffffff",
};

const kickerStyle: React.CSSProperties = {
  fontSize: "11px",
  letterSpacing: "0.18em",
  textTransform: "uppercase" as const,
  color: "#ecc16b",
  fontWeight: 600,
  margin: "0 0 6px 0",
};

const brandTitleStyle: React.CSSProperties = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: "28px",
  fontWeight: 600,
  letterSpacing: "0.5px",
  color: "#ffffff",
  margin: "0",
};

const taglineStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#e7efeb",
  fontStyle: "italic",
  margin: "8px 0 0 0",
};

const contentSectionStyle: React.CSSProperties = {
  padding: "40px 36px 28px 36px",
};

const footerSectionStyle: React.CSSProperties = {
  backgroundColor: "#f5f1e8",
  borderTop: "1px solid #e4ded1",
  padding: "28px 36px",
  textAlign: "center" as const,
};

const founderNameStyle: React.CSSProperties = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: "16px",
  fontWeight: 600,
  color: "#2b2926",
  margin: "0 0 4px 0",
};

const founderRoleStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#69655d",
  margin: "0 0 14px 0",
};

const footerInfoStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#8c887d",
  lineHeight: "1.6",
  margin: "0",
};

const footerLinkStyle: React.CSSProperties = {
  color: "#355f5d",
  textDecoration: "none",
  fontWeight: 500,
};
