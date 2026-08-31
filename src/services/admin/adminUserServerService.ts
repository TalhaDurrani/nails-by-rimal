import "server-only";

import { createAdminSupabase } from "@/lib/supabase/admin";
import { ProfileType } from "@/types";

export interface UserFilters {
  role?: "admin" | "user";
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
  isActive?: boolean;
}

export interface SanitizedUserWithStats {
  profile_id: string;
  username: string;
  email: string; // Sanitized email (masked)
  role: string;
  created_at: string;
  has_orders: boolean;
  order_count_range: string;
  spending_tier: string;
  is_active: boolean;
}

/**
 * Server-side admin service for user management
 * Sanitizes sensitive data before sending to client
 */
export const adminUserServerService = {
  /**
   * Get all users with filters and pagination - Server-side sanitized version
   */
  async getAllUsers(
    filters: UserFilters = {},
    page: number = 1,
    limit: number = 50,
  ): Promise<{ users: SanitizedUserWithStats[]; total: number }> {
    try {
      const supabase = createAdminSupabase();
      let query = supabase.from("profiles").select("*", { count: "exact" });

      // Apply filters
      if (filters.role) {
        query = query.eq("role", filters.role);
      }
      if (filters.searchTerm) {
        const safeSearch = filters.searchTerm.replace(/[%_,().]/g, " ").trim();
        if (safeSearch) {
        query = query.or(
            `username.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%`,
        );
        }
      }
      if (filters.dateFrom) {
        query = query.gte("created_at", filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte("created_at", filters.dateTo);
      }

      // Get paginated results
      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        console.error("Error fetching all users:", error);
        throw error;
      }

      const userIds = (data || []).map((user) => user.profile_id);
      type UserOrder = { user_id: string | null; total: number; created_at: string };
      let orders: UserOrder[] = [];
      let orderError: { message: string } | null = null;
      if (userIds.length) {
        const result = await supabase
          .from("orders")
          .select("user_id, total, created_at")
          .in("user_id", userIds)
          .neq("status", "cancelled");
        orders = (result.data || []) as UserOrder[];
        orderError = result.error;
      }
      if (orderError) throw orderError;
      const ordersByUser = new Map<string, UserOrder[]>();
      for (const order of orders || []) {
        if (!order.user_id) continue;
        const userOrders = ordersByUser.get(order.user_id) || [];
        userOrders.push(order);
        ordersByUser.set(order.user_id, userOrders);
      }

      const sanitizedUsers = (data || []).map((user) => {
          const userOrders = ordersByUser.get(user.profile_id) || [];
          const totalOrders = userOrders.length;
          const totalSpent = userOrders.reduce(
            (sum, order) => sum + order.total,
            0,
          );

          // Determine if user is active (has ordered in last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const isActive = userOrders.some(
            (order) => new Date(order.created_at) > thirtyDaysAgo,
          );

          // Sanitize sensitive data
          return {
            profile_id: user.profile_id,
            username: user.username,
            // Mask email for privacy
            email: maskEmail(user.email),
            role: user.role,
            created_at: user.created_at,
            // Use ranges instead of exact values
            has_orders: totalOrders > 0,
            order_count_range: getOrderCountRange(totalOrders),
            spending_tier: getSpendingTier(totalSpent),
            is_active: isActive,
          };
        });

      return {
        users: sanitizedUsers,
        total: count || 0,
      };
    } catch (err) {
      console.error("Failed to get all users:", err);
      throw err;
    }
  },

  /**
   * Update user role - Server action
   */
  async updateUserRole(
    userId: string,
    role: "admin" | "user",
  ): Promise<ProfileType | null> {
    try {
      const supabase = createAdminSupabase();

      if (role === "user") {
        const { count, error: countError } = await supabase
          .from("profiles")
          .select("profile_id", { count: "exact", head: true })
          .eq("role", "admin");
        if (countError) throw countError;
        if ((count || 0) <= 1) {
          throw new Error("The last administrator cannot be demoted");
        }
      }

      const { data, error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("profile_id", userId)
        .select()
        .single();

      if (error) {
        console.error("Error updating user role:", error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error("Failed to update user role:", err);
      throw err;
    }
  },

  /**
   * Delete user - Server action (only for admin)
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      const supabase = createAdminSupabase();
      const { count, error: orderError } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);
      if (orderError) throw orderError;
      if ((count || 0) > 0) {
        throw new Error("Users with order history cannot be deleted");
      }

      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) {
        console.error("Error deleting user:", error);
        throw error;
      }

      return true;
    } catch (err) {
      console.error("Failed to delete user:", err);
      throw err;
    }
  },
};

// Helper functions to sanitize sensitive data
function maskEmail(email: string): string {
  const [username, domain] = email.split("@");
  if (username.length <= 3) {
    return `${username.substring(0, 1)}***@${domain}`;
  }
  return `${username.substring(0, 3)}***@${domain}`;
}

function getOrderCountRange(count: number): string {
  if (count === 0) return "No orders";
  if (count <= 5) return "1-5 orders";
  if (count <= 10) return "6-10 orders";
  if (count <= 25) return "11-25 orders";
  return "25+ orders";
}

function getSpendingTier(amount: number): string {
  if (amount === 0) return "No purchases";
  if (amount <= 100) return "Low spender";
  if (amount <= 500) return "Medium spender";
  if (amount <= 1000) return "High spender";
  return "Premium customer";
}
