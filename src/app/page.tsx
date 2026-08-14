"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useProducts } from "@/hooks/queries";
import { useCart } from "@/context/CartContext";

export default function Home() {
  const { products } = useProducts();
  const { addToCart } = useCart();
  
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
  }, [products]); // Re-run if products load

  // Pick top 4 products as bestsellers (mocking)
  const bestsellers = products?.slice(0, 4) || [];

  return (
    <main className="w-full flex flex-col">
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-blob"></div>
        <div className="container hero-grid">
          <div className="hero-copy reveal in">
            <span className="eyebrow">Handmade Press-On Atelier</span>
            <h1>Salon nails,<br />without the <em>salon</em>.</h1>
            <p>Hand-painted, reusable press-ons designed in small batches and shipped straight to your door — every set finished to last, applied in under thirty seconds.</p>
            <div className="hero-ctas">
              <Link href="/products" className="btn btn-fill">Shop the Collection</Link>
              <Link href="/#why" className="btn btn-outline">Find Your Shape</Link>
            </div>
            <div className="hero-feats">
              <div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 12a8 8 0 0 1 14-5M20 12a8 8 0 0 1-14 5M4 7v5h5M20 17v-5h-5"/></svg> 
                Reusable 10+ wears
              </div>
              <div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg> 
                30-second apply
              </div>
              <div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M12 21s-7-4.35-9.5-8.5C.7 8.5 2.6 5 6 5c2 0 3.5 1 4 2.5C10.5 6 12 5 14 5c3.4 0 5.3 3.5 3.5 7.5C15 16.65 12 21 12 21z"/></svg> 
                Cruelty-free
              </div>
            </div>
          </div>

          <div className="hero-visual reveal in">
            <div className="hex-frame h2"></div>
            <div className="hex-frame"></div>
            <div className="fan-wrap">
              <div className="nail nail1"></div>
              <div className="nail nail2"></div>
              <div className="nail nail3"></div>
              <div className="nail nail4"></div>
              <div className="nail nail5"></div>
            </div>
            <svg className="flutter" style={{ top: '6%', right: '10%', width: '78px', height: '78px' }} viewBox="0 0 100 100" fill="none">
              <path d="M50 50C50 50 30 10 12 18C-2 24 6 46 50 50Z" fill="#D89AA0" opacity="0.9"/>
              <path d="M50 50C50 50 70 10 88 18C102 24 94 46 50 50Z" fill="#EFC9C6" opacity="0.9"/>
              <path d="M50 50C50 50 32 88 16 84C4 81 10 58 50 50Z" fill="#C7A25F" opacity="0.85"/>
              <path d="M50 50C50 50 68 88 84 84C96 81 90 58 50 50Z" fill="#E8CE9C" opacity="0.85"/>
              <line x1="50" y1="46" x2="50" y2="72" stroke="#2E2624" strokeWidth="1.6"/>
            </svg>
            <svg className="heart-dot" style={{ bottom: '12%', left: '6%', width: '20px' }} viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7-4.35-9.5-8.5C.7 8.5 2.6 5 6 5c2 0 3.5 1 4 2.5C10.5 6 12 5 14 5c3.4 0 5.3 3.5 3.5 7.5C15 16.65 12 21 12 21z"/></svg>
            <svg className="heart-dot" style={{ top: '4%', left: '2%', width: '13px', opacity: 0.5 }} viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7-4.35-9.5-8.5C.7 8.5 2.6 5 6 5c2 0 3.5 1 4 2.5C10.5 6 12 5 14 5c3.4 0 5.3 3.5 3.5 7.5C15 16.65 12 21 12 21z"/></svg>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee">
        <div className="marquee-track">
          <span>GLUE-ON & NO DAMAGE</span>&#10022;<span>SALON FINISH</span>&#10022;<span>HANDPAINTED IN SMALL BATCHES</span>&#10022;<span>REUSABLE 10+ WEARS</span>&#10022;<span>SHIPPING ACROSS PAKISTAN</span>&#10022;
          <span>GLUE-ON & NO DAMAGE</span>&#10022;<span>SALON FINISH</span>&#10022;<span>HANDPAINTED IN SMALL BATCHES</span>&#10022;<span>REUSABLE 10+ WEARS</span>&#10022;<span>SHIPPING ACROSS PAKISTAN</span>&#10022;
        </div>
      </div>

      {/* COLLECTIONS */}
      <section className="collections" id="collections">
        <div className="container">
          <div className="sec-head reveal">
            <span className="eyebrow">Shop by Mood</span>
            <h2>Find your finish</h2>
            <div className="divider-heart"><span className="line"></span><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7-4.35-9.5-8.5C.7 8.5 2.6 5 6 5c2 0 3.5 1 4 2.5C10.5 6 12 5 14 5c3.4 0 5.3 3.5 3.5 7.5C15 16.65 12 21 12 21z"/></svg><span className="line"></span></div>
            <p>Three signature edits, each hand-mixed to a mood — pick the one that matches your week.</p>
          </div>
          <div className="col-grid">
            <Link href="/products?collection=blush" className="col-card reveal">
              <div className="mini-hex">
                <div className="mini-hex-frame"></div>
                <div className="mini-fan fan-wrap">
                  <div className="nail nail1"></div><div className="nail nail2"></div><div className="nail nail3"></div><div className="nail nail4"></div><div className="nail nail5"></div>
                </div>
              </div>
              <h3>Blush Almond</h3>
              <div className="price-range">Rs 1,200 – Rs 1,800</div>
              <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '20px' }}>Soft nudes and rosy pinks for everyday wear.</p>
              <span className="col-link">Shop Blush &rarr;</span>
            </Link>
            <Link href="/products?collection=chrome" className="col-card reveal">
              <div className="mini-hex">
                <div className="mini-hex-frame"></div>
                <div className="mini-fan fan-wrap palette-gold">
                  <div className="nail nail1"></div><div className="nail nail2"></div><div className="nail nail3"></div><div className="nail nail4"></div><div className="nail nail5"></div>
                </div>
              </div>
              <h3>Champagne Chrome</h3>
              <div className="price-range">Rs 1,500 – Rs 2,200</div>
              <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '20px' }}>Glass-chrome gold finishes for occasions.</p>
              <span className="col-link">Shop Chrome &rarr;</span>
            </Link>
            <Link href="/products?collection=bloom" className="col-card reveal">
              <div className="mini-hex">
                <div className="mini-hex-frame"></div>
                <div className="mini-fan fan-wrap palette-mauve">
                  <div className="nail nail1"></div><div className="nail nail2"></div><div className="nail nail3"></div><div className="nail nail4"></div><div className="nail nail5"></div>
                </div>
              </div>
              <h3>Midnight Bloom</h3>
              <div className="price-range">Rs 1,400 – Rs 2,000</div>
              <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '20px' }}>Deep berries and espresso tones for evening.</p>
              <span className="col-link">Shop Bloom &rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* BESTSELLERS */}
      <section id="bestsellers">
        <div className="container">
          <div className="sec-head reveal">
            <span className="eyebrow">Fan Favourites</span>
            <h2>Bestselling sets</h2>
            <div className="divider-heart"><span className="line"></span><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7-4.35-9.5-8.5C.7 8.5 2.6 5 6 5c2 0 3.5 1 4 2.5C10.5 6 12 5 14 5c3.4 0 5.3 3.5 3.5 7.5C15 16.65 12 21 12 21z"/></svg><span className="line"></span></div>
          </div>
          
          <div className="prod-grid">
            {bestsellers.map((product, index) => {
              // Cycle through palettes for variety
              const palettes = ["", "palette-gold", "palette-mauve", "palette-milk"];
              const palette = palettes[index % palettes.length];
              
              return (
                <div className="prod-card reveal" key={product.product_id}>
                  <Link href={`/products/${product.product_id}`} className="prod-info-link">
                    <div className="prod-media">
                      {index === 0 && <span className="badge">Bestseller</span>}
                      {index === 2 && <span className="badge">New</span>}
                      <button className="wish" aria-label="Save to wishlist" onClick={(e) => { e.preventDefault(); /* handle wishlist */ }}>&#9825;</button>
                      
                      {product.image ? (
                        <div className="w-full h-full relative">
                          <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
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
                      <h4>{product.title}</h4>
                      <div className="stars">&#9733;&#9733;&#9733;&#9733;&#9733; <span style={{ color: 'var(--ink-soft)' }}>(128)</span></div>
                      <div className="prod-bottom">
                        <div className="price">Rs {product.price.toLocaleString()}</div>
                        <button 
                          className="add-btn" 
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart(product);
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <Link href="/products" className="btn btn-outline">View All Sets</Link>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="why" id="why">
        <div className="container">
          <div className="sec-head reveal">
            <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>The Rimal Difference</span>
            <h2>Made to be worn, reworn</h2>
          </div>
          <div className="why-grid">
            <div className="why-item reveal">
              <div className="why-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/><circle cx="12" cy="12" r="3"/></svg></div>
              <h4>Hand-painted</h4>
              <p>Every set is finished by hand in small batches — no two fans are quite alike.</p>
            </div>
            <div className="why-item reveal">
              <div className="why-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></div>
              <h4>30-second apply</h4>
              <p>Press, apply, done — no dry time, no salon chair required.</p>
            </div>
            <div className="why-item reveal">
              <div className="why-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 12a8 8 0 0 1 14-5M20 12a8 8 0 0 1-14 5M4 7v5h5M20 17v-5h-5"/></svg></div>
              <h4>Reusable</h4>
              <p>Gentle removal keeps each set wearable for up to ten more occasions.</p>
            </div>
            <div className="why-item reveal">
              <div className="why-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7"/></svg></div>
              <h4>Nationwide delivery</h4>
              <p>Carefully boxed and shipped across Pakistan in protective sets.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonial" id="reviews">
        <div className="container">
          <div className="reveal" style={{ textAlign: 'center' }}>
            <div className="quote-mark">&#8220;</div>
            <blockquote>They looked salon-fresh for two full weeks — and I didn&apos;t touch a drop of acrylic. This is how press-ons should feel.</blockquote>
            <div className="who">Sana K. &middot; Lahore</div>
            <div className="dots"><span className="active"></span><span></span><span></span></div>
          </div>
        </div>
      </section>

      {/* INSTAGRAM GALLERY */}
      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="sec-head reveal">
            <span className="eyebrow">@nailsbyrimal</span>
            <h2>Worn by you</h2>
          </div>
          <div className="gallery-strip">
            <div className="gal-item reveal"><div className="fan-wrap"><div className="nail nail1"></div><div className="nail nail2"></div><div className="nail nail3"></div><div className="nail nail4"></div><div className="nail nail5"></div></div></div>
            <div className="gal-item reveal"><div className="fan-wrap palette-gold"><div className="nail nail1"></div><div className="nail nail2"></div><div className="nail nail3"></div><div className="nail nail4"></div><div className="nail nail5"></div></div></div>
            <div className="gal-item reveal"><div className="fan-wrap palette-mauve"><div className="nail nail1"></div><div className="nail nail2"></div><div className="nail nail3"></div><div className="nail nail4"></div><div className="nail nail5"></div></div></div>
            <div className="gal-item reveal"><div className="fan-wrap palette-milk"><div className="nail nail1"></div><div className="nail nail2"></div><div className="nail nail3"></div><div className="nail nail4"></div><div className="nail nail5"></div></div></div>
            <div className="gal-item reveal"><div className="fan-wrap"><div className="nail nail1"></div><div className="nail nail2"></div><div className="nail nail3"></div><div className="nail nail4"></div><div className="nail nail5"></div></div></div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="newsletter">
        <div className="container reveal">
          <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>Join the Atelier</span>
          <h2>Get first look at new drops</h2>
          <p>Restocks, seasonal edits and 10% off your first set — straight to your inbox.</p>
          <form className="nl-form" onSubmit={(e) => { e.preventDefault(); const btn = e.currentTarget.querySelector('button'); if(btn) btn.textContent = 'Subscribed ✓'; }}>
            <input type="email" placeholder="Your email address" required />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </section>
    </main>
  );
}