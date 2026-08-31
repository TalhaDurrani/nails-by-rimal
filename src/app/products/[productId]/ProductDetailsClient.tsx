"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { ProductType } from "@/types";

type ProductDetailsClientProps = {
  product: ProductType;
  relatedProducts: ProductType[];
};

export default function ProductDetailsClient({
  product,
  relatedProducts,
}: ProductDetailsClientProps) {
  const { addToCart } = useCart();
  const variants = product.variants ?? [];
  const initialVariant = variants.find((variant) => variant.stock_quantity > 0) ?? variants[0];
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("desc");
  
  const [shapeId, setShapeId] = useState(initialVariant?.shape_id);
  const [lengthId, setLengthId] = useState(initialVariant?.length_id);
  const [finishId, setFinishId] = useState(initialVariant?.finish_id);

  const selectedVariant = variants.find(
    (variant) =>
      variant.shape_id === shapeId &&
      variant.length_id === lengthId &&
      variant.finish_id === finishId,
  );
  const selectedPrice = Number(selectedVariant?.price_override ?? product.price);

  const uniqueOptions = <T extends { id: number }>(options: Array<T | undefined>) =>
    Array.from(
      new Map(options.filter((option): option is T => Boolean(option)).map((option) => [option.id, option])).values(),
    );

  const shapes = uniqueOptions(variants.map((variant) => variant.shape));
  const lengths = uniqueOptions(variants.map((variant) => variant.length));
  const finishes = uniqueOptions(variants.map((variant) => variant.finish));

  const selectVariantOption = (
    field: "shape_id" | "length_id" | "finish_id",
    value: number,
  ) => {
    const exact = variants.find(
      (variant) =>
        variant[field] === value &&
        (field === "shape_id" || variant.shape_id === shapeId) &&
        (field === "length_id" || variant.length_id === lengthId) &&
        (field === "finish_id" || variant.finish_id === finishId) &&
        variant.stock_quantity > 0,
    );
    const fallback =
      exact ??
      variants.find(
        (variant) => variant[field] === value && variant.stock_quantity > 0,
      ) ??
      variants.find((variant) => variant[field] === value);

    if (!fallback) return;
    setShapeId(fallback.shape_id);
    setLengthId(fallback.length_id);
    setFinishId(fallback.finish_id);
    setQuantity(1);
  };

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
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealEls.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const handleAddToCart = async () => {
    if (!selectedVariant || selectedVariant.stock_quantity < 1) return;
    await addToCart(product, selectedVariant, quantity);
  };

  return (
    <main className="w-full flex flex-col min-h-screen">
      <section style={{ paddingBottom: '30px', paddingTop: '40px' }}>
        <div className="container">
          <div className="breadcrumb" style={{ marginBottom: '40px' }}>
            <Link href="/">Home</Link> / <Link href="/products">Shop</Link> / {product.title}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
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
                    <img
                      src={product.image}
                      alt={`${product.title} thumbnail`}
                      className="w-full h-full object-cover rounded-[12px]"
                    />
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
              <div className="pd-price">
                Rs {selectedPrice.toLocaleString()}
              </div>
              <p className="pd-desc">
                {product.description || "A soft rosy-nude fan finished with a hand-painted pearl edge — our most-loved everyday set. Hypoallergenic adhesive tabs included, no glue required."}
              </p>

              <div className="pd-block">
                <div className="label">Shape</div>
                <div className="opt-row">
                  {shapes.map((shape) => (
                    <button
                      type="button"
                      key={shape.id}
                      className={`opt-pill ${shapeId === shape.id ? 'active' : ''}`}
                      onClick={() => selectVariantOption("shape_id", shape.id)}
                    >
                      {shape.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pd-block">
                <div className="label">Length</div>
                <div className="opt-row">
                  {lengths.map((length) => (
                    <button
                      type="button"
                      key={length.id}
                      className={`opt-pill ${lengthId === length.id ? 'active' : ''}`}
                      onClick={() => selectVariantOption("length_id", length.id)}
                    >
                      {length.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pd-block">
                <div className="label">Finish</div>
                <div className="opt-row">
                  {finishes.map((finish) => (
                    <button
                      type="button"
                      key={finish.id}
                      className={`opt-swatch ${finishId === finish.id ? 'active' : ''}`}
                      style={{ background: finish.swatch_hex ?? '#ead9ce' }}
                      onClick={() => selectVariantOption("finish_id", finish.id)}
                      aria-label={finish.name}
                      title={finish.name}
                    />
                  ))}
                </div>
              </div>

              <div className="qty-row">
                <div className="label" style={{ margin: 0 }}>Quantity</div>
                <div className="qty-box">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>&minus;</button>
                  <span>{quantity}</span>
                  <button
                    onClick={() =>
                      setQuantity(
                        Math.min(selectedVariant?.stock_quantity ?? 1, quantity + 1),
                      )
                    }
                  >+</button>
                </div>
              </div>

              <div className="pd-ctas">
                <button
                  onClick={() => void handleAddToCart()}
                  className="btn btn-fill"
                  disabled={!selectedVariant || selectedVariant.stock_quantity < 1}
                >
                  {selectedVariant?.stock_quantity
                    ? `Add to Cart — Rs ${(selectedPrice * quantity).toLocaleString()}`
                    : "Out of Stock"}
                </button>
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
        </div>
      </section>

      <section className="collections" style={{ paddingTop: '40px' }}>
        <div className="container">
          <div className="sec-head reveal">
            <span className="eyebrow">You May Also Like</span>
            <h2>Complete the edit</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
