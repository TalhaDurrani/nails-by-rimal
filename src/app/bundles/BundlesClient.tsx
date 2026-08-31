'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useCart } from '@/context/CartContext';
import type { ProductVariantType, StoreBundle } from '@/types';

function variantLabel(variant: ProductVariantType) {
  return [variant.shape?.name, variant.length?.name, variant.finish?.name]
    .filter(Boolean)
    .join(' · ');
}

function BundleCard({ bundle }: { bundle: StoreBundle }) {
  const { addBundleToCart } = useCart();
  const [selectedIds, setSelectedIds] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      bundle.products.map((product) => [
        product.product_id,
        product.variants?.find((variant) => variant.stock_quantity > 0)?.id ?? 0,
      ]),
    ),
  );

  const selections = useMemo(
    () =>
      bundle.products
        .map((product) =>
          product.variants?.find(
            (variant) => variant.id === selectedIds[product.product_id],
          ),
        )
        .filter((variant): variant is ProductVariantType => Boolean(variant)),
    [bundle.products, selectedIds],
  );
  const originalTotal = selections.reduce((sum, variant, index) => {
    const product = bundle.products[index];
    return sum + Number(variant.price_override ?? product.price);
  }, 0);
  const bundleTotal = originalTotal * (1 - bundle.discount_percentage / 100);

  return (
    <article className="overflow-hidden rounded-3xl border border-[#ead7d1] bg-white shadow-sm">
      <div className="bg-gradient-to-r from-[#F8E3DE] to-[#F6EBD8] p-6">
        <div className="mb-2 flex items-start justify-between gap-4">
          <h2 className="font-serif text-2xl text-[#2E2624]">{bundle.name}</h2>
          <span className="rounded-full bg-[#BE7681] px-3 py-1 text-xs font-semibold text-white">
            {bundle.discount_percentage}% OFF
          </span>
        </div>
        <p className="text-sm text-[#7A6C68]">{bundle.description}</p>
      </div>

      <div className="space-y-5 p-6">
        {bundle.products.map((product) => {
          const variants = (product.variants || []).filter(
            (variant) => variant.stock_quantity > 0,
          );
          return (
            <div key={product.product_id} className="flex gap-4 border-b border-[#f0e5e1] pb-5 last:border-0">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#FCF1ED]">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.title}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/products/${product.product_id}`} className="font-medium text-[#2E2624] hover:text-[#BE7681]">
                  {product.title}
                </Link>
                <select
                  className="mt-2 w-full rounded-lg border border-[#ddcbc5] bg-white px-3 py-2 text-sm"
                  value={selectedIds[product.product_id] || ''}
                  onChange={(event) =>
                    setSelectedIds((current) => ({
                      ...current,
                      [product.product_id]: Number(event.target.value),
                    }))
                  }
                  aria-label={`Options for ${product.title}`}
                >
                  {variants.map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {variantLabel(variant)} — Rs {Number(variant.price_override ?? product.price).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}

        <div className="flex items-end justify-between gap-4 pt-2">
          <div>
            <div className="text-sm text-[#7A6C68] line-through">Rs {originalTotal.toLocaleString()}</div>
            <div className="text-xl font-semibold text-[#2E2624]">Rs {bundleTotal.toLocaleString()}</div>
          </div>
          <button
            type="button"
            className="btn btn-fill"
            disabled={selections.length !== bundle.products.length}
            onClick={() => void addBundleToCart(bundle, selections)}
          >
            Add Bundle
          </button>
        </div>
      </div>
    </article>
  );
}

export default function BundlesClient({ bundles }: { bundles: StoreBundle[] }) {
  return (
    <main className="min-h-screen pb-24">
      <div className="page-head">
        <div className="container">
          <div className="breadcrumb"><Link href="/">Home</Link> &nbsp;/&nbsp; Bundles</div>
          <h1>Bundle &amp; Save</h1>
          <p className="mx-auto mt-3 max-w-2xl text-[#7A6C68]">
            Choose the exact shape, length, and finish for every set. Bundle pricing is verified again at checkout.
          </p>
        </div>
      </div>
      <section className="container pt-10">
        {bundles.length ? (
          <div className="grid gap-8 lg:grid-cols-2">
            {bundles.map((bundle) => <BundleCard bundle={bundle} key={bundle.id} />)}
          </div>
        ) : (
          <div className="rounded-3xl border border-[#ead7d1] bg-white p-12 text-center">
            <h2 className="font-serif text-2xl">No bundles are available right now.</h2>
            <p className="mt-2 text-[#7A6C68]">Check back soon or browse individual sets.</p>
            <Link className="btn btn-fill mt-6" href="/products">Shop Sets</Link>
          </div>
        )}
      </section>
    </main>
  );
}
