import { createPublicSupabase } from '@/lib/supabase/public';
import { ProductType } from '@/types';
import { mapProductRecord, PRODUCT_SELECT } from './productMapper';

export async function getProductsServer(): Promise<ProductType[]> {
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
    console.error('Error in getProductsServer:', error);
    return [];
  }
}
