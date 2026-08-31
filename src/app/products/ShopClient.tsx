"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useFilteredProducts } from "@/hooks/queries";
import { useCart } from "@/context/CartContext";
import type { FilterOptions } from "@/hooks/queries/use-products";
import type { ProductType } from "@/types";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

export default function ShopClient({ initialProducts }: { initialProducts: ProductType[] }) {
  const { displayProducts, filters, setFilters, loading, error, retry } = useFilteredProducts(undefined, initialProducts);
  const { addToCart } = useCart();
  const [selectedShapes, setSelectedShapes] = useState<string[]>([]);
  const [selectedLengths, setSelectedLengths] = useState<string[]>([]);
  const [selectedFinishes, setSelectedFinishes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const variantOptions = useMemo(() => {
    const variants = displayProducts.flatMap((product) => product.variants || []);
    return {
      shapes: [...new Set(variants.flatMap((variant) => variant.shape?.name || []))],
      lengths: [...new Set(variants.flatMap((variant) => variant.length?.name || []))],
      finishes: [...new Set(variants.flatMap((variant) => variant.finish?.name || []))],
    };
  }, [displayProducts]);

  const filteredProducts = useMemo(
    () =>
      displayProducts.filter((product) => {
        const matchingVariant = (product.variants || []).some(
          (variant) =>
            (!selectedShapes.length ||
              (variant.shape?.name && selectedShapes.includes(variant.shape.name))) &&
            (!selectedLengths.length ||
              (variant.length?.name && selectedLengths.includes(variant.length.name))) &&
            (!selectedFinishes.length ||
              (variant.finish?.name && selectedFinishes.includes(variant.finish.name))),
        );
        const matchesPrice =
          priceRange === "all" ||
          (priceRange === "under-1500" && product.price < 1500) ||
          (priceRange === "1500-2000" && product.price >= 1500 && product.price <= 2000) ||
          (priceRange === "over-2000" && product.price > 2000);
        return matchingVariant && matchesPrice;
      }),
    [
      displayProducts,
      priceRange,
      selectedFinishes,
      selectedLengths,
      selectedShapes,
    ],
  );

  const toggleOption = (
    value: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setSelected(
      selected.includes(value)
        ? selected.filter((option) => option !== value)
        : [...selected, value],
    );
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
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 lg:gap-12 items-start">
            
            {/* FILTERS ASIDE */}
            <div className="relative z-30 lg:sticky lg:top-[110px]">
              <button
                type="button"
                className="mb-4 flex w-full items-center justify-between rounded-2xl border border-[#EFCFC9] bg-white px-5 py-4 text-sm font-medium text-[#2E2624] shadow-sm lg:hidden"
                aria-expanded={filtersOpen}
                aria-controls="shop-filters"
                onClick={() => setFiltersOpen((open) => !open)}
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-[#BE7681]" />
                  Filters
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
              </button>
              <aside id="shop-filters" className={`filters absolute left-0 right-0 top-full z-50 mt-1 shadow-xl ${filtersOpen ? "block" : "hidden"} lg:static lg:mt-0 lg:block lg:shadow-none`}>
              <h5>Shape</h5>
              {variantOptions.shapes.map((shape) => (
                <label className="filter-opt" key={shape}>
                  <span>{shape}</span>
                  <input
                    type="checkbox"
                    checked={selectedShapes.includes(shape)}
                    onChange={() => toggleOption(shape, selectedShapes, setSelectedShapes)}
                  />
                </label>
              ))}

              <h5>Length</h5>
              {variantOptions.lengths.map((length) => (
                <label className="filter-opt" key={length}>
                  <span>{length}</span>
                  <input
                    type="checkbox"
                    checked={selectedLengths.includes(length)}
                    onChange={() => toggleOption(length, selectedLengths, setSelectedLengths)}
                  />
                </label>
              ))}

              <h5>Finish</h5>
              {variantOptions.finishes.map((finish) => (
                <label className="filter-opt" key={finish}>
                  <span>{finish}</span>
                  <input
                    type="checkbox"
                    checked={selectedFinishes.includes(finish)}
                    onChange={() => toggleOption(finish, selectedFinishes, setSelectedFinishes)}
                  />
                </label>
              ))}

              <h5>Price</h5>
              {[
                ["all", "All prices"],
                ["under-1500", "Under Rs 1,500"],
                ["1500-2000", "Rs 1,500 – 2,000"],
                ["over-2000", "Above Rs 2,000"],
              ].map(([value, label]) => (
                <label className="filter-opt" key={value}>
                  <span>{label}</span>
                  <input
                    type="radio"
                    name="price-range"
                    checked={priceRange === value}
                    onChange={() => setPriceRange(value)}
                  />
                </label>
              ))}

              <h5>Availability</h5>
              {[
                ["all", "All products"],
                ["in-stock", "In stock"],
                ["out-of-stock", "Out of stock"],
              ].map(([value, label]) => (
                <label className="filter-opt" key={value}>
                  <span>{label}</span>
                  <input
                    type="radio"
                    name="stock-filter"
                    checked={filters.stockFilter === value}
                    onChange={() =>
                      setFilters({
                        ...filters,
                        stockFilter: value as FilterOptions["stockFilter"],
                      })
                    }
                  />
                </label>
              ))}
              </aside>
            </div>

            {/* PRODUCT GRID */}
            <div>
              <div className="shop-toolbar">
                <span className="count">Showing {filteredProducts.length} sets</span>
                <select 
                  value={filters.sortBy} 
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      sortBy: e.target.value as FilterOptions["sortBy"],
                    })
                  }
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
              ) : error ? (
                <div className="py-20 text-center text-[var(--ink-soft)]">
                  <p className="mb-4 text-sm tracking-widest uppercase">
                    The collection could not be loaded.
                  </p>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => void retry()}
                  >
                    Try Again
                  </button>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-20 text-center text-sm tracking-widest uppercase text-[var(--ink-soft)]">
                  No products found.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredProducts.map((product, index) => {
                    const palettes = ["", "palette-gold", "palette-mauve", "palette-milk"];
                    const palette = palettes[index % palettes.length];

                    return (
                      <div className="prod-card reveal" key={product.product_id}>
                        <Link href={`/products/${product.product_id}`} className="prod-info-link">
                          <div className="prod-media">
                            {product.is_featured && <span className="badge">Featured</span>}
                            {product.is_new && <span className="badge">New</span>}
                            
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
                            <div className="cat">
                              {product.variants?.[0]?.shape?.name || "Press-on nails"}
                              {product.variants?.[0]?.length?.name
                                ? ` · ${product.variants[0].length?.name}`
                                : ""}
                            </div>
                            <h4>{product.title}</h4>
                            <div className="prod-bottom">
                              <div className="price">Rs {product.price.toLocaleString()}</div>
                              <button 
                                className="add-btn" 
                                disabled={product.stock === 0}
                                aria-label={`Add ${product.title} to cart`}
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

            </div>
            
          </div>
        </div>
      </section>
    </main>
  );
}
