import { supabase } from "@/lib/supabase/client";
import { ProductType } from "@/types";
import { mapProductRecord } from "@/services/product/productMapper";

export interface CreateProductData {
  title: string;
  description: string;
  price: number;
  image?: string;
  stock: number;
  sku?: string;
  category_id?: number;
  images?: Array<{
    url: string;
    file?: File;
    alt_text?: string;
    display_order?: number;
  }>;
  variants?: Array<{
    id?: number;
    shape_id: number;
    length_id: number;
    finish_id: number;
    stock_quantity: number;
    price_override?: number;
    sku?: string;
  }>;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  updated_at?: string;
}

export interface ProductVariant {
  id: number;
  product_id: string;
  shape_id: number;
  length_id: number;
  finish_id: number;
  stock_quantity: number;
  price_override: number | null;
  sku: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductWithDetails extends ProductType {
  category?: {
    id: number;
    name: string;
  };
  total_reviews?: number;
  average_rating?: number;
}

const PRODUCT_IMAGE_BUCKET = "product-images";
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

async function prepareProductImages(images: CreateProductData["images"] = []) {
  const prepared: Array<{ url: string; alt_text?: string; display_order?: number }> = [];
  const uploadedPaths: string[] = [];

  for (const image of images) {
    if (image.file) {
      if (!ALLOWED_IMAGE_TYPES.has(image.file.type)) {
        throw new Error("Product images must be JPEG, PNG, WebP, or AVIF files");
      }
      if (image.file.size > 5 * 1024 * 1024) {
        throw new Error("Each product image must be 5 MB or smaller");
      }

      const extension = image.file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `products/${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage
        .from(PRODUCT_IMAGE_BUCKET)
        .upload(path, image.file, { contentType: image.file.type, upsert: false });
      if (error) {
        if (uploadedPaths.length) {
          await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove(uploadedPaths);
        }
        throw error;
      }

      uploadedPaths.push(path);
      const { data } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path);
      prepared.push({
        url: data.publicUrl,
        alt_text: image.alt_text,
        display_order: image.display_order,
      });
      continue;
    }

    if (image.url.startsWith("blob:")) {
      throw new Error("A selected product image could not be uploaded");
    }
    if (image.url && !image.url.startsWith("/") && !image.url.startsWith("https://")) {
      throw new Error("Product image URLs must use HTTPS");
    }
    if (image.url) prepared.push(image);
  }

  return { prepared, uploadedPaths };
}

/**
 * Admin service for product management
 * Requires admin privileges for all operations
 */
export const adminProductService = {
  /**
   * Get all products with additional details for admin view
   */
  async getAllProducts(): Promise<ProductWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
					*,
					categories!products_category_id_fkey (
						id,
						name
					),
          variants:product_variants(
            *,
            shape:shapes(*),
            length:lengths(*),
            finish:finishes(*)
          )
				`,
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching all products:", error);
        throw error;
      }

      // Get review statistics for each product
      const productsWithStats = await Promise.all(
        (data || []).map(async (product) => {
          const { data: reviewStats } = await supabase
            .from("reviews")
            .select("rating")
            .eq("product_id", product.product_id);

          const reviews = reviewStats || [];
          const totalReviews = reviews.length;
          const averageRating =
            totalReviews > 0
              ? reviews.reduce((sum, review) => sum + review.rating, 0) /
                totalReviews
              : 0;

          return {
            ...mapProductRecord(product),
            category: product.categories,
            total_reviews: totalReviews,
            average_rating: Number(averageRating.toFixed(1)),
          };
        }),
      );

      return productsWithStats;
    } catch (err) {
      console.error("Failed to get all products:", err);
      throw err;
    }
  },

