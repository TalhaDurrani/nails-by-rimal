"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useFilteredProducts } from "@/hooks/queries";
import { useCart } from "@/context/CartContext";

export default function ShopPage() {
  const { displayProducts, filters, setFilters, loading } = useFilteredProducts();
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
  }, [displayProducts]);

  return (
    <main className="w-full flex flex-col min-h-screen">
      {/* PAGE HEAD */}
      <div className="page-head">
        <div className="container">
          <div className="breadcrumb"><Link href="/">Home</Link> &nbsp;/&nbsp; Shop</div>
          <h1>All Press-On Sets</h1>
          <div className="divider-heart">
            <span className="line"></span>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7-4.35-9.5-8.5C.7 8.5 2.6 5 6 5c2 0 3.5 1 4 2.5C10.5 6 12 5 14 5c3.4 0 5.3 3.5 3.5 7.5C15 16.65 12 21 12 21z"/></svg>
            <span className="line"></span>
          </div>
        </div>
      </div>

      <section style={{ paddingTop: '20px', paddingBottom: '100px' }}>
        <div className="container">
          <div className="shop-layout">
            
            {/* FILTERS ASIDE */}
            <aside className="filters">
              <h5>Shape</h5>
              <label className="filter-opt"><span>Almond</span><input type="checkbox" /></label>
              <label className="filter-opt"><span>Coffin</span><input type="checkbox" /></label>
              <label className="filter-opt"><span>Square</span><input type="checkbox" /></label>
              <label className="filter-opt"><span>Stiletto</span><input type="checkbox" /></label>

              <h5>Length</h5>
              <label className="filter-opt"><span>Short</span><input type="checkbox" /></label>
              <label className="filter-opt"><span>Medium</span><input type="checkbox" /></label>
              <label className="filter-opt"><span>Long</span><input type="checkbox" /></label>

              <h5>Finish</h5>
              <label className="filter-opt swatch-opt"><span className="swatch" style={{ background: '#E6AFAA' }}></span><span>Blush Almond</span></label>
              <label className="filter-opt swatch-opt"><span className="swatch" style={{ background: '#C7A25F' }}></span><span>Champagne Chrome</span></label>
              <label className="filter-opt swatch-opt"><span className="swatch" style={{ background: '#6B3A42' }}></span><span>Midnight Bloom</span></label>
              <label className="filter-opt swatch-opt"><span className="swatch" style={{ background: '#EAD9CE', border: '1px solid #ddd' }}></span><span>Milk Bloom</span></label>

              <h5>Price</h5>
              <label className="filter-opt"><span>Under Rs 1,500</span><input type="checkbox" /></label>
              <label className="filter-opt"><span>Rs 1,500 – 2,000</span><input type="checkbox" /></label>
              <label className="filter-opt"><span>Above Rs 2,000</span><input type="checkbox" /></label>
            </aside>

            {/* PRODUCT GRID */}
            <div>
              <div className="shop-toolbar">
                <span className="count">Showing {displayProducts.length} sets</span>
                <select 
                  value={filters.sortBy} 
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                >
                  <option value="default">Sort: Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </div>

              {loading ? (
                <div className="py-20 text-center text-sm tracking-widest uppercase text-[var(--ink-soft)]">
                  Loading collection...
                </div>
              ) : displayProducts.length === 0 ? (
                <div className="py-20 text-center text-sm tracking-widest uppercase text-[var(--ink-soft)]">
                  No products found.
                </div>
              ) : (
                <div className="shop-grid">
                  {displayProducts.map((product, index) => {
                    const palettes = ["", "palette-gold", "palette-mauve", "palette-milk"];
                    const palette = palettes[index % palettes.length];

                    return (
                      <div className="prod-card reveal" key={product.product_id}>
                        <Link href={`/products/${product.product_id}`} className="prod-info-link">
                          <div className="prod-media">
                            {index === 0 && <span className="badge">Bestseller</span>}
                            {index === 2 && <span className="badge">New</span>}
                            <button className="wish" aria-label="Save to wishlist" onClick={(e) => { e.preventDefault(); }}>&#9825;</button>
                            
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
              )}

              {/* PAGINATION */}
              {!loading && displayProducts.length > 0 && (
                <div className="pagination">
                  <a href="#" className="active">1</a>
                  <a href="#">2</a>
                  <a href="#">3</a>
                  <a href="#">&rarr;</a>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </section>
    </main>
  );
}
