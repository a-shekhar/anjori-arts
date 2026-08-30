"use client";

import { MessageCircle } from "lucide-react";
import { hasWhatsApp, inquiryHref } from "@/config/site";

export function WhatsAppCTA() {
  return (
    <aside aria-label="Artist inquiry" className="group fixed bottom-5 right-5 z-40 flex items-center gap-2 sm:bottom-6 sm:right-6">
      <span className="hidden rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100 sm:inline-flex">{hasWhatsApp ? "Chat with the artist" : "Email the artist"}</span>
      <a
        href={inquiryHref}
        target={hasWhatsApp ? "_blank" : undefined}
        rel={hasWhatsApp ? "noopener noreferrer" : undefined}
        aria-label={hasWhatsApp ? "Start a WhatsApp inquiry" : "Email the artist"}
        className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95"
      >
        <MessageCircle className="size-5" />
      </a>
    </aside>
  );
}
