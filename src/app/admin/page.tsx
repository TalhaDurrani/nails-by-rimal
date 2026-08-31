"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Activity,
} from "lucide-react";
import { adminProductService } from "@/services/admin/adminProductService";
import { adminOrderService } from "@/services/admin/adminOrderService";
import { adminUserService } from "@/services/admin/adminUserService";
import { formatCurrency } from "@/utils/formatCurrency";
import Link from "next/link";

interface DashboardStats {
  products: {
    total: number;
    lowStock: number;
    totalValue: number;
  };
  orders: {
    total: number;
    revenue: number;
    averageValue: number;
    pending: number;
  };
  users: {
    total: number;
    active: number;
    admins: number;
    newThisMonth: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch all analytics data in parallel
      const [productAnalytics, orderAnalytics, userAnalytics] =
        await Promise.all([
          adminProductService.getProductAnalytics(),
          adminOrderService.getOrderAnalytics(),
          adminUserService.getUserAnalytics(),
        ]);

      setStats({
        products: {
          total: productAnalytics.totalProducts,
          lowStock: productAnalytics.lowStockCount,
          totalValue: productAnalytics.totalInventoryValue,
        },
        orders: {
          total: orderAnalytics.totalOrders,
          revenue: orderAnalytics.totalRevenue,
          averageValue: orderAnalytics.averageOrderValue,
          pending: orderAnalytics.ordersByStatus.pending || 0,
        },
        users: {
          total: userAnalytics.totalUsers,
          active: userAnalytics.activeUsers,
          admins: userAnalytics.totalAdmins,
          newThisMonth: userAnalytics.newUsersThisMonth,
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p>Unable to load dashboard data. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here is what is happening with your store.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <div className="bg-white border border-[#E8CE9C]/40 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs uppercase tracking-wider text-[#B48A4E] font-medium">Total Revenue</p>
            <div className="p-2 bg-gradient-to-br from-[#D89AA0]/10 to-[#B48A4E]/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-[#BE7681]" />
              </div>
            </div>
            <div className="text-3xl font-bold font-serif text-[#2E2624]">
              {formatCurrency(stats.orders.revenue)}
            </div>
            <p className="text-sm text-[#7A6C68] mt-2">
              {stats.orders.total} total orders
            </p>
          </div>

          {/* Products Card */}
          <div className="bg-white border border-[#E8CE9C]/40 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs uppercase tracking-wider text-[#B48A4E] font-medium">Total Products</p>
              <div className="p-2 bg-gradient-to-br from-[#E8CE9C]/10 to-[#B48A4E]/10 rounded-lg">
                <Package className="w-5 h-5 text-[#B48A4E]" />
              </div>
            </div>
            <div className="text-3xl font-bold font-serif text-[#2E2624]">
              {stats.products.total}
            </div>
            <p className="text-sm text-[#7A6C68] mt-2">
              {stats.products.lowStock} low stock
            </p>
          </div>

          {/* Admin accounts card */}
          <div className="bg-white border border-[#E8CE9C]/40 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs uppercase tracking-wider text-[#B48A4E] font-medium">Admin Accounts</p>
              <div className="p-2 bg-gradient-to-br from-[#D89AA0]/10 to-[#E8CE9C]/10 rounded-lg">
                <Users className="w-5 h-5 text-[#D89AA0]" />
              </div>
            </div>
            <div className="text-3xl font-bold font-serif text-[#2E2624]">
              {stats.users.admins}
            </div>
            <p className="text-sm text-[#7A6C68] mt-2">
              Authorized dashboard users
            </p>
          </div>

          {/* Pending Orders Card */}
          <div className="bg-white border border-[#E8CE9C]/40 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs uppercase tracking-wider text-[#B48A4E] font-medium">Pending Orders</p>
              <div className="p-2 bg-gradient-to-br from-[#BE7681]/10 to-[#D89AA0]/10 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-[#BE7681]" />
              </div>
            </div>
            <div className="text-3xl font-bold font-serif text-[#2E2624]">
              {stats.orders.pending}
            </div>
            <p className="text-sm text-[#7A6C68] mt-2">
              Awaiting attention
            </p>
          </div>
      </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-b from-[#FCF1ED] to-[#FBF6F2] border border-[#E8CE9C]/40 rounded-lg p-8">
          <h2 className="text-2xl font-serif font-semibold text-[#2E2624] mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/products" className="block">
              <Button className="w-full bg-gradient-to-r from-[#D89AA0] to-[#B48A4E] text-white hover:shadow-lg transition-all duration-300 cursor-pointer px-4 py-3">
                <Package className="mr-2 h-4 w-4" />
                Manage Products
              </Button>
            </Link>
            <Link href="/admin/orders" className="block">
              <Button className="w-full bg-gradient-to-r from-[#BE7681] to-[#B48A4E] text-white hover:shadow-lg transition-all duration-300 cursor-pointer px-4 py-3">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Manage Orders
              </Button>
            </Link>
            <Link href="/admin/users" className="block">
              <Button className="w-full bg-gradient-to-r from-[#E8CE9C] to-[#B48A4E] text-[#2E2624] hover:shadow-lg transition-all duration-300 cursor-pointer px-4 py-3 font-semibold">
                <Users className="mr-2 h-4 w-4" />
                Manage Admins
              </Button>
            </Link>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Metrics */}
        <div className="bg-white border border-[#E8CE9C]/40 rounded-lg p-8">
          <div className="flex items-center mb-6">
            <TrendingUp className="w-5 h-5 text-[#B48A4E] mr-3" />
            <h3 className="text-xl font-serif font-semibold text-[#2E2624]">Key Metrics</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-[#E8CE9C]/40">
              <span className="text-[13px] text-[#7A6C68]">Average Order Value</span>
              <span className="font-semibold text-[#2E2624]">
                {formatCurrency(stats.orders.averageValue)}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[#E8CE9C]/40">
              <span className="text-[13px] text-[#7A6C68]">Inventory Value</span>
              <span className="font-semibold text-[#2E2624]">
                {formatCurrency(stats.products.totalValue)}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[#E8CE9C]/40">
              <span className="text-[13px] text-[#7A6C68]">Accounts Added This Month</span>
              <span className="font-semibold text-[#2E2624]">{stats.users.newThisMonth}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-[13px] text-[#7A6C68]">Admin Users</span>
              <span className="font-semibold text-[#2E2624]">{stats.users.admins}</span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white border border-[#E8CE9C]/40 rounded-lg p-8">
          <div className="flex items-center mb-6">
            <AlertTriangle className="w-5 h-5 text-[#B48A4E] mr-3" />
            <h3 className="text-xl font-serif font-semibold text-[#2E2624]">Alerts & Notifications</h3>
          </div>
          <div className="space-y-3">
            {stats.products.lowStock > 0 && (
              <div className="flex items-start p-4 rounded-lg bg-[#FFF8DC] border border-[#FFE680]">
                <AlertTriangle className="w-4 h-4 text-[#FF9F40] mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[13px] font-semibold text-[#2E2624]">
                    Low Stock Alert
                  </p>
                  <p className="text-[12px] text-[#7A6C68] mt-1">
                    {stats.products.lowStock} products running low on stock
                  </p>
                </div>
              </div>
            )}

            {stats.orders.pending > 0 && (
              <div className="flex items-start p-4 rounded-lg bg-[#F0E8FF] border border-[#D89AA0]">
                <Activity className="w-4 h-4 text-[#BE7681] mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[13px] font-semibold text-[#2E2624]">
                    Pending Orders
                  </p>
                  <p className="text-[12px] text-[#7A6C68] mt-1">
                    {stats.orders.pending} orders waiting for processing
                  </p>
                </div>
              </div>
            )}

            {stats.products.lowStock === 0 && stats.orders.pending === 0 && (
              <div className="flex items-start p-4 rounded-lg bg-[#E8F8E8] border border-[#90EE90]">
                <Activity className="w-4 h-4 text-[#2D8C2D] mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[13px] font-semibold text-[#2E2624]">
                    All Clear
                  </p>
                  <p className="text-[12px] text-[#7A6C68] mt-1">
                    No immediate attention required
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
