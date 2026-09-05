"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Calculator,
  Plus,
  Trash2,
  Check,
  Clock,
  FileText,
  Coins,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { updateCustomOrderQuotation } from "@/actions/admin-custom-orders";
import { toast } from "sonner";
import type { CustomOrder, CustomOrderItem } from "@/types";

interface CustomOrderQuotationCardProps {
  order: CustomOrder;
}

export function CustomOrderQuotationCard({ order }: CustomOrderQuotationCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Quotation items state
  const [items, setItems] = useState<CustomOrderItem[]>(
    order.items && order.items.length > 0
      ? order.items
      : []
  );

  // Deposit settings: default 50%
  const [isCustomDeposit, setIsCustomDeposit] = useState<boolean>(() => {
    if (!order.quote_total || order.quote_total === 0) return false;
    const half = Math.round(order.quote_total * 0.5);
    return order.advance_deposit !== undefined && order.advance_deposit !== half;
  });

  const [customDepositAmount, setCustomDepositAmount] = useState<number>(
    order.advance_deposit ?? 0
  );

  const [timeline, setTimeline] = useState<string>(
    order.estimated_timeline || ""
  );

  const [notes, setNotes] = useState<string>(
    order.admin_notes || ""
  );

  // Status transition checkbox (default checked if status is not already quoted/accepted/in_progress/completed)
  const shouldSuggestQuoted = ["new", "submitted", "reviewed"].includes(
    String(order.status).toLowerCase()
  );
  const [updateStatusToQuoted, setUpdateStatusToQuoted] = useState<boolean>(
    shouldSuggestQuoted
  );

  // Calculations
  const quoteTotal = items.reduce((acc, item) => acc + (item.totalPrice || 0), 0);
  const defaultDeposit = Math.round(quoteTotal * 0.5);
  const advanceDeposit = isCustomDeposit ? customDepositAmount : defaultDeposit;
  const balanceDue = Math.max(0, quoteTotal - advanceDeposit);
  const depositPercentage =
    quoteTotal > 0 ? Math.round((advanceDeposit / quoteTotal) * 100) : 50;

  // Item management
  const handleAddItem = () => {
    const newItem: CustomOrderItem = {
      id: "item-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      title: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleQuickPrefillFirstItem = () => {
    const defaultTitle = order.final_category || order.category || "Custom Commission Artwork";
    const defaultDesc = [
      order.final_medium || order.medium,
      order.final_surface || order.surface,
      order.final_size || order.preferred_size,
    ]
      .filter(Boolean)
      .join(", ");

    const newItem: CustomOrderItem = {
      id: "item-" + Date.now(),
      title: defaultTitle,
      description: defaultDesc,
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
    };
    setItems([newItem]);
  };

  const handleUpdateItem = (
    id: string,
    field: keyof CustomOrderItem,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "unitPrice") {
          const qty = Number(field === "quantity" ? value : item.quantity) || 0;
          const price = Number(field === "unitPrice" ? value : item.unitPrice) || 0;
          updated.totalPrice = Math.max(0, qty * price);
        }
        return updated;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveQuotation = async () => {
    // Validate empty titles
    const emptyTitle = items.find((i) => !i.title.trim());
    if (emptyTitle && items.length > 0) {
      toast.error("Please provide a name or title for all artwork items.");
      return;
    }

    const toastId = toast.loading("Saving itemized quotation...");

    try {
      const res = await updateCustomOrderQuotation(order.id, {
        items,
        quote_total: quoteTotal,
        deposit_percentage: depositPercentage,
        advance_deposit: advanceDeposit,
        estimated_timeline: timeline.trim() || null,
        admin_notes: notes.trim() || null,
        updateStatusToQuoted: updateStatusToQuoted && shouldSuggestQuoted,
      });

      if (res.success) {
        toast.success(
          updateStatusToQuoted && shouldSuggestQuoted
            ? "Quotation saved & status transitioned to Quoted!"
            : "Quotation saved successfully",
          { id: toastId }
        );
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(`Error: ${res.message || "Failed to save quotation"}`, {
          id: toastId,
        });
      }
    } catch {
      toast.error("Failed to save quotation", { id: toastId });
    }
  };

  const formatRupees = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const hasExistingQuote = (order.quote_total ?? 0) > 0 || (order.items && order.items.length > 0);

  return (
    <Card className="border shadow-xs">
      <CardHeader className="pb-3 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary shrink-0" />
            <CardTitle className="text-base font-semibold">
              Itemized Artwork Quotation
            </CardTitle>
            {hasExistingQuote ? (
              <Badge
                variant="outline"
                className="text-[11px] px-2 py-0 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 font-medium"
              >
                Quote Active: {formatRupees(order.quote_total || 0)}
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[11px] px-2 py-0 font-normal">
                No Quote Generated
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs">
            Manage multi-artwork pieces, copies, unit prices, 50% advance deposit, and delivery timelines.
          </CardDescription>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddItem}
          className="h-8 gap-1.5 text-xs self-start sm:self-auto shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Artwork Piece
        </Button>
      </CardHeader>

      <CardContent className="pt-4 space-y-6">
        {/* Line Items Table or Empty State */}
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center space-y-3 bg-muted/20">
            <Coins className="h-8 w-8 mx-auto text-muted-foreground/60" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                No quotation line items added yet
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Break down custom order costs into individual pieces, editions, or framing components for the client.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleQuickPrefillFirstItem}
                className="text-xs h-8 gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Prefill from Commission Specs
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleAddItem}
                className="text-xs h-8 gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Blank Item
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="overflow-x-auto -mx-4 sm:mx-0 border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-[38%] text-xs font-semibold">
                      Artwork Title & Description
                    </TableHead>
                    <TableHead className="w-[14%] text-xs font-semibold text-center">
                      Quantity / Pcs
                    </TableHead>
                    <TableHead className="w-[20%] text-xs font-semibold text-right">
                      Unit Price (₹)
                    </TableHead>
                    <TableHead className="w-[20%] text-xs font-semibold text-right">
                      Line Total (₹)
                    </TableHead>
                    <TableHead className="w-[8%] text-xs font-semibold text-center">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-muted/20">
                      {/* Title & Description */}
                      <TableCell className="align-top py-3">
                        <div className="space-y-1.5">
                          <Input
                            value={item.title}
                            onChange={(e) =>
                              handleUpdateItem(item.id, "title", e.target.value)
                            }
                            placeholder={`e.g. Artwork #${index + 1} (Name/Variant)`}
                            className="text-xs h-8 font-medium"
                          />
                          <Input
                            value={item.description || ""}
                            onChange={(e) =>
                              handleUpdateItem(item.id, "description", e.target.value)
                            }
                            placeholder="Specs, framing, dimensions (optional)"
                            className="text-[11px] h-7 text-muted-foreground"
                          />
                        </div>
                      </TableCell>

                      {/* Quantity */}
                      <TableCell className="align-top py-3">
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateItem(
                              item.id,
                              "quantity",
                              Math.max(1, parseInt(e.target.value, 10) || 1)
                            )
                          }
                          className="text-xs h-8 text-center font-mono w-20 mx-auto"
                        />
                      </TableCell>

                      {/* Unit Price */}
                      <TableCell className="align-top py-3 text-right">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                            ₹
                          </span>
                          <Input
                            type="number"
                            min="0"
                            step="100"
                            value={item.unitPrice === 0 ? "" : item.unitPrice}
                            onChange={(e) =>
                              handleUpdateItem(
                                item.id,
                                "unitPrice",
                                Math.max(0, parseFloat(e.target.value) || 0)
                              )
                            }
                            placeholder="0"
                            className="text-xs h-8 pl-6 text-right font-mono"
                          />
                        </div>
                      </TableCell>

                      {/* Line Total */}
                      <TableCell className="align-top py-3 text-right">
                        <div className="pt-1.5 font-mono text-xs font-semibold text-foreground">
                          {formatRupees(item.totalPrice)}
                        </div>
                      </TableCell>

                      {/* Delete */}
                      <TableCell className="align-top py-3 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddItem}
                className="h-7 text-xs text-primary gap-1 hover:bg-primary/10"
              >
                <Plus className="h-3 w-3" />
                Add Another Piece
              </Button>
            </div>
          </div>
        )}

        {/* Financial Calculation Panel & Deposit Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t">
          {/* Left Column: Timeline & Notes */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="quote-timeline" className="text-xs font-medium flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                Estimated Completion Timeline
              </Label>
              <Input
                id="quote-timeline"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                placeholder="e.g. 3 to 4 weeks (Includes framing & safe crating)"
                className="text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Shared with customer in quotations and WhatsApp updates.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quote-notes" className="text-xs font-medium flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-primary" />
                Internal Studio / Pricing Notes
              </Label>
              <Textarea
                id="quote-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Private artist notes, framing costs breakdown, pigment sourcing details..."
                className="text-xs resize-none"
              />
            </div>
          </div>

          {/* Right Column: Financial Summary Card */}
          <div className="bg-muted/30 p-4 rounded-xl border space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Payment & Deposit Breakdown
              </h4>

              {/* Subtotal */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Total Quotation Value:</span>
                <span className="font-semibold text-foreground font-mono text-sm">
                  {formatRupees(quoteTotal)}
                </span>
              </div>

              {/* Advance Deposit Section */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-foreground font-medium flex items-center gap-1">
                    Advance Deposit ({depositPercentage}%):
                  </span>
                  <span className="font-semibold text-primary font-mono text-sm">
                    {formatRupees(advanceDeposit)}
                  </span>
                </div>

                {/* Deposit mode toggle / override */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isCustomDeposit}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setIsCustomDeposit(checked);
                        if (!checked) {
                          setCustomDepositAmount(defaultDeposit);
                        } else if (customDepositAmount === 0) {
                          setCustomDepositAmount(defaultDeposit);
                        }
                      }}
                      className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5"
                    />
                    <span>Custom deposit override</span>
                  </label>
                  {!isCustomDeposit && (
                    <span className="text-[11px] text-primary/80 font-medium">
                      (Default 50% Auto-calculated)
                    </span>
                  )}
                </div>

                {isCustomDeposit && (
                  <div className="pt-1.5 flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                        ₹
                      </span>
                      <Input
                        type="number"
                        min="0"
                        max={quoteTotal}
                        value={customDepositAmount === 0 ? "" : customDepositAmount}
                        onChange={(e) =>
                          setCustomDepositAmount(
                            Math.max(0, parseFloat(e.target.value) || 0)
                          )
                        }
                        placeholder="Custom deposit in ₹"
                        className="text-xs h-8 pl-6 font-mono"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsCustomDeposit(false);
                        setCustomDepositAmount(defaultDeposit);
                      }}
                      className="h-8 text-[11px] text-muted-foreground hover:text-foreground"
                    >
                      Reset to 50%
                    </Button>
                  </div>
                )}
              </div>

              {/* Balance Due */}
              <div className="flex justify-between items-center text-xs pt-2 border-t">
                <span className="text-muted-foreground">Balance on Completion:</span>
                <span className="font-semibold text-foreground font-mono">
                  {formatRupees(balanceDue)}
                </span>
              </div>
            </div>

            {/* Status Transition & Save Action */}
            <div className="pt-4 border-t space-y-3">
              {shouldSuggestQuoted && (
                <div className="flex items-start gap-2 bg-primary/5 p-2.5 rounded-md border border-primary/20">
                  <Checkbox
                    id="auto-quote-status"
                    checked={updateStatusToQuoted}
                    onCheckedChange={(checked) =>
                      setUpdateStatusToQuoted(Boolean(checked))
                    }
                    className="mt-0.5"
                  />
                  <label
                    htmlFor="auto-quote-status"
                    className="text-xs text-foreground cursor-pointer leading-tight select-none"
                  >
                    <span className="font-medium text-primary">
                      Transition status to &ldquo;Quoted&rdquo;
                    </span>
                    <span className="block text-[11px] text-muted-foreground mt-0.5">
                      Updates custom order status from {order.status} to quoted upon saving.
                    </span>
                  </label>
                </div>
              )}

              <Button
                type="button"
                onClick={handleSaveQuotation}
                disabled={isPending}
                className="w-full text-xs gap-1.5 h-9"
              >
                <Check className="h-3.5 w-3.5" />
                {isPending ? "Saving Quotation..." : "Save Quotation & Financials"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
