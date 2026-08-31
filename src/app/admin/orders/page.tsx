"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Eye,
  Calendar,
  DollarSign,
  Package,
  User,
  MapPin,
} from "lucide-react";
import {
  adminOrderService,
  OrderFilters,
  OrderWithDetails,
} from "@/services/admin/adminOrderService";
import { formatCurrency } from "@/utils/formatCurrency";
import { format } from "date-fns";
import { toast } from "sonner";
import { OrderDetailsModal } from "@/components/admin/OrderDetailsModal";

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const allowedStatusTransitions: Record<string, string[]> = {
  pending: ["pending", "processing", "cancelled"],
  processing: ["processing", "shipped", "cancelled"],
  shipped: ["shipped", "delivered"],
  delivered: ["delivered"],
  cancelled: ["cancelled"],
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<OrderFilters>({});
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(
    null,
  );
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const pageLimit = 20;

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminOrderService.getAllOrders(
        filters,
        currentPage,
        pageLimit,
      );
      setOrders(data.orders);
      setTotalOrders(data.total);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, pageLimit]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await adminOrderService.updateOrderStatus(orderId, newStatus);
      toast.success("Order status updated successfully");
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const handleFilterChange = (key: keyof OrderFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalOrders / pageLimit);

  const filteredOrders = orders.filter((order) => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      order.id.toString().includes(searchLower) ||
      order.order_number.toLowerCase().includes(searchLower) ||
      order.customer_name.toLowerCase().includes(searchLower) ||
      order.customer_email?.toLowerCase().includes(searchLower) ||
      order.profile?.username?.toLowerCase().includes(searchLower) ||
      order.profile?.email?.toLowerCase().includes(searchLower)
    );
  });

  if (loading && orders.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">Manage customer orders and fulfillment</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg">
          <span className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{totalOrders}</span> total orders
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by order ID, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:border-[#D89AA0] focus:ring-[#D89AA0]/20"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <Select
              value={filters.status || "all"}
              onValueChange={(value) => {
                const v = value ?? "";
                handleFilterChange("status", v === "all" ? "" : v);
              }}
            >
              <SelectTrigger className="w-40 border-gray-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            type="date"
            placeholder="From date"
            value={filters.dateFrom || ""}
            onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
            className="w-40 border-gray-200"
          />

          <Input
            type="date"
            placeholder="To date"
            value={filters.dateTo || ""}
            onChange={(e) => handleFilterChange("dateTo", e.target.value)}
            className="w-40 border-gray-200"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-base font-semibold text-gray-900">{order.order_number}</h3>
                    <Badge className="bg-gradient-to-r from-[#D89AA0] to-[#B48A4E] text-white border-none">
                      {order.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {order.created_at
                        ? format(new Date(order.created_at), "MMM dd, yyyy")
                        : "No date"}
                    </span>
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {order.profile?.username || "Unknown"}
                    </span>
                    <span className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      {formatCurrency(order.total)}
                    </span>
                    {order.shipping_address && (
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {order.shipping_address.city}, {order.shipping_address.state}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-start lg:items-center">
                  <Select
                    value={order.status}
                    disabled={(allowedStatusTransitions[order.status] || []).length <= 1}
                    onValueChange={(value) => {
                      if (value != null) {
                        handleStatusChange(order.id, value);
                      }
                    }}
                  >
                    <SelectTrigger className="w-40 border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions
                        .filter(
                          (option) =>
                            option.value !== "all" &&
                            allowedStatusTransitions[order.status]?.includes(option.value),
                        )
                        .map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowOrderDetails(true);
                    }}
                    className="bg-gradient-to-r from-[#D89AA0] to-[#B48A4E] text-white hover:shadow-lg"
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-sm text-gray-500">
              No orders match your current filters.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <span className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{(currentPage - 1) * pageLimit + 1}</span> to{" "}
              <span className="font-semibold text-gray-900">{Math.min(currentPage * pageLimit, totalOrders)}</span> of{" "}
              <span className="font-semibold text-gray-900">{totalOrders}</span> orders
            </span>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Previous
              </Button>

              <span className="text-sm text-gray-600 min-w-[100px] text-center">
                Page <span className="font-semibold text-gray-900">{currentPage}</span> of <span className="font-semibold text-gray-900">{totalPages}</span>
              </span>

              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          isOpen={showOrderDetails}
          onClose={() => {
            setShowOrderDetails(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
        />
      )}
    </div>
  );
}
