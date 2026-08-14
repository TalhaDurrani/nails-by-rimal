"use client";

import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { processGuestCheckout } from "./actions";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, subtotal, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [payMethod] = useState("COD");

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
  }, []);

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
        address: `${formData.street}, ${formData.city}, ${formData.province} ${formData.postalCode}`,
        paymentMethod: payMethod
      };

      const result = await processGuestCheckout(orderData, cartItems, subtotal + 200);

      if (!result.success) {
        toast.error(result.error || "Failed to create order");
        return;
      }

      clearCart();
      router.push(`/checkout/success?order_number=${result.trackingId}`);
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

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
          <form onSubmit={handleSubmit} className="checkout-layout">
            
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
                <h3>Payment Method</h3>
                <label className="pay-opt active">
                  <input type="radio" name="pay" checked readOnly /> Cash on Delivery (COD)
                </label>
              </div>
            </div>

            <div className="summary-card reveal in">
              <h3>Order Summary</h3>
              
              {cartItems.map((item) => (
                <div className="mini-line" key={item.product_id}>
                  <div className="cart-thumb">
                    {item.image ? (
                      <Image src={item.image} alt={item.title} width={54} height={54} className="w-full h-full object-cover rounded-[10px]" />
                    ) : (
                      <div className="fan-wrap" style={{ transform: 'scale(0.2)' }}><div className="nail nail1"></div><div className="nail nail2"></div><div className="nail nail3"></div><div className="nail nail4"></div><div className="nail nail5"></div></div>
                    )}
                  </div>
                  <div>
                    <h5>{item.title}</h5>
                    <div className="meta">Qty {item.quantity} &middot; Almond, Medium</div>
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
              <div className="summary-row total">
                <span>Total</span>
                <span>Rs {(subtotal + 200).toLocaleString()}</span>
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
