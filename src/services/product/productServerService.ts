import { createPublicSupabase } from '@/lib/supabase/public';
import { ProductType } from '@/types';
import { mapProductRecord, PRODUCT_SELECT } from './productMapper';

export const productServerService = {
  async getProducts(): Promise<ProductType[]> {
    try {
      const supabase = createPublicSupabase();
      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('is_published', true)
        .order('title');

      if (error) {
        console.error('Error fetching products:', error);
        return [];
      }

      return (data || []).map(mapProductRecord);
    } catch (error) {
      console.error('Error in getProducts:', error);
      return [];
    }
  },

  async getProductById(id: string): Promise<ProductType | null> {
    try {
      const supabase = createPublicSupabase();
      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('product_id', id)
        .eq('is_published', true)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        return null;
      }

      return mapProductRecord(data);
    } catch (error) {
      console.error('Error in getProductById:', error);
      return null;
    }
  },

  async getProductsByCategory(categoryId: number): Promise<ProductType[]> {
    try {
      const supabase = createPublicSupabase();
      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('category_id', categoryId)
        .eq('is_published', true)
        .order('title');

      if (error) {
        console.error('Error fetching products by category:', error);
        return [];
      }

      return (data || []).map(mapProductRecord);
    } catch (error) {
      console.error('Error in getProductsByCategory:', error);
      return [];
    }
  },

  async searchProducts(query: string): Promise<ProductType[]> {
    try {
      const supabase = createPublicSupabase();
      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .ilike('title', `%${query}%`)
        .eq('is_published', true)
        .order('title');

      if (error) {
        console.error('Error searching products:', error);
        return [];
      }

      return (data || []).map(mapProductRecord);
    } catch (error) {
      console.error('Error in searchProducts:', error);
      return [];
    }
  },
};
