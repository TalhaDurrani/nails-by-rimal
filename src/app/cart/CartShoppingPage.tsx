"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function CartShoppingPage() {
  const { cartItems, removeFromCart, updateQuantity, subtotal } = useCart();
  const [mounted, setMounted] = useState(false);

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
  }, [mounted, cartItems]);

  if (!mounted) return null;

  return (
    <main className="w-full flex flex-col min-h-screen">
      <div className="page-head">
        <div className="container">
          <div className="breadcrumb"><Link href="/">Home</Link> &nbsp;/&nbsp; Cart</div>
          <h1>Your Cart</h1>
        </div>
      </div>

      <section style={{ paddingTop: '20px', paddingBottom: '80px' }}>
        <div className="container">
          
          {cartItems.length === 0 ? (
            <div className="empty-cart reveal in">
              <div className="emoji">🛒</div>
              <h3>Your cart is empty</h3>
              <p style={{ color: 'var(--ink-soft)', marginTop: '10px', marginBottom: '30px' }}>Looks like you haven&apos;t added any sets yet.</p>
              <Link href="/products" className="btn btn-fill">Start Shopping</Link>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="reveal in">
                <table className="cart-table">
                  <thead>
                    <tr><th>Item</th><th>Options</th><th>Quantity</th><th>Total</th></tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.product_id}>
                        <td>
                          <div className="cart-item">
                            <div className="cart-thumb">
                              {item.image ? (
                                <Image src={item.image} alt={item.title} width={76} height={76} className="w-full h-full object-cover rounded-[14px]" />
                              ) : (
                                <div className="fan-wrap"><div className="nail nail1"></div><div className="nail nail2"></div><div className="nail nail3"></div><div className="nail nail4"></div><div className="nail nail5"></div></div>
                              )}
                            </div>
                            <div>
                              <h4>{item.title}</h4>
                              <div className="meta">Rs {item.price.toLocaleString()}</div>
                              <span className="cart-remove" onClick={() => removeFromCart(item.product_id)}>Remove</span>
                            </div>
                          </div>
                        </td>
                        <td className="meta" style={{ color: 'var(--ink-soft)', fontSize: '13px' }}>
                          Almond &middot; Medium {/* Mock options for now */}
                        </td>
                        <td>
                          <div className="qty-box">
                            <button onClick={() => updateQuantity(item.product_id, -1)}>&minus;</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product_id, 1)}>+</button>
                          </div>
                        </td>
                        <td style={{ fontWeight: 500 }}>Rs {(item.price * item.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ marginTop: '30px' }}>
                  <Link href="/products" className="btn btn-outline">&larr; Continue Shopping</Link>
                </div>
              </div>

              <div className="summary-card reveal in">
                <h3>Order Summary</h3>
                <div className="summary-row"><span>Subtotal</span><span>Rs {subtotal.toLocaleString()}</span></div>
                <div className="summary-row"><span>Shipping</span><span>Rs 200</span></div>
                <div className="summary-row"><span>Estimated tax</span><span>Rs 0</span></div>
                
                <div className="promo-row">
                  <input type="text" placeholder="Promo code" />
                  <button type="button">Apply</button>
                </div>
                
                <div className="summary-row total">
                  <span>Total</span>
                  <span>Rs {(subtotal + 200).toLocaleString()}</span>
                </div>
                
                <Link href="/checkout" className="btn btn-fill btn-block" style={{ marginTop: '22px' }}>
                  Proceed to Checkout
                </Link>
                
                <div className="pd-feats" style={{ marginTop: '24px' }}>
                  <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7"/></svg> Nationwide cash-on-delivery available</div>
                  <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 12a8 8 0 0 1 14-5M20 12a8 8 0 0 1-14 5M4 7v5h5M20 17v-5h-5"/></svg> Easy 7-day exchanges</div>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>
    </main>
  );
}
