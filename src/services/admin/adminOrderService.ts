import { supabase } from '@/lib/supabase/client';
import type { OrderStatus, OrderType } from '@/types';

interface CustomerStat {
  userId: string;
  username: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
}

export interface OrderWithDetails extends OrderType {
  profile?: { username: string; email: string };
  shipping_address?: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
}

export interface OrderFilters {
  status?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
  recentOrders: OrderWithDetails[];
  topCustomers: CustomerStat[];
}

const ADMIN_ORDER_SELECT = `
  *,
  profiles!orders_user_id_fkey(username, email)
`;

type AdminOrderRecord = OrderType & {
  profiles?: { username?: string; email?: string } | null;
};

function mapOrder(order: AdminOrderRecord): OrderWithDetails {
  return {
    ...order,
    profile: {
      username: order.profiles?.username || order.customer_name,
      email: order.profiles?.email || order.customer_email || 'Not provided',
    },
    shipping_address: {
      street: order.address_street,
      city: order.address_city,
      state: order.address_province,
      zip_code: order.address_postal_code || '',
      country: 'Pakistan',
    },
  };
}

export const adminOrderService = {
  async getAllOrders(
    filters: OrderFilters = {},
    page = 1,
    limit = 50,
  ): Promise<{ orders: OrderWithDetails[]; total: number }> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    let query = supabase
      .from('orders')
      .select(ADMIN_ORDER_SELECT, { count: 'exact' });

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.userId) query = query.eq('user_id', filters.userId);
    if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom);
    if (filters.dateTo) query = query.lte('created_at', filters.dateTo);
    if (filters.minAmount !== undefined) query = query.gte('total', filters.minAmount);
    if (filters.maxAmount !== undefined) query = query.lte('total', filters.maxAmount);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((safePage - 1) * safeLimit, safePage * safeLimit - 1);

    if (error) throw new Error(`Unable to load orders: ${error.message}`);
    return {
      orders: ((data || []) as AdminOrderRecord[]).map(mapOrder),
      total: count || 0,
    };
  },

  async getOrderDetails(orderId: number): Promise<OrderWithDetails | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(ADMIN_ORDER_SELECT)
      .eq('id', orderId)
      .maybeSingle();

    if (error) throw new Error(`Unable to load order: ${error.message}`);
    return data ? mapOrder(data as AdminOrderRecord) : null;
  },

  async updateOrderStatus(orderId: number, status: string): Promise<OrderType> {
    const validStatuses: OrderStatus[] = [
      'pending',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
    ];
    if (!validStatuses.includes(status as OrderStatus)) {
      throw new Error(`Invalid status: ${status}`);
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select('*')
      .single();

    if (error) throw new Error(`Unable to update order: ${error.message}`);
    return data as OrderType;
  },

  async cancelOrder(orderId: number): Promise<OrderType> {
    return this.updateOrderStatus(orderId, 'cancelled');
  },

  async getOrderAnalytics(): Promise<OrderAnalytics> {
    const { data, error } = await supabase
      .from('orders')
      .select(ADMIN_ORDER_SELECT)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Unable to load order analytics: ${error.message}`);
    const allOrders = ((data || []) as AdminOrderRecord[]).map(mapOrder);
    const revenueOrders = allOrders.filter((order) => order.status !== 'cancelled');
    const totalRevenue = revenueOrders.reduce(
      (sum, order) => sum + Number(order.total),
      0,
    );
    const ordersByStatus = allOrders.reduce<Record<string, number>>((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    const customerStats = allOrders.reduce<Record<string, CustomerStat>>((acc, order) => {
      const userId = order.user_id || `guest:${order.customer_email || order.id}`;
      if (!acc[userId]) {
        acc[userId] = {
          userId,
          username: order.profile?.username || order.customer_name,
          email: order.profile?.email || order.customer_email || 'Not provided',
          totalOrders: 0,
          totalSpent: 0,
        };
      }
      acc[userId].totalOrders += 1;
      acc[userId].totalSpent += Number(order.total);
      return acc;
    }, {});

    return {
      totalOrders: allOrders.length,
      totalRevenue,
      averageOrderValue: revenueOrders.length ? totalRevenue / revenueOrders.length : 0,
      ordersByStatus,
      recentOrders: allOrders.slice(0, 10),
      topCustomers: Object.values(customerStats)
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10),
    };
  },

  async getOrdersRequiringAttention(): Promise<OrderWithDetails[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 3);
    const { data, error } = await supabase
      .from('orders')
      .select(ADMIN_ORDER_SELECT)
      .in('status', ['pending', 'processing'])
      .lt('created_at', cutoff.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Unable to load attention orders: ${error.message}`);
    return ((data || []) as AdminOrderRecord[]).map(mapOrder);
  },
};
