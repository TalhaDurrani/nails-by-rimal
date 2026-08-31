"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Package,
  Gift,
  Percent,
  Calendar,
  TrendingUp,
  ArrowUpDown,
  X,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { BundleFormModal } from "@/components/admin/BundleFormModal";
import { DeleteConfirmModal } from "@/components/admin/DeleteConfirmModal";
import {
  adminBundleService,
  BundleWithProducts,
  UpdateBundleData,
} from "@/services/admin/adminBundleService";

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState<BundleWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingBundle, setEditingBundle] = useState<BundleWithProducts | null>(null);
  const [deletingBundle, setDeletingBundle] = useState<BundleWithProducts | null>(null);

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    try {
      setLoading(true);
      const data = await adminBundleService.getAllBundles();
      setBundles(data);
    } catch (error) {
      console.error("Error fetching bundles:", error);
      toast.error("Failed to load bundles");
    } finally {
      setLoading(false);
    }
  };


  const handleUpdateBundle = async (
    bundleId: string,
    bundleData: UpdateBundleData,
  ) => {
    try {
      await adminBundleService.updateBundle(bundleId, bundleData);
      toast.success("Bundle updated successfully");
      setEditingBundle(null);
      fetchBundles();
    } catch (error) {
      console.error("Error updating bundle:", error);
      toast.error("Failed to update bundle");
    }
  };

  const handleDeleteBundle = async (bundleId: string) => {
    try {
      await adminBundleService.deleteBundle(bundleId);
      toast.success("Bundle deleted successfully");
      setDeletingBundle(null);
      fetchBundles();
    } catch (error) {
      console.error("Error deleting bundle:", error);
      toast.error("Failed to delete bundle");
    }
  };

  const handleToggleActive = async (bundleId: string, isActive: boolean) => {
    try {
      await adminBundleService.toggleBundleActive(bundleId, isActive);
      toast.success(`Bundle ${isActive ? "activated" : "deactivated"}`);
      fetchBundles();
    } catch (error) {
      console.error("Error toggling bundle:", error);
      toast.error("Failed to update bundle status");
    }
  };

  const filteredBundles = bundles
    .filter((bundle) => {
      const matchesSearch =
        bundle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bundle.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && bundle.is_active) ||
        (statusFilter === "inactive" && !bundle.is_active);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "discount") {
        comparison = a.discount_percentage - b.discount_percentage;
      } else if (sortBy === "created_at") {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bundles</h1>
          <p className="text-gray-500 mt-1">Create and manage product bundles with special offers</p>
        </div>
        <Link href="/admin/bundles/create">
          <Button className="bg-gradient-to-r from-[#D89AA0] to-[#B48A4E] text-white hover:shadow-lg">
            <Plus className="mr-2 h-4 w-4" />
            Create Bundle
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search bundles by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:border-[#D89AA0] focus:ring-[#D89AA0]/20"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:border-[#D89AA0] focus:ring-[#D89AA0]/20"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:border-[#D89AA0] focus:ring-[#D89AA0]/20"
          >
            <option value="name">Name</option>
            <option value="discount">Discount</option>
            <option value="created_at">Date Added</option>
          </select>
        </div>

        {/* Sort Order Toggle */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="border-gray-200"
          >
            <ArrowUpDown className="w-4 h-4 mr-1" />
            {sortOrder === "asc" ? "Ascending" : "Descending"}
          </Button>
          {(searchTerm || statusFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              <X className="w-4 h-4 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Bundles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBundles.map((bundle) => (
          <div key={bundle.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
            {/* Bundle Header */}
            <div className="bg-gradient-to-r from-[#D89AA0]/10 to-[#B48A4E]/10 p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-[#B48A4E]" />
                  <h3 className="text-lg font-semibold text-gray-900">{bundle.name}</h3>
                </div>
                <Badge className="bg-gradient-to-r from-[#D89AA0] to-[#B48A4E] text-white border-none">
                  <Percent className="mr-1 h-3 w-3" />
                  {bundle.discount_percentage}% OFF
                </Badge>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{bundle.description}</p>
            </div>

            {/* Products Preview */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  {bundle.products.length} Products
                </span>
              </div>
              <div className="flex -space-x-2 overflow-hidden">
                {bundle.products.slice(0, 3).map((product) => (
                  <div
                    key={product.id}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-white flex items-center justify-center"
                  >
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <Package className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                ))}
                {bundle.products.length > 3 && (
                  <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                    +{bundle.products.length - 3}
                  </div>
                )}
              </div>
            </div>

            {/* Bundle Info */}
            <div className="px-4 pb-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>Created: {new Date(bundle.created_at).toLocaleDateString()}</span>
              </div>
              {bundle.expires_at && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <TrendingUp className="w-3 h-3" />
                  <span>Expires: {new Date(bundle.expires_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-4 pb-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingBundle(bundle)}
                className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                <Edit className="mr-1 h-3 w-3" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleActive(bundle.id, !bundle.is_active)}
                className={`flex-1 ${
                  bundle.is_active
                    ? "border-yellow-200 text-yellow-600 hover:bg-yellow-50"
                    : "border-green-200 text-green-600 hover:bg-green-50"
                }`}
              >
                {bundle.is_active ? "Deactivate" : "Activate"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingBundle(bundle)}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredBundles.length === 0 && !loading && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No bundles found
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {searchTerm
              ? "Try adjusting your search terms."
              : "Get started by creating your first bundle."}
          </p>
          {!searchTerm && (
            <Link href="/admin/bundles/create">
              <Button className="bg-gradient-to-r from-[#D89AA0] to-[#B48A4E] text-white hover:shadow-lg">
                <Plus className="mr-2 h-4 w-4" />
                Create Bundle
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Modals */}
      <BundleFormModal
        isOpen={!!editingBundle}
        onClose={() => setEditingBundle(null)}
        onSubmit={(data) => {
          if (editingBundle) handleUpdateBundle(editingBundle.id, data);
        }}
        bundle={editingBundle}
        title="Edit Bundle"
      />

      <DeleteConfirmModal
        isOpen={!!deletingBundle}
        onClose={() => setDeletingBundle(null)}
        onConfirm={() => handleDeleteBundle(deletingBundle!.id)}
        title="Delete Bundle"
        description={`Are you sure you want to delete "${deletingBundle?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
