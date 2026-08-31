import { supabase } from '@/lib/supabase/client';
import type { OrderStatus, OrderType } from '@/types';
import { ORDER_SELECT } from './orderQueries';

export const orderService = {
  async getOrders(userId: string): Promise<OrderType[]> {
    if (!userId) return [];
    const { data, error } = await supabase
      .from('orders')
      .select(ORDER_SELECT)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Unable to load orders: ${error.message}`);
    return (data || []) as OrderType[];
  },

  async getOrderById(orderId: string): Promise<OrderType> {
    const { data, error } = await supabase
      .from('orders')
      .select(ORDER_SELECT)
      .eq('id', orderId)
      .single();

    if (error) throw new Error(`Unable to load order: ${error.message}`);
    return data as OrderType;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderType> {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select('*')
      .single();

    if (error) throw new Error(`Unable to update order: ${error.message}`);
    return data as OrderType;
  },

  async deleteOrder(orderId: string): Promise<boolean> {
    await this.updateOrderStatus(orderId, 'cancelled');
    return true;
  },
};
