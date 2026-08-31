"use client";

import { useCart } from "@/context/CartContext";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loadCheckoutOptions, processGuestCheckout } from "./actions";
import type { StoreOption } from "@/types";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, subtotal, clearCart, isLoading: cartLoading } = useCart();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [boxOptions, setBoxOptions] = useState<StoreOption[]>([]);
  const [giftOptions, setGiftOptions] = useState<StoreOption[]>([]);
  const [boxOptionId, setBoxOptionId] = useState("");
  const [giftPackingId, setGiftPackingId] = useState("");
  const [giftMessage, setGiftMessage] = useState("");
  const requestKey = useRef<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    postalCode: "",
    province: "Punjab",
  });

  useEffect(() => {
    setMounted(true);
    void loadCheckoutOptions()
      .then(({ boxOptions: boxes, giftPacking }) => {
        setBoxOptions(boxes);
        setGiftOptions(giftPacking);
      })
      .catch((error) => console.error("Unable to load packaging options:", error))
      .finally(() => setOptionsLoading(false));
  }, []);

  const selectedBox = boxOptions.find((option) => option.id === boxOptionId);
  const selectedGift = giftOptions.find((option) => option.id === giftPackingId);
  const extrasTotal = Number(selectedBox?.price || 0) + Number(selectedGift?.price || 0);
  const displayedTotal = subtotal + 200 + extrasTotal;

  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if(entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [mounted]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsLoading(true);
    try {
      const orderData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        street: formData.street,
        city: formData.city,
        postalCode: formData.postalCode,
        province: formData.province,
      };

      requestKey.current ??= crypto.randomUUID();
      const result = await processGuestCheckout(
        orderData,
        cartItems.map((item) => ({
          variantId: item.product_variant_id,
          quantity: item.quantity,
          bundleId: item.bundle_id,
          bundleKey: item.bundle_key,
        })),
        requestKey.current,
        {
          boxOptionId: boxOptionId || undefined,
          giftPackingId: giftPackingId || undefined,
          giftMessage: giftPackingId ? giftMessage : undefined,
        },
      );

      if (!result.success) {
        toast.error(result.error || "Failed to create order");
        return;
      }

      await clearCart();
      const successParams = new URLSearchParams({
        order_number: result.trackingId,
        email_sent: result.emailSent ? "1" : "0",
      });
      router.push(`/checkout/success?${successParams.toString()}`);
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted || cartLoading) return null;

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen">
        <div className="page-head">
          <div className="container">
            <h1>Checkout</h1>
          </div>
        </div>
        <section className="container py-20 text-center">
          <h2 className="font-serif text-3xl text-[#2E2624]">Your cart is empty</h2>
          <p className="mt-3 text-[var(--ink-soft)]">Add a set or bundle before starting checkout.</p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/products" className="btn btn-fill">Shop Sets</Link>
            <Link href="/bundles" className="btn btn-outline">View Bundles</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="w-full flex flex-col min-h-screen">
      <div className="page-head" style={{ padding: '44px 0 26px' }}>
        <div className="container">
          <div className="checkout-steps">
            <span>Cart</span> &rarr; <span className="on">Checkout</span> &rarr; <span>Confirmation</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px,3.4vw,38px)' }}>Checkout</h1>
        </div>
      </div>

      <section style={{ paddingTop: '10px' }}>
        <div className="container">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-12 items-start">
            
            <div className="reveal in">
              <div className="form-card">
                <h3>Shipping Details</h3>
                <div className="form-row">
                  <div className="form-field">
                    <label>First Name</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Rimal" required />
                  </div>
                  <div className="form-field">
                    <label>Last Name</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Ahmed" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field full">
                    <label>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="you@email.com" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field full">
                    <label>Phone</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="03xx xxxxxxx" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field full">
                    <label>Street Address</label>
                    <input type="text" name="street" value={formData.street} onChange={handleInputChange} placeholder="House no, street, area" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label>City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="Rawalpindi" required />
                  </div>
                  <div className="form-field">
                    <label>Postal Code</label>
                    <input type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} placeholder="46000" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field full">
                    <label>Province</label>
                    <select name="province" value={formData.province} onChange={handleInputChange}>
                      <option value="Punjab">Punjab</option>
                      <option value="Sindh">Sindh</option>
                      <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                      <option value="Balochistan">Balochistan</option>
                      <option value="Islamabad Capital Territory">Islamabad Capital Territory</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-card">
                <h3>Packaging Options</h3>
                {optionsLoading ? (
                  <p className="text-sm text-[var(--ink-soft)]">Loading available packaging...</p>
                ) : (
                  <>
                    <div className="form-row">
                      <div className="form-field full">
                        <label htmlFor="boxOption">Box</label>
                        <select id="boxOption" value={boxOptionId} onChange={(event) => setBoxOptionId(event.target.value)}>
                          <option value="">Standard packaging — Included</option>
                          {boxOptions.map((option) => (
                            <option value={option.id} key={option.id}>
                              {option.name} — Rs {option.price.toLocaleString()}
                            </option>
                          ))}
                        </select>
                        {selectedBox?.description && <p className="mt-2 text-xs text-[var(--ink-soft)]">{selectedBox.description}</p>}
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-field full">
                        <label htmlFor="giftPacking">Gift Packing</label>
                        <select
                          id="giftPacking"
                          value={giftPackingId}
                          onChange={(event) => {
                            setGiftPackingId(event.target.value);
                            if (!event.target.value) setGiftMessage("");
                          }}
                        >
                          <option value="">No gift packing</option>
                          {giftOptions.map((option) => (
                            <option value={option.id} key={option.id}>
                              {option.name} — Rs {option.price.toLocaleString()}
                            </option>
                          ))}
                        </select>
                        {selectedGift?.description && <p className="mt-2 text-xs text-[var(--ink-soft)]">{selectedGift.description}</p>}
                      </div>
                    </div>
                    {giftPackingId && (
                      <div className="form-row">
                        <div className="form-field full">
                          <label htmlFor="giftMessage">Gift Message (optional)</label>
                          <textarea
                            id="giftMessage"
                            value={giftMessage}
                            onChange={(event) => setGiftMessage(event.target.value)}
                            maxLength={300}
                            rows={4}
                            placeholder="Write a short message for the recipient"
                          />
                          <p className="mt-1 text-right text-xs text-[var(--ink-soft)]">{giftMessage.length}/300</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="form-card">
                <h3>Payment Method</h3>
                <label className="pay-opt active">
                  <input type="radio" name="pay" checked readOnly /> Cash on Delivery (COD)
                </label>
              </div>
            </div>

            <div className="summary-card reveal in">
              <h3>Order Summary</h3>
              
              {cartItems.map((item) => (
                <div className="mini-line" key={item.line_id}>
                  <div className="cart-thumb">
                    {item.image ? (
                      <Image src={item.image} alt={item.title} width={54} height={54} className="w-full h-full object-cover rounded-[10px]" />
                    ) : (
                      <div className="fan-wrap" style={{ transform: 'scale(0.2)' }}><div className="nail nail1"></div><div className="nail nail2"></div><div className="nail nail3"></div><div className="nail nail4"></div><div className="nail nail5"></div></div>
                    )}
                  </div>
                  <div>
                    <h5>{item.title}</h5>
                    {item.bundle_name && <div className="text-xs font-semibold text-[#BE7681]">{item.bundle_name} · {item.bundle_discount}% off</div>}
                    <div className="meta">
                      Qty {item.quantity} &middot; {[item.shape, item.length, item.finish].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <div className="price">Rs {(item.price * item.quantity).toLocaleString()}</div>
                </div>
              ))}

              <div className="summary-row" style={{ marginTop: '20px' }}>
                <span>Subtotal</span>
                <span>Rs {subtotal.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>Rs 200</span>
              </div>
              {selectedBox && (
                <div className="summary-row">
                  <span>{selectedBox.name}</span>
                  <span>Rs {selectedBox.price.toLocaleString()}</span>
                </div>
              )}
              {selectedGift && (
                <div className="summary-row">
                  <span>{selectedGift.name}</span>
                  <span>Rs {selectedGift.price.toLocaleString()}</span>
                </div>
              )}
              <div className="summary-row total">
                <span>Total</span>
                <span>Rs {displayedTotal.toLocaleString()}</span>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-fill btn-block" 
                style={{ marginTop: '22px' }}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Place Order"}
              </button>
            </div>

          </form>
        </div>
      </section>
    </main>
  );
}
