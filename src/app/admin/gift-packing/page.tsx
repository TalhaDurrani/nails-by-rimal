"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Gift, Search, X, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { adminGiftPackingService, GiftPacking } from "@/services/admin/adminGiftPackingService";

export default function AdminGiftPackingPage() {
  const [giftPackings, setGiftPackings] = useState<GiftPacking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<GiftPacking | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
  });

  useEffect(() => {
    fetchGiftPackings();
  }, []);

  const fetchGiftPackings = async () => {
    try {
      setLoading(true);
      const data = await adminGiftPackingService.getAllGiftPackings();
      setGiftPackings(data);
    } catch (error) {
      console.error("Error fetching gift packings:", error);
      toast.error("Failed to load gift packings");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price) || 0,
        image_url: formData.image_url.trim() || null,
      };

      if (editingItem) {
        await adminGiftPackingService.updateGiftPacking(editingItem.id, submitData);
        toast.success("Gift packing updated successfully");
      } else {
        await adminGiftPackingService.createGiftPacking(submitData);
        toast.success("Gift packing created successfully");
      }

      setShowCreateModal(false);
      setEditingItem(null);
      setFormData({ name: "", description: "", price: "", image_url: "" });
      fetchGiftPackings();
    } catch (error) {
      console.error("Error saving gift packing:", error);
      toast.error("Failed to save gift packing");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this gift packing option?")) return;

    try {
      await adminGiftPackingService.deleteGiftPacking(id);
      toast.success("Gift packing deleted successfully");
      fetchGiftPackings();
    } catch (error) {
      console.error("Error deleting gift packing:", error);
      toast.error("Failed to delete gift packing");
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await adminGiftPackingService.toggleGiftPackingActive(id, isActive);
      toast.success(`Gift packing ${!isActive ? "activated" : "deactivated"}`);
      fetchGiftPackings();
    } catch (error) {
      console.error("Error toggling gift packing:", error);
      toast.error("Failed to update gift packing");
    }
  };

  const filteredPackings = giftPackings
    .filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item.is_active) ||
        (statusFilter === "inactive" && !item.is_active);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "price") {
        comparison = a.price - b.price;
      } else if (sortBy === "created_at") {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500">Loading gift packings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gift Packing</h1>
          <p className="text-gray-500 mt-1">Manage gift packaging options</p>
        </div>
        <Button
          onClick={() => {
            setEditingItem(null);
            setFormData({ name: "", description: "", price: "", image_url: "" });
            setShowCreateModal(true);
          }}
          className="bg-gradient-to-r from-[#D89AA0] to-[#B48A4E] text-white hover:shadow-lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Gift Packing
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search gift packings..."
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
            <option value="price">Price</option>
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

      {/* Gift Packings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackings.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            {item.image_url && (
              <div className="h-40 bg-gradient-to-br from-gray-50 to-gray-100">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D89AA0]/20 to-[#B48A4E]/20 flex items-center justify-center">
                    <Gift className="w-5 h-5 text-[#B48A4E]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <span
                      className={`text-xs ${
                        item.is_active ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {item.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <span className="text-lg font-bold text-[#BE7681]">
                  Rs {item.price.toLocaleString()}
                </span>
              </div>
              {item.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">{item.description}</p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(item.id, item.is_active)}
                  className={`flex-1 ${
                    item.is_active
                      ? "border-yellow-200 text-yellow-600 hover:bg-yellow-50"
                      : "border-green-200 text-green-600 hover:bg-green-50"
                  }`}
                >
                  {item.is_active ? "Deactivate" : "Activate"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingItem(item);
                    setFormData({
                      name: item.name,
                      description: item.description || "",
                      price: item.price.toString(),
                      image_url: item.image_url || "",
                    });
                    setShowCreateModal(true);
                  }}
                  className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  <Edit className="mr-1 h-3 w-3" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPackings.length === 0 && !loading && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No gift packings found
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {searchTerm
              ? "Try adjusting your search terms."
              : "Get started by creating your first gift packing option."}
          </p>
          {!searchTerm && (
            <Button
              onClick={() => {
                setEditingItem(null);
                setFormData({ name: "", description: "", price: "", image_url: "" });
                setShowCreateModal(true);
              }}
              className="bg-gradient-to-r from-[#D89AA0] to-[#B48A4E] text-white hover:shadow-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Gift Packing
            </Button>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 lg:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingItem ? "Edit Gift Packing" : "Create Gift Packing"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Premium Gift Box"
                  required
                  className="mt-2 border-gray-300 focus:border-[#D89AA0] focus:ring-[#D89AA0]/20"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this gift packing option..."
                  rows={3}
                  className="mt-2 border-gray-300 focus:border-[#D89AA0] focus:ring-[#D89AA0]/20 resize-none"
                />
              </div>
              <div>
                <Label htmlFor="price">Price (Rs) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  required
                  className="mt-2 border-gray-300 focus:border-[#D89AA0] focus:ring-[#D89AA0]/20"
                />
              </div>
              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 border-gray-300 focus:border-[#D89AA0] focus:ring-[#D89AA0]/20"
                  />
                  {formData.image_url && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image_url: "" })}
                      className="p-2 border border-gray-200 rounded hover:bg-gray-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {formData.image_url && (
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="mt-2 w-full h-32 object-cover rounded border border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingItem(null);
                    setFormData({ name: "", description: "", price: "", image_url: "" });
                  }}
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#D89AA0] to-[#B48A4E] text-white hover:shadow-lg"
                >
                  {editingItem ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