  /**
   * Create a new product with variants and images
   */
  async createProduct(productData: CreateProductData): Promise<ProductType> {
    let uploadedPaths: string[] = [];
    try {
      const { prepared, uploadedPaths: newUploads } = await prepareProductImages(
        productData.images,
      );
      uploadedPaths = newUploads;
      const variants = productData.variants || [];
      if (!variants.length) throw new Error("At least one product variant is required");

      // Create the product
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          title: productData.title,
          description: productData.description,
          category_id: productData.category_id ?? null,
          image: prepared[0]?.url ?? productData.image ?? null,
          base_price: productData.price,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (productError) {
        console.error("Error creating product:", productError);
        throw productError;
      }

      // Create product images if provided
      if (prepared.length > 0) {
        const imageInserts = prepared.map((img, index) => ({
          product_id: product.product_id,
          image_url: img.url,
          alt_text: img.alt_text || null,
          display_order: img.display_order ?? index,
        }));

        const { error: imagesError } = await supabase
          .from("product_images")
          .insert(imageInserts);

        if (imagesError) {
          console.error("Error creating product images:", imagesError);
          await supabase.from("products").delete().eq("product_id", product.product_id);
          throw imagesError;
        }
      }

      // Create product variants if provided
      if (variants.length > 0) {
        const variantInserts = variants.map((variant) => ({
          product_id: product.product_id,
          shape_id: variant.shape_id,
          length_id: variant.length_id,
          finish_id: variant.finish_id,
          stock_quantity: variant.stock_quantity,
          price_override: variant.price_override || null,
          sku: variant.sku || null,
        }));

        const { error: variantsError } = await supabase
          .from("product_variants")
          .insert(variantInserts);

        if (variantsError) {
          console.error("Error creating product variants:", variantsError);
          await supabase.from("products").delete().eq("product_id", product.product_id);
          throw variantsError;
        }
      }

      return mapProductRecord({ ...product, variants });
    } catch (err) {
      if (uploadedPaths.length) {
        await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove(uploadedPaths);
      }
      console.error("Failed to create product:", err);
      throw err;
    }
  },

  /**
   * Update an existing product
   */
  async updateProduct(
    productId: string,
    productData: UpdateProductData,
  ): Promise<ProductType> {
    let uploadedPaths: string[] = [];
    try {
      const { prepared, uploadedPaths: newUploads } = await prepareProductImages(
        productData.images,
      );
      uploadedPaths = newUploads;
      const variants = productData.variants;
      if (variants && !variants.length) {
        throw new Error("At least one product variant is required");
      }
      const { data, error } = await supabase
        .from("products")
        .update({
          ...(productData.title === undefined ? {} : { title: productData.title }),
          ...(productData.description === undefined
            ? {}
            : { description: productData.description }),
          ...(productData.category_id === undefined
            ? {}
            : { category_id: productData.category_id }),
          ...(productData.price === undefined
            ? {}
            : { base_price: productData.price }),
          ...(productData.images === undefined
            ? {}
            : { image: prepared[0]?.url ?? null }),
          updated_at: new Date().toISOString(),
        })
        .eq("product_id", productId)
        .select()
        .single();

      if (error) {
        console.error("Error updating product:", error);
        throw error;
      }

      if (productData.images) {
        const { error: deleteImagesError } = await supabase
          .from("product_images")
          .delete()
          .eq("product_id", productId);
        if (deleteImagesError) throw deleteImagesError;

        if (prepared.length > 0) {
          const { error: imageError } = await supabase.from("product_images").insert(
            prepared.map((image, index) => ({
              product_id: productId,
              image_url: image.url,
              alt_text: image.alt_text || null,
              display_order: image.display_order ?? index,
            })),
          );
          if (imageError) throw imageError;
        }
      }

      if (variants) {
        const existingVariants = await this.getProductVariants(productId);
        const existingByCombination = new Map(
          existingVariants.map((variant) => [
            `${variant.shape_id}:${variant.length_id}:${variant.finish_id}`,
            variant,
          ]),
        );
        const normalizedVariants = variants.map((variant) => {
          if (variant.id) return variant;
          const existing = existingByCombination.get(
            `${variant.shape_id}:${variant.length_id}:${variant.finish_id}`,
          );
          return existing ? { ...variant, id: existing.id } : variant;
        });
        const retainedIds = new Set(
          normalizedVariants.flatMap((variant) =>
            variant.id ? [variant.id] : [],
          ),
        );
        const removedIds = existingVariants
          .filter((variant) => !retainedIds.has(variant.id))
          .map((variant) => variant.id);

        if (removedIds.length) {
          const { error: retireError } = await supabase
            .from("product_variants")
            .update({ stock_quantity: 0, updated_at: new Date().toISOString() })
            .in("id", removedIds);
          if (retireError) throw retireError;
        }

        for (const variant of normalizedVariants) {
          const values = {
            product_id: productId,
            shape_id: variant.shape_id,
            length_id: variant.length_id,
            finish_id: variant.finish_id,
            stock_quantity: variant.stock_quantity,
            price_override: variant.price_override ?? null,
            sku: variant.sku || null,
            updated_at: new Date().toISOString(),
          };
          const operation = variant.id
            ? supabase.from("product_variants").update(values).eq("id", variant.id)
            : supabase.from("product_variants").insert(values);
          const { error: variantError } = await operation;
          if (variantError) throw variantError;
        }
      }

      return mapProductRecord({ ...data, variants: variants || [] });
    } catch (err) {
      if (uploadedPaths.length) {
        await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove(uploadedPaths);
      }
      console.error("Failed to update product:", err);
      throw err;
    }
  },

