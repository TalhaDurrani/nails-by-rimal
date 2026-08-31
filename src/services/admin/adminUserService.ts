import { supabase } from '@/lib/supabase/client';
import type { ProfileType } from '@/types';

export interface UserWithStats extends ProfileType {
  total_orders: number;
  total_spent: number;
  is_active: boolean;
}

export interface UserFilters {
  role?: 'admin' | 'user';
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
  isActive?: boolean;
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  totalAdmins: number;
  usersByRole: Record<string, number>;
  topSpenders: UserWithStats[];
}

export const adminUserService = {
  async getUserAnalytics(): Promise<UserAnalytics> {
    const { data: users, error } = await supabase.from('profiles').select('*');
    if (error) throw new Error(`Unable to load user analytics: ${error.message}`);

    const allUsers = (users || []) as ProfileType[];
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('user_id, total, created_at')
      .not('user_id', 'is', null)
      .neq('status', 'cancelled');
    if (orderError) throw new Error(`Unable to load user orders: ${orderError.message}`);

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const stats = new Map<string, { count: number; spent: number; active: boolean }>();
    for (const order of orders || []) {
      if (!order.user_id) continue;
      const current = stats.get(order.user_id) || { count: 0, spent: 0, active: false };
      current.count += 1;
      current.spent += Number(order.total);
      current.active ||= new Date(order.created_at).getTime() >= thirtyDaysAgo;
      stats.set(order.user_id, current);
    }

    const usersWithStats: UserWithStats[] = allUsers.map((user) => {
      const userStats = stats.get(user.profile_id) || { count: 0, spent: 0, active: false };
      return {
        ...user,
        total_orders: userStats.count,
        total_spent: userStats.spent,
        is_active: userStats.active,
      };
    });
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    return {
      totalUsers: allUsers.length,
      activeUsers: usersWithStats.filter((user) => user.is_active).length,
      newUsersThisMonth: allUsers.filter(
        (user) => new Date(user.created_at) >= monthStart,
      ).length,
      totalAdmins: allUsers.filter((user) => user.role === 'admin').length,
      usersByRole: allUsers.reduce<Record<string, number>>((result, user) => {
        result[user.role] = (result[user.role] || 0) + 1;
        return result;
      }, {}),
      topSpenders: usersWithStats
        .filter((user) => user.total_spent > 0)
        .sort((a, b) => b.total_spent - a.total_spent)
        .slice(0, 10),
    };
  },
};
