"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { ProductType } from "@/types";
import { useProducts } from "@/hooks/queries";

type ProductDetailsClientProps = {
  product: ProductType;
};

export default function ProductDetailsClient({
  product,
}: ProductDetailsClientProps) {
  const { addToCart } = useCart();
  const { products } = useProducts();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("desc");
  const [isFavorited, setIsFavorited] = useState(false);
  
  // Selection states
  const [shape, setShape] = useState("Almond");
  const [length, setLength] = useState("Medium");
  const [finishIndex, setFinishIndex] = useState(0);

  // Animation for reveal elements
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
  }, [products]);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  const relatedProducts = products?.filter(p => p.product_id !== product.product_id).slice(0, 4) || [];

  return (
    <main className="w-full flex flex-col min-h-screen">
      <section style={{ paddingBottom: '30px', paddingTop: '40px' }}>
        <div className="container">
          <div className="breadcrumb" style={{ marginBottom: '40px' }}>
            <Link href="/">Home</Link> / <Link href="/products">Shop</Link> / {product.title}
          </div>

          <div className="product-layout">
            <div className="reveal in">
              <div className="pd-gallery-main">
                {product.image ? (
                  <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="fan-wrap" id="pdFan">
                    <div className="nail nail1"></div><div className="nail nail2"></div><div className="nail nail3"></div><div className="nail nail4"></div><div className="nail nail5"></div>
                  </div>
                )}
              </div>
              <div className="pd-thumbs">
                <div className="pd-thumb active">
                  {product.image ? (
                    <img src={product.image} className="w-full h-full object-cover rounded-[12px]" />
                  ) : (
                    <div className="fan-wrap"><div className="nail nail1"></div><div className="nail nail2"></div><div className="nail nail3"></div><div className="nail nail4"></div><div className="nail nail5"></div></div>
                  )}
                </div>
                {!product.image && (
                  <>
                    <div className="pd-thumb"><div className="fan-wrap"><div className="nail nail3"></div></div></div>
                    <div className="pd-thumb"><div className="fan-wrap"><div className="nail nail2" style={{ transform: 'translate(-50%,-100%) rotate(0deg)' }}></div></div></div>
                    <div className="pd-thumb"><div className="fan-wrap"><div className="nail nail4" style={{ transform: 'translate(-50%,-100%) rotate(0deg)' }}></div></div></div>
                  </>
                )}
              </div>
            </div>

            <div className="pd-info reveal in">
              <div className="cat">Shape &middot; Length &middot; Collection</div>
              <h1>{product.title}</h1>
              <div className="stars">&#9733;&#9733;&#9733;&#9733;&#9733; <span>128 reviews</span></div>
              <div className="pd-price">
                <span className="was">Rs {(product.price * 1.2).toLocaleString()}</span>
                Rs {product.price.toLocaleString()}
              </div>
              <p className="pd-desc">
                {product.description || "A soft rosy-nude fan finished with a hand-painted pearl edge — our most-loved everyday set. Hypoallergenic adhesive tabs included, no glue required."}
              </p>

              <div className="pd-block">
                <div className="label">Shape</div>
                <div className="opt-row">
                  {["Almond", "Coffin", "Square", "Stiletto"].map(s => (
                    <div key={s} className={`opt-pill ${shape === s ? 'active' : ''}`} onClick={() => setShape(s)}>{s}</div>
                  ))}
                </div>
              </div>

              <div className="pd-block">
                <div className="label">Length</div>
                <div className="opt-row">
                  {["Short", "Medium", "Long"].map(l => (
                    <div key={l} className={`opt-pill ${length === l ? 'active' : ''}`} onClick={() => setLength(l)}>{l}</div>
                  ))}
                </div>
              </div>

              <div className="pd-block">
                <div className="label">Finish</div>
                <div className="opt-row">
                  <div className={`opt-swatch ${finishIndex === 0 ? 'active' : ''}`} style={{ background: 'linear-gradient(160deg,#F3D6CE,#E6AFAA)' }} onClick={() => setFinishIndex(0)}></div>
                  <div className={`opt-swatch ${finishIndex === 1 ? 'active' : ''}`} style={{ background: 'linear-gradient(160deg,#F7ECD9,#C7A25F)' }} onClick={() => setFinishIndex(1)}></div>
                  <div className={`opt-swatch ${finishIndex === 2 ? 'active' : ''}`} style={{ background: 'linear-gradient(160deg,#8C5560,#4B2A31)' }} onClick={() => setFinishIndex(2)}></div>
                  <div className={`opt-swatch ${finishIndex === 3 ? 'active' : ''}`} style={{ background: 'linear-gradient(160deg,#FBF6F2,#EAD9CE)', border: '1px solid #eee' }} onClick={() => setFinishIndex(3)}></div>
                </div>
              </div>

              <div className="qty-row">
                <div className="label" style={{ margin: 0 }}>Quantity</div>
                <div className="qty-box">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>&minus;</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
              </div>

              <div className="pd-ctas">
                <button onClick={handleAddToCart} className="btn btn-fill">Add to Cart — Rs {(product.price * quantity).toLocaleString()}</button>
                <div 
                  className="btn btn-outline" 
                  style={{ cursor: 'pointer', color: isFavorited ? 'var(--rose-deep)' : 'var(--ink)' }}
                  onClick={() => setIsFavorited(!isFavorited)}
                >
                  {isFavorited ? '♥ Saved' : '♡ Save'}
                </div>
              </div>

              <div className="pd-feats">
                <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg> Applies in under 30 seconds, no dry time</div>
                <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 12a8 8 0 0 1 14-5M20 12a8 8 0 0 1-14 5M4 7v5h5M20 17v-5h-5"/></svg> Reusable for up to 10 wears with care</div>
                <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7"/></svg> Ships in 2–4 days across Pakistan</div>
              </div>
            </div>
          </div>

          <div className="pd-tabs">
            <div className={`pd-tab ${activeTab === 'desc' ? 'active' : ''}`} onClick={() => setActiveTab('desc')}>Description</div>
            <div className={`pd-tab ${activeTab === 'apply' ? 'active' : ''}`} onClick={() => setActiveTab('apply')}>How to Apply</div>
            <div className={`pd-tab ${activeTab === 'care' ? 'active' : ''}`} onClick={() => setActiveTab('care')}>Care &amp; Removal</div>
            <div className={`pd-tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Reviews (128)</div>
          </div>

          <div className={`tab-panel ${activeTab === 'desc' ? 'active' : ''}`}>
            <p>Each set includes 24 nails across 12 sizes, a nail file, a wooden cuticle stick, adhesive tabs and a mini prep pad. Hand-painted in small batches in our Rawalpindi studio, so shade and shimmer vary very slightly set to set — that&apos;s the handmade part.</p>
          </div>
          <div className={`tab-panel ${activeTab === 'apply' ? 'active' : ''}`}>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>Push back cuticles and lightly buff the natural nail.</li>
              <li>Wipe with the included prep pad to remove oils.</li>
              <li>Match nail sizes to each finger before applying.</li>
              <li>Peel, press firmly along the adhesive tab for 20–30 seconds, done.</li>
            </ul>
          </div>
          <div className={`tab-panel ${activeTab === 'care' ? 'active' : ''}`}>
            <p>Avoid prolonged water exposure in the first two hours. To remove, soak in warm water for 10 minutes and gently lift from the cuticle edge — never pull. Store the set flat in its box to reuse.</p>
          </div>
          <div className={`tab-panel ${activeTab === 'reviews' ? 'active' : ''}`}>
            <p>&quot;They looked salon-fresh for two full weeks — and I didn&apos;t touch a drop of acrylic.&quot; — Sana K.</p>
            <p style={{ marginTop: '12px' }}>&quot;Fit was perfect straight out of the box, no filing needed.&quot; — Areeba T.</p>
          </div>
        </div>
      </section>

      <section className="collections" style={{ paddingTop: '40px' }}>
        <div className="container">
          <div className="sec-head reveal">
            <span className="eyebrow">You May Also Like</span>
            <h2>Complete the edit</h2>
          </div>
          <div className="prod-grid">
            {relatedProducts.map((p, i) => {
              const palettes = ["palette-gold", "palette-mauve", "palette-milk", ""];
              const palette = palettes[i % palettes.length];
              return (
                <div className="prod-card reveal" key={p.product_id}>
                  <Link href={`/products/${p.product_id}`} className="prod-info-link">
                    <div className="prod-media">
                      {p.image ? (
                        <div className="w-full h-full relative">
                          <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className={`fan-wrap ${palette}`}>
                          <div className="nail nail1"></div>
                          <div className="nail nail2"></div>
                          <div className="nail nail3"></div>
                          <div className="nail nail4"></div>
                          <div className="nail nail5"></div>
                        </div>
                      )}
                    </div>
                    <div className="prod-info">
                      <div className="cat">Shape &middot; Length</div>
                      <h4>{p.title}</h4>
                      <div className="prod-bottom">
                        <div className="price">Rs {p.price.toLocaleString()}</div>
                        <button className="add-btn" onClick={(e) => { e.preventDefault(); addToCart(p); }}>+</button>
                      </div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
