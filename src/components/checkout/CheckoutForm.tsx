"use client";

import { useState, useEffect, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  ShieldCheck,
  Truck,
  Sparkles,
  Lock,
  QrCode,
  Building2,
  Copy,
  Check,
  Upload,
  ArrowRight,
  ShoppingBag,
  Loader2,
  AlertCircle,
  Clock,
  CreditCard,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/helpers";
import { UPI_CONFIG, PAYMENT_METHODS } from "@/config/constants";
import { createOrder, uploadPaymentReceipt } from "@/actions/orders";
import {
  createRazorpayOrder,
  verifyAndCompleteRazorpayOrder,
} from "@/actions/razorpay";
import { CountryCodeSelect } from "@/components/ui/country-code-select";
import type { PaymentMethod, UserAddress } from "@/types";

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler: (response: RazorpaySuccessResponse) => void | Promise<void>;
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: (response: { error?: { description?: string } }) => void) => void;
}

interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if ((window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const emptySubscribe = () => () => {};

export function CheckoutForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getDeliveryCharge = useCartStore((state) => state.getDeliveryCharge);
  const getTotal = useCartStore((state) => state.getTotal);

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [customerPhone, setCustomerPhone] = useState("");
  const [pincode, setPincode] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [currentUser, setCurrentUser] = useState<{ email?: string; name?: string } | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const applySavedAddress = (addr: UserAddress) => {
    setSelectedAddressId(addr.id);
    setCustomerName(addr.recipient_name);
    setCustomerPhone(addr.phone);
    setStreet(addr.street);
    setLandmark(addr.landmark || "");
    setCity(addr.city);
    setStateName(addr.state);
    setPincode(addr.pincode);
    setPinDetectedInfo(`${addr.city}, ${addr.state}`);
  };

  // Auto-prefill customer details if logged in
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const meta = user.user_metadata || {};
      const name =
        [meta.first_name, meta.last_name].filter(Boolean).join(" ") ||
        meta.full_name ||
        "";
      const email = user.email || "";
      let phone = meta.phone || "";
      if (phone.startsWith("+91")) {
        phone = phone.slice(3);
      }

      setCurrentUser({ email, name });
      setCustomerName((prev) => prev || name);
      setCustomerEmail((prev) => prev || email);
      if (phone) {
        setCustomerPhone((prev) => prev || phone);
      }

      // Fetch saved delivery addresses for authenticated collector
      try {
        const { data: addrs } = await supabase
          .from("user_addresses")
          .select("*")
          .eq("user_id", user.id)
          .order("is_default", { ascending: false })
          .order("created_at", { ascending: false });

        if (addrs && addrs.length > 0) {
          const list = addrs as UserAddress[];
          setSavedAddresses(list);
          const defaultAddr = list.find((a) => a.is_default) || list[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
            setCustomerName(defaultAddr.recipient_name);
            setCustomerPhone(defaultAddr.phone);
            setStreet(defaultAddr.street);
            setLandmark(defaultAddr.landmark || "");
            setCity(defaultAddr.city);
            setStateName(defaultAddr.state);
            setPincode(defaultAddr.pincode);
            setPinDetectedInfo(`${defaultAddr.city}, ${defaultAddr.state}`);
          }
        }
      } catch (err) {
        console.error("[CheckoutForm] Error loading saved addresses:", err);
      }
    });
  }, []);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("razorpay");
  const [paymentReference, setPaymentReference] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  // PIN lookup helper state
  const [pinLoading, setPinLoading] = useState(false);
  const [pinDetectedInfo, setPinDetectedInfo] = useState<string | null>(null);

  // Copy helper
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied ${key} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Indian Pincode Auto-Lookup
  const handlePincodeChange = async (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 6);
    setPincode(clean);

    if (clean.length === 6) {
      setPinLoading(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${clean}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data[0]?.Status === "Success" && data[0].PostOffice?.length > 0) {
            const po = data[0].PostOffice[0];
            const detectedCity = po.District || po.Block || po.Name;
            const detectedState = po.State;
            setCity(detectedCity);
            setStateName(detectedState);
            setPinDetectedInfo(`${detectedCity}, ${detectedState}`);
            toast.success(`Location detected: ${detectedCity}, ${detectedState}`);
          } else {
            setPinDetectedInfo(null);
          }
        }
      } catch {
        // Fallback: silently ignore network error so user can fill manually
        setPinDetectedInfo(null);
      } finally {
        setPinLoading(false);
      }
    } else {
      setPinDetectedInfo(null);
    }
  };

  // File Upload Handler for manual transfer receipt
  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file size must be less than 10MB.");
      return;
    }

    setReceiptFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setReceiptPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (!mounted) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-64 rounded-lg bg-muted/60" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <div className="h-64 rounded-2xl border border-border bg-card/60" />
            <div className="h-72 rounded-2xl border border-border bg-card/60" />
          </div>
          <div className="lg:col-span-5">
            <div className="h-96 rounded-2xl border border-border bg-card/60" />
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary shadow-xs">
          <ShoppingBag className="size-10" aria-hidden="true" />
        </div>
        <h2 className="mt-6 font-serif text-2xl font-semibold text-foreground">
          Your shopping bag is empty
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          There are no artworks in your bag to complete checkout. Discover original handcrafted paintings and unique pieces.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span>Explore Gallery</span>
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const deliveryCharge = getDeliveryCharge();
  const total = getTotal();
  const totalInRupees = Math.round(total / 100);

  // Dynamic UPI payment link
  const upiPayLink = `upi://pay?pa=${UPI_CONFIG.upiId}&pn=${encodeURIComponent(
    UPI_CONFIG.payeeName
  )}&am=${totalInRupees}&cu=INR&tn=Art%20Order`;

  // Dynamic QR code generation via standard SVG Google Charts API / QR server
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    upiPayLink
  )}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side quick checks
    if (!customerName.trim() || customerName.trim().length < 2) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!customerEmail.trim() || !customerEmail.includes("@")) {
      toast.error("Please enter a valid email address for order confirmation.");
      return;
    }
    if (!customerPhone.trim() || !/^[6-9]\d{9}$/.test(customerPhone.trim())) {
      toast.error("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (!pincode || !/^[1-9][0-9]{5}$/.test(pincode)) {
      toast.error("Please enter a valid 6-digit Indian PIN code.");
      return;
    }
    if (!street.trim() || street.trim().length < 5) {
      toast.error("Please enter your complete street address / building details.");
      return;
    }
    if (!city.trim() || !stateName.trim()) {
      toast.error("Please provide both city and state.");
      return;
    }

    if (paymentMethod === "razorpay") {
      startTransition(async () => {
        try {
          const loaded = await loadRazorpayScript();
          if (!loaded) {
            toast.error("Unable to load secure Razorpay gateway. Please check your internet connection.");
            return;
          }

          const baseFormData = {
            customerName: customerName.trim(),
            customerEmail: customerEmail.trim().toLowerCase(),
            customerPhone: customerPhone.trim(),
            countryCode,
            street: street.trim(),
            landmark: landmark.trim(),
            city: city.trim(),
            state: stateName.trim(),
            pincode: pincode.trim(),
            country: "India",
            deliveryInstructions: deliveryInstructions.trim(),
            paymentMethod: "razorpay" as const,
            paymentReference: "",
            receiptUrl: undefined,
          };

          const orderRes = await createRazorpayOrder({
            formData: baseFormData,
            items,
          });

          if (!orderRes.success || !orderRes.orderId || !orderRes.keyId) {
            toast.error(orderRes.error || "Failed to initialize payment gateway.");
            return;
          }

          const options: RazorpayOptions = {
            key: orderRes.keyId,
            amount: orderRes.amount || total,
            currency: orderRes.currency || "INR",
            name: "Anjori Arts",
            description: "Authentic Handcrafted Artworks & Curated Prints",
            image: "/logo.jpg",
            order_id: orderRes.orderId,
            prefill: {
              name: customerName.trim(),
              email: customerEmail.trim().toLowerCase(),
              contact: `${countryCode}${customerPhone.trim()}`,
            },
            theme: {
              color: "#8B2500",
            },
            handler: async function (response: RazorpaySuccessResponse) {
              const verifyToastId = toast.loading("Verifying payment security signature...");
              try {
                const verifyRes = await verifyAndCompleteRazorpayOrder({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  formData: {
                    ...baseFormData,
                    paymentReference: response.razorpay_payment_id,
                  },
                  items,
                });

                toast.dismiss(verifyToastId);

                if (verifyRes.success && verifyRes.orderNumber) {
                  toast.success("Payment verified! Your order has been placed.");
                  clearCart();
                  router.push(`/order-success/${verifyRes.orderNumber}`);
                } else {
                  toast.error(
                    verifyRes.error ||
                      "We received your payment but encountered an error saving your order. Gallery support has been notified."
                  );
                }
              } catch (verifyErr) {
                toast.dismiss(verifyToastId);
                console.error("[Razorpay Handler] Verification error:", verifyErr);
                toast.error("Error verifying payment signature. Please contact gallery support.");
              }
            },
            modal: {
              ondismiss: function () {
                toast.info("Payment was cancelled. Your artworks remain safe in your bag.");
              },
            },
          };

          const RazorpayWindow = (window as unknown as { Razorpay: RazorpayConstructor }).Razorpay;
          const rzpInstance = new RazorpayWindow(options);
          rzpInstance.on("payment.failed", function (failResponse) {
            console.error("[Razorpay] Payment failed:", failResponse);
            toast.error(failResponse.error?.description || "Payment failed. Please try another payment method.");
          });
          rzpInstance.open();
        } catch (err: unknown) {
          console.error("Razorpay initiation error:", err);
          toast.error("Failed to start Razorpay payment. Please try again.");
        }
      });
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          formData: {
            customerName: customerName.trim(),
            customerEmail: customerEmail.trim().toLowerCase(),
            customerPhone: customerPhone.trim(),
            countryCode,
            street: street.trim(),
            landmark: landmark.trim(),
            city: city.trim(),
            state: stateName.trim(),
            pincode: pincode.trim(),
            country: "India",
            deliveryInstructions: deliveryInstructions.trim(),
            paymentMethod,
            paymentReference: paymentReference.trim(),
            receiptUrl: undefined,
          },
          items,
        };

        const res = await createOrder(payload);

        if (!res.success || !res.orderNumber) {
          toast.error(res.error || "Failed to place order. Please try again.");
          return;
        }

        const orderNumber = res.orderNumber;

        // If collector uploaded a receipt, upload it now
        if (receiptFile) {
          toast.loading("Uploading payment confirmation receipt...");
          const formData = new FormData();
          formData.append("file", receiptFile);
          await uploadPaymentReceipt(orderNumber, formData);
        }

        toast.success("Order placed successfully! Redirecting to confirmation...");
        clearCart();
        router.push(`/order-success/${orderNumber}`);
      } catch (err: unknown) {
        console.error("Order submission error:", err);
        toast.error("An unexpected error occurred. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Top Reassurance Banner */}
      <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs sm:text-sm text-foreground">
        <Lock className="size-4 shrink-0 text-primary" aria-hidden="true" />
        <p>
          <strong className="font-semibold">Collector Secure Checkout: </strong>
          Your artwork reservation is insured and guaranteed authentic directly from Anjori Arts.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        {/* LEFT COLUMN: Shipping & Payment Details */}
        <div className="space-y-8 lg:col-span-7 xl:col-span-8">
          {/* Section 1: Contact & Delivery Address */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-7">
            <div className="flex items-center gap-2.5 border-b border-border/80 pb-4">
              <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                1
              </span>
              <h2 className="font-serif text-lg font-semibold text-foreground sm:text-xl">
                Collector Information &amp; Delivery Destination
              </h2>
            </div>

            <div className="mt-6 space-y-4">
              {currentUser ? (
                <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-2.5 text-xs text-primary">
                  <span>
                    Checking out as <strong>{currentUser.email}</strong>
                  </span>
                  <Link href="/account" className="font-medium underline hover:no-underline">
                    View Account
                  </Link>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-xs text-muted-foreground">
                  <span>Already an Anjori Arts collector?</span>
                  <Link
                    href="/login?redirect=/checkout"
                    className="font-medium text-primary hover:underline"
                  >
                    Sign in to speed up checkout
                  </Link>
                </div>
              )}

              {/* Saved Delivery Addresses Picker */}
              {savedAddresses.length > 0 && (
                <div className="space-y-2.5 rounded-2xl border border-border bg-muted/20 p-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-primary" />
                      <span>Deliver to Saved Address</span>
                    </label>
                    <Link
                      href="/account/addresses"
                      className="text-[11px] text-primary hover:underline font-medium"
                    >
                      Manage Addresses
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => applySavedAddress(addr)}
                          className={`flex flex-col text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                            isSelected
                              ? "border-primary bg-primary/10 ring-1 ring-primary/30 text-foreground"
                              : "border-border bg-card hover:bg-muted/60 text-muted-foreground"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-semibold text-foreground capitalize">
                              {addr.address_type} • {addr.recipient_name}
                            </span>
                            {addr.is_default && (
                              <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded font-medium">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="truncate text-foreground/80">{addr.street}</p>
                          <p className="truncate text-muted-foreground">
                            {addr.city}, {addr.state} — {addr.pincode}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label htmlFor="customerName" className="block text-xs font-medium text-foreground">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <input
                  id="customerName"
                  type="text"
                  required
                  placeholder="e.g. Radhika Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="mt-1.5 min-h-[44px] w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="customerEmail" className="block text-xs font-medium text-foreground">
                    Email Address (for Invoice &amp; Updates) <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="customerEmail"
                    type="email"
                    required
                    placeholder="radhika@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="mt-1.5 min-h-[44px] w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div>
                  <label htmlFor="customerPhone" className="block text-xs font-medium text-foreground">
                    Mobile Number (for Courier Delivery) <span className="text-destructive">*</span>
                  </label>
                  <div className="mt-1.5 flex gap-2">
                    <CountryCodeSelect
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-24 shrink-0 rounded-xl"
                      aria-label="Country Code"
                    />
                    <input
                      id="customerPhone"
                      type="tel"
                      required
                      placeholder="9876543210"
                      maxLength={10}
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ""))}
                      className="min-h-[44px] flex-1 rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>
              </div>

              {/* PIN Code & Auto-Location */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="pincode" className="block text-xs font-medium text-foreground">
                      PIN Code <span className="text-destructive">*</span>
                    </label>
                    {pinLoading && (
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Loader2 className="size-3 animate-spin" />
                        Detecting...
                      </span>
                    )}
                  </div>
                  <input
                    id="pincode"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 605001"
                    value={pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    className="mt-1.5 min-h-[44px] w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring font-mono"
                  />
                  {pinDetectedInfo && (
                    <span className="mt-1 block text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      ✓ {pinDetectedInfo}
                    </span>
                  )}
                </div>

                <div>
                  <label htmlFor="city" className="block text-xs font-medium text-foreground">
                    City / District <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="city"
                    type="text"
                    required
                    placeholder="Puducherry"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1.5 min-h-[44px] w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div>
                  <label htmlFor="state" className="block text-xs font-medium text-foreground">
                    State <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="state"
                    type="text"
                    required
                    placeholder="Puducherry"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="mt-1.5 min-h-[44px] w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>

              {/* Street Address & Landmark */}
              <div>
                <label htmlFor="street" className="block text-xs font-medium text-foreground">
                  Flat, House No., Building, Street Address <span className="text-destructive">*</span>
                </label>
                <input
                  id="street"
                  type="text"
                  required
                  placeholder="e.g. 14, Rue Dumas, White Town"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="mt-1.5 min-h-[44px] w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div>
                <label htmlFor="landmark" className="block text-xs font-medium text-foreground">
                  Nearby Landmark (Optional)
                </label>
                <input
                  id="landmark"
                  type="text"
                  placeholder="e.g. Near Promenade Beach / French Institute"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="mt-1.5 min-h-[44px] w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              {/* Special Instructions */}
              <div>
                <label htmlFor="deliveryInstructions" className="block text-xs font-medium text-foreground">
                  Delivery / Framing Instructions (Optional)
                </label>
                <textarea
                  id="deliveryInstructions"
                  rows={2}
                  maxLength={500}
                  placeholder="e.g. Please use extra edge padding for gifting, or call before arriving..."
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  className="mt-1.5 w-full resize-none rounded-xl border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Payment Method */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-7">
            <div className="flex items-center gap-2.5 border-b border-border/80 pb-4">
              <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                2
              </span>
              <div>
                <h2 className="font-serif text-lg font-semibold text-foreground sm:text-xl">
                  Select Payment Method
                </h2>
                <p className="text-xs text-muted-foreground">
                  Tailored for authentic high-ticket Indian art collecting
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {/* OPTION 1: Razorpay (Cards, NetBanking, UPI, Wallets) - PRIMARY / RECOMMENDED */}
              <label
                htmlFor="payment-razorpay"
                className={`relative flex cursor-pointer flex-col rounded-2xl border p-4 sm:p-5 transition-all ${
                  paymentMethod === "razorpay"
                    ? "border-primary bg-primary/5 shadow-xs"
                    : "border-border bg-background hover:bg-muted/40"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    id="payment-razorpay"
                    name="paymentMethod"
                    value="razorpay"
                    checked={paymentMethod === "razorpay"}
                    onChange={() => setPaymentMethod("razorpay")}
                    className="mt-1 size-4 text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-foreground flex items-center gap-2">
                        <CreditCard className="size-4 text-primary" aria-hidden="true" />
                        Razorpay Gateway (Cards, UPI, NetBanking, Wallets)
                      </span>
                      <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                        Recommended • Instant Confirmation
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      Pay instantly with Google Pay, PhonePe, Paytm, UPI, Credit / Debit Cards (Visa, MasterCard, RuPay), or NetBanking via 256-bit encrypted checkout.
                    </p>
                  </div>
                </div>

                {paymentMethod === "razorpay" && (
                  <div className="mt-4 border-t border-border/70 pt-3 text-xs text-muted-foreground flex items-center gap-2">
                    <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                    <span>Razorpay secure payment window will open when you click Pay.</span>
                  </div>
                )}
              </label>

              {/* OPTION 2: UPI / QR Code & Direct Bank Transfer */}
              <label
                htmlFor="payment-upi"
                className={`relative flex cursor-pointer flex-col rounded-2xl border p-4 sm:p-5 transition-all ${
                  paymentMethod === "upi_qr"
                    ? "border-primary bg-primary/5 shadow-xs"
                    : "border-border bg-background hover:bg-muted/40"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    id="payment-upi"
                    name="paymentMethod"
                    value="upi_qr"
                    checked={paymentMethod === "upi_qr"}
                    onChange={() => setPaymentMethod("upi_qr")}
                    className="mt-1 size-4 text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-foreground flex items-center gap-2">
                        <QrCode className="size-4 text-primary" aria-hidden="true" />
                        UPI QR &amp; Direct Bank Transfer (NEFT / IMPS / RTGS)
                        Instant UPI / Dynamic QR Code
                      </span>
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        Direct Studio Account • High-Value Art
                        Instant Verification • Zero Fee
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      Direct transfer to Anjori Arts official bank account. Ideal for high-ticket original artworks without card transaction limits.
                      Scan the QR code with any UPI app (Google Pay, PhonePe, Paytm, BHIM) or pay directly to our verified studio UPI ID.
                    </p>
                  </div>
                </div>

                {/* Sub-panel when UPI is selected */}
                {paymentMethod === "upi_qr" && (
                  <div className="mt-5 border-t border-border/70 pt-5 text-xs">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-12 items-center">
                      {/* Left: QR Code */}
                      <div className="flex flex-col items-center justify-center text-center md:col-span-5 border-b pb-4 md:border-b-0 md:border-r md:pr-4 border-border/70">
                        <div className="relative size-44 rounded-xl border border-border bg-white p-2 shadow-xs">
                          <Image
                            src={qrCodeUrl}
                            alt="Anjori Arts UPI QR Code"
                            width={160}
                            height={160}
                            className="size-full object-contain"
                            unoptimized
                          />
                        </div>
                        <p className="mt-2 text-[11px] font-medium text-foreground">
                          Scan with Google Pay, PhonePe, Paytm
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Exact Amount: <strong>{formatPrice(total)}</strong>
                        </p>
                      </div>

                      {/* Right: Studio UPI ID & Simple Guide */}
                      <div className="space-y-3.5 md:col-span-7">
                        {/* UPI ID Section */}
                        <div>
                          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                            Official Studio UPI ID
                          </span>
                          <div className="mt-1 flex items-center justify-between rounded-xl border border-border bg-muted/30 px-3 py-2.5 shadow-2xs">
                            <div className="flex items-center gap-2">
                              <span className="size-2 rounded-full bg-emerald-500" />
                              <span className="font-mono text-xs font-bold text-foreground">
                                {UPI_CONFIG.upiId}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(UPI_CONFIG.upiId, "UPI ID")}
                              className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                            >
                              {copiedKey === "UPI ID" ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                              <span>{copiedKey === "UPI ID" ? "Copied" : "Copy UPI ID"}</span>
                            </button>
                          </div>
                        </div>

                        {/* Step-by-Step Payment Instructions */}
                        <div className="rounded-xl border border-border bg-muted/30 p-3.5 text-[11px] shadow-2xs space-y-2">
                          <span className="font-semibold text-foreground uppercase tracking-wider text-[10px] text-muted-foreground">
                            Simple 3-Step Payment
                          </span>
                          <ol className="space-y-1.5 text-muted-foreground list-decimal list-inside leading-relaxed">
                            <li>Open Google Pay, PhonePe, Paytm, or BHIM.</li>
                            <li>Scan the QR code on the left, or paste the copied UPI ID.</li>
                            <li>Pay <strong className="text-foreground">{formatPrice(total)}</strong> and enter the 12-digit UPI Reference / UTR number below.</li>
                          </ol>
                        </div>
                      </div>
                    </div>

                        {/* UTR Input & Receipt Upload */}
                        <div className="pt-2 border-t border-border/70 space-y-2">
                          <div>
                            <label htmlFor="utr-ref" className="block text-[11px] font-medium text-foreground">
                              Transaction Reference / UTR Number (Optional now)
                            </label>
                            <input
                              id="utr-ref"
                              type="text"
                              placeholder="e.g. 423819028192 or UPI Ref"
                              value={paymentReference}
                              onChange={(e) => setPaymentReference(e.target.value)}
                              className="mt-1 min-h-[36px] w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-1 focus-visible:ring-primary"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-foreground">
                              Upload Payment Screenshot (Optional now, or via email later)
                            </label>
                            <div className="mt-1 flex items-center gap-3">
                              <label
                                htmlFor="receipt-upload"
                                className="inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                              >
                                <Upload className="size-3.5 text-primary" />
                                <span>{receiptFile ? "Change Image" : "Choose File"}</span>
                              </label>
                              <input
                                id="receipt-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleReceiptChange}
                                className="sr-only"
                              />
                              {receiptFile && (
                                <span className="truncate text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                  ✓ {receiptFile.name}
                                </span>
                              )}
                            </div>
                            {receiptPreview && (
                              <div className="mt-2 relative size-16 rounded-lg overflow-hidden border border-border">
                                <Image
                                  src={receiptPreview}
                                  alt="Receipt preview"
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </label>

              {/* OPTION 3: Pay on Dispatch / Confirmation */}
              <label
                htmlFor="payment-dispatch"
                className={`relative flex cursor-pointer flex-col rounded-2xl border p-4 sm:p-5 transition-all ${
                  paymentMethod === "pay_on_dispatch"
                    ? "border-primary bg-primary/5 shadow-xs"
                    : "border-border bg-background hover:bg-muted/40"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    id="payment-dispatch"
                    name="paymentMethod"
                    value="pay_on_dispatch"
                    checked={paymentMethod === "pay_on_dispatch"}
                    onChange={() => setPaymentMethod("pay_on_dispatch")}
                    className="mt-1 size-4 text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-foreground flex items-center gap-2">
                        <Clock className="size-4 text-primary" aria-hidden="true" />
                        Pay on Dispatch / Advance Verification
                      </span>
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        Gallery Verified
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      Reserve your selected artworks now. Our gallery manager will contact you within 24 hours to review custom framing preferences and collect a 50% advance confirmation before packing.
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Order Summary & Placement */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-7">
            <h2 className="font-serif text-xl font-semibold text-foreground">
              Order Summary
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {items.reduce((s, i) => s + i.quantity, 0)} {items.length === 1 ? "artwork" : "artworks"} in your order
            </p>

            {/* Itemized list preview */}
            <div className="mt-4 max-h-60 overflow-y-auto divide-y divide-border/60 pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-3 text-xs">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/30">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate font-medium text-foreground">{item.title}</h3>
                    <p className="text-[11px] text-muted-foreground">
                      {item.size} • {item.isFramed ? "Framed" : "Unframed"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right font-medium text-foreground">
                    {formatPrice((item.sellingPrice + (item.framingPrice || 0)) * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Financials */}
            <dl className="mt-5 space-y-3 border-t border-border/80 pt-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <dt>Subtotal</dt>
                <dd className="font-medium text-foreground">{formatPrice(subtotal)}</dd>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <dt className="flex items-center gap-1.5">
                  <span>Transit Insurance &amp; Shipping</span>
                </dt>
                <dd className="font-semibold text-emerald-600 dark:text-emerald-400">
                  FREE
                </dd>
              </div>

              <div className="flex justify-between text-xs text-muted-foreground">
                <dt>Estimated Taxes</dt>
                <dd>Included in Price (12% GST)</dd>
              </div>

              <div className="border-t border-border pt-3">
                <div className="flex items-baseline justify-between">
                  <dt className="text-base font-semibold text-foreground">Total Payable</dt>
                  <dd className="font-serif text-2xl font-bold text-foreground">
                    {formatPrice(total)}
                  </dd>
                </div>
              </div>
            </dl>

            {/* Primary Order Action Button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={isPending}
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-center font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>
                      {paymentMethod === "razorpay"
                        ? "Opening Razorpay Gateway..."
                        : "Confirming Order..."}
                    </span>
                  </>
                ) : (
                  <>
                    <Lock className="size-4" aria-hidden="true" />
                    <span>
                      {paymentMethod === "razorpay"
                        ? `Pay with Razorpay • ${formatPrice(total)}`
                        : `Place Order • ${formatPrice(total)}`}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Trust Assurances */}
            <div className="mt-6 space-y-2.5 border-t border-border/80 pt-5 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>100% Authentic Handcrafted Indian Art</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>Museum-Grade Packaging &amp; Insured Transit</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>Collector Certificate &amp; Official Tax Invoice</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

