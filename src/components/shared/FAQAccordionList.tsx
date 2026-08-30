"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQGroup {
  category: string;
  items: FAQItem[];
}

export function FAQAccordionList({ groups }: { groups: FAQGroup[] }) {
  const [openItem, setOpenItem] = React.useState<string | null>("group-0-item-0");

  const toggle = (id: string) => {
    setOpenItem((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-12">
      {groups.map((group, groupIdx) => (
        <div key={group.category} className="space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="font-serif text-xl font-semibold text-foreground">
              {group.category}
            </h2>
          </div>

          <div className="space-y-3">
            {group.items.map((item, idx) => {
              const id = `group-${groupIdx}-item-${idx}`;
              const isOpen = openItem === id;

              return (
                <div
                  key={item.question}
                  className={cn(
                    "overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200",
                    isOpen
                      ? "border-primary/60 bg-muted/30 shadow-xs"
                      : "hover:border-border/80"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggle(id)}
                    aria-expanded={isOpen}
                    className="flex w-full cursor-pointer items-center justify-between p-5 text-left transition-colors"
                  >
                    <span className="font-serif text-base font-medium text-foreground sm:text-lg pr-4">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={cn(
                        "size-5 shrink-0 text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-180 text-primary"
                      )}
                    />
                  </button>

                  <div
                    className={cn(
                      "grid transition-all duration-200 ease-in-out",
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 pb-5 pt-1 text-sm sm:text-base leading-relaxed text-muted-foreground border-t border-border/40 mt-1">
                        {item.answer}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
