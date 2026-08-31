"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Package, Search, ArrowUpDown, X } from "lucide-react";
import { toast } from "sonner";
import { adminCategoryService, Category } from "@/services/admin/adminCategoryService";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parent_id: "" as string | number,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await adminCategoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        parent_id: formData.parent_id === "" ? null : parseInt(formData.parent_id as string),
      };

      if (editingCategory) {
        await adminCategoryService.updateCategory(editingCategory.id, submitData);
        toast.success("Category updated successfully");
      } else {
        await adminCategoryService.createCategory(submitData);
        toast.success("Category created successfully");
      }

      setShowCreateModal(false);
      setEditingCategory(null);
      setFormData({ name: "", description: "", parent_id: "" });
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      await adminCategoryService.deleteCategory(id);
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  const filteredCategories = categories
    .filter(
      (cat) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "created_at") {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 mt-1">Manage product categories</p>
        </div>
        <Button
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: "", description: "", parent_id: "" });
            setShowCreateModal(true);
          }}
          className="bg-gradient-to-r from-[#D89AA0] to-[#B48A4E] text-white hover:shadow-lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:border-[#D89AA0] focus:ring-[#D89AA0]/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:border-[#D89AA0] focus:ring-[#D89AA0]/20"
            >
              <option value="name">Name</option>
              <option value="created_at">Date Added</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="border-gray-200"
            >
              <ArrowUpDown className="w-4 h-4 mr-1" />
              {sortOrder === "asc" ? "A-Z" : "Z-A"}
            </Button>
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm("")}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#D89AA0]/20 to-[#B48A4E]/20 flex items-center justify-center">
                  <Package className="w-6 h-6 text-[#B48A4E]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  {category.parent_id && (
                    <span className="text-xs text-gray-500">Subcategory</span>
                  )}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
              {category.description}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingCategory(category);
                  setFormData({
                    name: category.name,
                    description: category.description,
                    parent_id: category.parent_id?.toString() || "",
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
                onClick={() => handleDelete(category.id)}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && !loading && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No categories found
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {searchTerm
              ? "Try adjusting your search terms."
              : "Get started by creating your first category."}
          </p>
          {!searchTerm && (
            <Button
              onClick={() => {
                setEditingCategory(null);
                setFormData({ name: "", description: "", parent_id: "" });
                setShowCreateModal(true);
              }}
              className="bg-gradient-to-r from-[#D89AA0] to-[#B48A4E] text-white hover:shadow-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 lg:p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingCategory ? "Edit Category" : "Create Category"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Press-On Nails"
                  required
                  className="mt-2 border-gray-300 focus:border-[#D89AA0] focus:ring-[#D89AA0]/20"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe this category..."
                  rows={3}
                  className="mt-2 border-gray-300 focus:border-[#D89AA0] focus:ring-[#D89AA0]/20 resize-none"
                />
              </div>
              <div>
                <Label htmlFor="parent_id">Parent Category (Optional)</Label>
                <select
                  id="parent_id"
                  value={formData.parent_id}
                  onChange={(e) =>
                    setFormData({ ...formData, parent_id: e.target.value })
                  }
                  className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 focus:border-[#D89AA0] focus:ring-[#D89AA0]/20"
                >
                  <option value="">None (Root Category)</option>
                  {categories
                    .filter((c) => c.id !== editingCategory?.id)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingCategory(null);
                    setFormData({ name: "", description: "", parent_id: "" });
                  }}
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#D89AA0] to-[#B48A4E] text-white hover:shadow-lg"
                >
                  {editingCategory ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
