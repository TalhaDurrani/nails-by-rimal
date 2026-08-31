import { createPublicSupabase } from '@/lib/supabase/public';
import type { StoreBundle, StoreOption } from '@/types';
import { getProductsServer } from '@/services/product/getProductsServer';

type BundleRow = {
  id: string;
  name: string;
  description: string;
  discount_percentage: number;
  expires_at: string | null;
};

type BundleProductRow = { bundle_id: string; product_id: string };

export async function getCheckoutOptions(): Promise<{
  boxOptions: StoreOption[];
  giftPacking: StoreOption[];
}> {
  const supabase = createPublicSupabase();
  const [boxResult, giftResult] = await Promise.all([
    supabase
      .from('box_options')
      .select('id, name, description, price, image_url')
      .eq('is_active', true)
      .order('price'),
    supabase
      .from('gift_packing')
      .select('id, name, description, price, image_url')
      .eq('is_active', true)
      .order('price'),
  ]);

  if (boxResult.error) console.error('Unable to load box options:', boxResult.error);
  if (giftResult.error) console.error('Unable to load gift packing:', giftResult.error);

  const normalize = (rows: unknown[] | null): StoreOption[] =>
    (rows || []).map((row) => {
      const value = row as Record<string, unknown>;
      return {
        id: String(value.id),
        name: String(value.name),
        description: value.description ? String(value.description) : null,
        price: Number(value.price || 0),
        image_url: value.image_url ? String(value.image_url) : null,
      };
    });

  return {
    boxOptions: normalize(boxResult.data),
    giftPacking: normalize(giftResult.data),
  };
}

export async function getStoreBundles(): Promise<StoreBundle[]> {
  const supabase = createPublicSupabase();
  const [{ data: bundles, error: bundleError }, { data: relations, error: relationError }, products] =
    await Promise.all([
      supabase
        .from('bundles')
        .select('id, name, description, discount_percentage, expires_at')
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order('created_at', { ascending: false }),
      supabase.from('bundle_products').select('bundle_id, product_id'),
      getProductsServer(),
    ]);

  if (bundleError || relationError) {
    console.error('Unable to load storefront bundles:', bundleError || relationError);
    return [];
  }

  const productById = new Map(
    products
      .filter((product) => product.is_published !== false)
      .map((product) => [product.product_id, product]),
  );
  const relationRows = (relations || []) as BundleProductRow[];

  return ((bundles || []) as BundleRow[])
    .map((bundle) => ({
      ...bundle,
      discount_percentage: Number(bundle.discount_percentage),
      products: relationRows
        .filter((relation) => relation.bundle_id === bundle.id)
        .map((relation) => productById.get(relation.product_id))
        .filter((product): product is NonNullable<typeof product> => Boolean(product)),
    }))
    .filter(
      (bundle) =>
        bundle.products.length > 0 &&
        bundle.products.every((product) =>
          product.variants?.some((variant) => variant.stock_quantity > 0),
        ),
    );
}
