import { supabase } from '@/lib/supabase/client';
import { ProductType } from '../../types';
import { isNoRowsError, toUserFacingQueryError } from '@/utils/errorHandling';
import { mapProductRecord, PRODUCT_SELECT } from './productMapper';

export const productService = {
  async getProducts(): Promise<ProductType[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .order('title');

      if (error) {
        throw toUserFacingQueryError('Products', error);
      }

      return (data || []).map(mapProductRecord);
    } catch (error) {
      throw error instanceof Error
        ? error
        : toUserFacingQueryError('Products', {});
    }
  },

  async getProductById(id: string): Promise<ProductType | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('product_id', id)
        .single();

      if (error) {
        if (isNoRowsError(error)) {
          return null;
        }
        throw toUserFacingQueryError('Product', error);
      }

      return mapProductRecord(data);
    } catch (error) {
      throw error instanceof Error
        ? error
        : toUserFacingQueryError('Product', {});
    }
  },

  async getProductsByCategory(categoryId: number): Promise<ProductType[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('category_id', categoryId)
        .order('title');

      if (error) {
        throw toUserFacingQueryError('Products', error);
      }

      return (data || []).map(mapProductRecord);
    } catch (error) {
      throw error instanceof Error
        ? error
        : toUserFacingQueryError('Products', {});
    }
  },
};
