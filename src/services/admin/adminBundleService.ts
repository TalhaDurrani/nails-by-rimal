import { supabase } from "@/lib/supabase/client";

export interface Bundle {
  id: string;
  name: string;
  description: string;
  discount_percentage: number;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BundleProduct {
  id: string;
  bundle_id: string;
  product_id: string;
  created_at: string;
}

export interface BundleWithProducts extends Bundle {
  products: Array<{
    id: string;
    title: string;
    image?: string;
  }>;
}

export interface CreateBundleData {
  name: string;
  description: string;
  discount_percentage: number;
  is_active: boolean;
  expires_at?: string;
  product_ids: string[];
}

export interface UpdateBundleData extends Partial<CreateBundleData> {
  updated_at?: string;
}

interface BundleProductRelation {
  products:
    | { product_id: string; title: string; image?: string }
    | Array<{ product_id: string; title: string; image?: string }>
    | null;
}

function mapBundleProducts(relations: BundleProductRelation[] = []) {
  return relations.flatMap((relation) => {
    const product = Array.isArray(relation.products)
      ? relation.products[0]
      : relation.products;
    return product
      ? [{ id: product.product_id, title: product.title, image: product.image }]
      : [];
  });
}

export const adminBundleService = {
  /**
   * Get all bundles with their products
   */
  async getAllBundles(): Promise<BundleWithProducts[]> {
    try {
      const { data, error } = await supabase
        .from("bundles")
        .select(`
          *,
          bundle_products (
            product_id,
            products (
              product_id,
              title,
              image
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching bundles:", error);
        return [];
      }

      return data.map((bundle) => ({
        id: bundle.id,
        name: bundle.name,
        description: bundle.description,
        discount_percentage: bundle.discount_percentage,
        is_active: bundle.is_active,
        expires_at: bundle.expires_at,
        created_at: bundle.created_at,
        updated_at: bundle.updated_at,
        products: mapBundleProducts(bundle.bundle_products as BundleProductRelation[]),
      }));
    } catch (err) {
      console.error("Failed to get bundles:", err);
      return [];
    }
  },

  /**
   * Get bundle by ID
   */
  async getBundleById(id: string): Promise<BundleWithProducts | null> {
    try {
      const { data, error } = await supabase
        .from("bundles")
        .select(`
          *,
          bundle_products (
            product_id,
            products (
              product_id,
              title,
              image
            )
          )
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching bundle:", error);
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        discount_percentage: data.discount_percentage,
        is_active: data.is_active,
        expires_at: data.expires_at,
        created_at: data.created_at,
        updated_at: data.updated_at,
        products: mapBundleProducts(data.bundle_products as BundleProductRelation[]),
      };
    } catch (err) {
      console.error("Failed to get bundle:", err);
      return null;
    }
  },

  /**
   * Create a new bundle
   */
  async createBundle(bundleData: CreateBundleData): Promise<Bundle> {
    try {
      // Create the bundle
      const { data: bundle, error: bundleError } = await supabase
        .from("bundles")
        .insert({
          name: bundleData.name,
          description: bundleData.description,
          discount_percentage: bundleData.discount_percentage,
          is_active: bundleData.is_active,
          expires_at: bundleData.expires_at || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (bundleError) {
        console.error("Error creating bundle:", bundleError);
        throw bundleError;
      }

      // Add products to bundle
      if (bundleData.product_ids.length > 0) {
        const bundleProducts = bundleData.product_ids.map((product_id) => ({
          bundle_id: bundle.id,
          product_id,
        }));

        const { error: productsError } = await supabase
          .from("bundle_products")
          .insert(bundleProducts);

        if (productsError) {
          console.error("Error adding products to bundle:", productsError);
          await supabase.from("bundles").delete().eq("id", bundle.id);
          throw productsError;
        }
      }

      return bundle;
    } catch (err) {
      console.error("Failed to create bundle:", err);
      throw err;
    }
  },

  /**
   * Update a bundle
   */
  async updateBundle(id: string, bundleData: UpdateBundleData): Promise<Bundle> {
    try {
      const { product_ids, ...bundleFields } = bundleData;
      const { data: bundle, error } = await supabase
        .from("bundles")
        .update({
          ...bundleFields,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating bundle:", error);
        throw error;
      }

      // Update products if provided
      if (product_ids) {
        // Remove existing products
        const { error: deleteError } = await supabase
          .from("bundle_products")
          .delete()
          .eq("bundle_id", id);
        if (deleteError) throw deleteError;

        // Add new products
        if (product_ids.length > 0) {
          const bundleProducts = product_ids.map((product_id) => ({
            bundle_id: id,
            product_id,
          }));

          const { error: insertError } = await supabase
            .from("bundle_products")
            .insert(bundleProducts);
          if (insertError) throw insertError;
        }
      }

      return bundle;
    } catch (err) {
      console.error("Failed to update bundle:", err);
      throw err;
    }
  },

  /**
   * Delete a bundle
   */
  async deleteBundle(id: string): Promise<boolean> {
    try {
      // Delete bundle products first
      await supabase
        .from("bundle_products")
        .delete()
        .eq("bundle_id", id);

      // Delete bundle
      const { error } = await supabase
        .from("bundles")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting bundle:", error);
        throw error;
      }

      return true;
    } catch (err) {
      console.error("Failed to delete bundle:", err);
      throw err;
    }
  },

  /**
   * Toggle bundle active status
   */
  async toggleBundleActive(id: string, isActive: boolean): Promise<Bundle> {
    try {
      const { data, error } = await supabase
        .from("bundles")
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error toggling bundle active status:", error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error("Failed to toggle bundle active status:", err);
      throw err;
    }
  },

  /**
   * Get all products (for bundle creation)
   */
  async getAllProducts(): Promise<Array<{ id: string; title: string; image?: string }>> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("product_id, title, image, product_variants(stock_quantity)")
        .eq("is_published", true)
        .order("title");

      if (error) {
        console.error("Error fetching products:", error);
        return [];
      }

      return data.filter((product) =>
        (product.product_variants || []).some(
          (variant: { stock_quantity: number }) => variant.stock_quantity > 0,
        ),
      ).map((p) => ({
        id: p.product_id,
        title: p.title,
        image: p.image,
      }));
    } catch (err) {
      console.error("Failed to get products:", err);
      return [];
    }
  },
};