  /**
   * Delete a product
   */
  async deleteProduct(productId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("product_id", productId);

      if (error) {
        if (error.code === "23503") {
          const { error: archiveError } = await supabase
            .from("products")
            .update({ is_published: false, updated_at: new Date().toISOString() })
            .eq("product_id", productId);
          if (archiveError) throw archiveError;
          return true;
        }
        console.error("Error deleting product:", error);
        throw error;
      }

      return true;
    } catch (err) {
      console.error("Failed to delete product:", err);
      throw err;
    }
  },

  /**
   * Update product stock
   */
  async updateStock(productId: string, newStock: number): Promise<ProductType> {
    try {
      const variants = await this.getProductVariants(productId);
      if (variants.length === 0) throw new Error("Product has no variants");
      const perVariant = Math.floor(newStock / variants.length);
      let remainder = newStock % variants.length;
      await Promise.all(
        variants.map((variant) => {
          const stockQuantity = perVariant + (remainder-- > 0 ? 1 : 0);
          return this.updateProductVariant(variant.id, { stock_quantity: stockQuantity });
        }),
      );
      const { data, error } = await supabase
        .from("products")
        .select("*, variants:product_variants(*)")
        .eq("product_id", productId)
        .single();

      if (error) {
        console.error("Error updating product stock:", error);
        throw error;
      }

      return mapProductRecord(data);
    } catch (err) {
      console.error("Failed to update product stock:", err);
      throw err;
    }
  },

  /**
   * Get products with low stock (below threshold)
   */
  async getLowStockProducts(threshold: number = 10): Promise<ProductType[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*, variants:product_variants(*)");

      if (error) {
        console.error("Error fetching low stock products:", error);
        throw error;
      }

      return (data || [])
        .map(mapProductRecord)
        .filter((product) => product.stock < threshold)
        .sort((a, b) => a.stock - b.stock);
    } catch (err) {
      console.error("Failed to get low stock products:", err);
      return [];
    }
  },

  /**
   * Get product analytics data
   */
  async getProductAnalytics() {
    try {
      // Get total products count
      const { count: totalProducts } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      // Get products by category
      const { data: categoryCounts } = await supabase.from("products").select(`
					category_id,
					categories!products_category_id_fkey (
						name
					)
				`);

      // Count products by category
      const categoryStats = (categoryCounts || []).reduce<
        Record<string, number>
      >((acc, product) => {
        const categoryName = (() => {
          const cat = (product as { categories?: unknown }).categories;
          if (Array.isArray(cat)) {
            return (cat[0] as { name?: string }).name ?? "Uncategorized";
          }
          return (cat as { name?: string } | null)?.name ?? "Uncategorized";
        })();

        acc[categoryName] = (acc[categoryName] || 0) + 1;
        return acc;
      }, {});

      // Get low stock count
      const { data: products } = await supabase
        .from("products")
        .select("base_price, product_variants(stock_quantity, price_override)");
      const mappedInventory = (products || []).map((product) => {
        const variants = product.product_variants || [];
        const stock = variants.reduce(
          (sum: number, variant: { stock_quantity: number }) =>
            sum + Number(variant.stock_quantity),
          0,
        );
        const value = variants.reduce(
          (
            sum: number,
            variant: { stock_quantity: number; price_override?: number | null },
          ) =>
            sum + Number(variant.stock_quantity) * Number(variant.price_override ?? product.base_price),
          0,
        );
        return { stock, value };
      });
      const lowStockCount = mappedInventory.filter((item) => item.stock < 10).length;
      const totalInventoryValue = mappedInventory.reduce(
        (sum, product) => sum + product.value,
        0,
      );

      return {
        totalProducts: totalProducts || 0,
        categoryStats,
        lowStockCount: lowStockCount || 0,
        totalInventoryValue: Number(totalInventoryValue.toFixed(2)),
      };
    } catch (err) {
      console.error("Failed to get product analytics:", err);
      return {
        totalProducts: 0,
        categoryStats: {},
        lowStockCount: 0,
        totalInventoryValue: 0,
      };
    }
  },

  /**
   * Bulk update products
   */
  async bulkUpdateProducts(
    updates: Array<{ productId: string; data: UpdateProductData }>,
  ): Promise<boolean> {
    try {
      const promises = updates.map(({ productId, data }) =>
        this.updateProduct(productId, data),
      );

      await Promise.all(promises);
      return true;
    } catch (err) {
      console.error("Failed to bulk update products:", err);
      throw err;
    }
  },

  /**
   * Get product variants
   */
  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    try {
      const { data, error } = await supabase
        .from("product_variants")
        .select(`
          *,
          shapes!product_variants_shape_id_fkey (name),
          lengths!product_variants_length_id_fkey (name),
          finishes!product_variants_finish_id_fkey (name, swatch_hex)
        `)
        .eq("product_id", productId);

      if (error) {
        console.error("Error fetching product variants:", error);
        throw error;
      }

      return data || [];
    } catch (err) {
      console.error("Failed to get product variants:", err);
      throw err;
    }
  },

  /**
   * Get all shapes
   */
  async getShapes(): Promise<Array<{ id: number; name: string; is_active: boolean }>> {
    try {
      const { data, error } = await supabase
        .from("shapes")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Failed to get shapes:", err);
      return [];
    }
  },

  /**
   * Get all lengths
   */
  async getLengths(): Promise<Array<{ id: number; name: string; is_active: boolean }>> {
    try {
      const { data, error } = await supabase
        .from("lengths")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Failed to get lengths:", err);
      return [];
    }
  },

  /**
   * Get all finishes
   */
  async getFinishes(): Promise<Array<{ id: number; name: string; swatch_hex: string | null; is_active: boolean }>> {
    try {
      const { data, error } = await supabase
        .from("finishes")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Failed to get finishes:", err);
      return [];
    }
  },

  /**
   * Create product variant
   */
  async createProductVariant(
    productId: string,
    variantData: Omit<ProductVariant, "id" | "product_id" | "created_at" | "updated_at">
  ): Promise<ProductVariant> {
    try {
      const { data, error } = await supabase
        .from("product_variants")
        .insert({
          product_id: productId,
          ...variantData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Failed to create product variant:", err);
      throw err;
    }
  },

  /**
   * Update product variant
   */
  async updateProductVariant(
    variantId: number,
    variantData: Partial<ProductVariant>
  ): Promise<ProductVariant> {
    try {
      const { data, error } = await supabase
        .from("product_variants")
        .update({
          ...variantData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", variantId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Failed to update product variant:", err);
      throw err;
    }
  },

  /**
   * Delete product variant
   */
  async deleteProductVariant(variantId: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("product_variants")
        .delete()
        .eq("id", variantId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Failed to delete product variant:", err);
      throw err;
    }
  },
};
