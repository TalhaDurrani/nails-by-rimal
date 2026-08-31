"use client";

import { useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Layers, Search, Palette, Ruler, ArrowUpDown, X } from "lucide-react";
import { toast } from "sonner";
import { adminVariantService, Shape, Length, Finish } from "@/services/admin/adminVariantService";

type VariantType = "shapes" | "lengths" | "finishes";
type VariantItem = Shape | Length | Finish;

const getSwatch = (item: VariantItem) =>
  "swatch_hex" in item ? item.swatch_hex : null;

export default function AdminVariantsPage() {
  const [activeTab, setActiveTab] = useState<VariantType>("shapes");
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [lengths, setLengths] = useState<Length[]>([]);
  const [finishes, setFinishes] = useState<Finish[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<VariantItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    swatch_hex: "",
  });

  const fetchVariants = useCallback(async () => {
    try {
      setLoading(true);
      
      if (activeTab === "shapes") {
        const data = await adminVariantService.getAllShapes();
        setShapes(data);
      } else if (activeTab === "lengths") {
        const data = await adminVariantService.getAllLengths();
        setLengths(data);
      } else {
        const data = await adminVariantService.getAllFinishes();
        setFinishes(data);
      }
    } catch (error) {
      console.error("Error fetching variants:", error);
      toast.error("Failed to load variants");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        name: formData.name.trim(),
        ...(activeTab === "finishes" && { swatch_hex: formData.swatch_hex || null }),
      };

      if (editingItem) {
        if (activeTab === "shapes") {
          await adminVariantService.updateShape(editingItem.id, submitData);
        } else if (activeTab === "lengths") {
          await adminVariantService.updateLength(editingItem.id, submitData);
        } else {
          await adminVariantService.updateFinish(editingItem.id, submitData);
        }
        toast.success("Variant updated successfully");
      } else {
        if (activeTab === "shapes") {
          await adminVariantService.createShape(submitData);
        } else if (activeTab === "lengths") {
          await adminVariantService.createLength(submitData);
        } else {
          await adminVariantService.createFinish(submitData);
        }
        toast.success("Variant created successfully");
      }

      setShowCreateModal(false);
      setEditingItem(null);
      setFormData({ name: "", swatch_hex: "" });
      fetchVariants();
    } catch (error) {
      console.error("Error saving variant:", error);
      toast.error("Failed to save variant");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this variant?")) return;

    try {
      if (activeTab === "shapes") {
        await adminVariantService.deleteShape(id);
      } else if (activeTab === "lengths") {
        await adminVariantService.deleteLength(id);
      } else {
        await adminVariantService.deleteFinish(id);
      }
      toast.success("Variant deleted successfully");
      fetchVariants();
    } catch (error) {
      console.error("Error deleting variant:", error);
      toast.error("Failed to delete variant");
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      if (activeTab === "shapes") {
        await adminVariantService.toggleShapeActive(id, isActive);
      } else if (activeTab === "lengths") {
        await adminVariantService.toggleLengthActive(id, isActive);
      } else {
        await adminVariantService.toggleFinishActive(id, isActive);
      }
      toast.success(`Variant ${!isActive ? "activated" : "deactivated"}`);
      fetchVariants();
    } catch (error) {
      console.error("Error toggling variant:", error);
      toast.error("Failed to update variant");
    }
  };

  const getFilteredItems = () => {
    let items: VariantItem[];
    if (activeTab === "shapes") items = shapes;
    else if (activeTab === "lengths") items = lengths;
    else items = finishes;

    return items
      .filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (getSwatch(item)?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
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
  };

  const filteredItems = getFilteredItems();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500">Loading variants...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Variants</h1>
          <p className="text-gray-500 mt-1">Manage shapes, lengths, and finishes</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => {
            setActiveTab("shapes");
            setSearchTerm("");
          }}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "shapes"
              ? "text-[#BE7681] border-b-2 border-[#BE7681]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Layers className="w-4 h-4 inline mr-2" />
          Shapes
        </button>
        <button
          onClick={() => {
            setActiveTab("lengths");
            setSearchTerm("");
          }}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "lengths"
              ? "text-[#BE7681] border-b-2 border-[#BE7681]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Ruler className="w-4 h-4 inline mr-2" />
          Lengths
        </button>
        <button
          onClick={() => {
            setActiveTab("finishes");
            setSearchTerm("");
          }}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "finishes"
              ? "text-[#BE7681] border-b-2 border-[#BE7681]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Palette className="w-4 h-4 inline mr-2" />
          Finishes
        </button>
      </div>

      {/* Search and Sort */}
      <div className="flex gap-4">
        <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:border-[#D89AA0] focus:ring-[#D89AA0]/20"
            />
          </div>
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
        <Button
          onClick={() => {
            setEditingItem(null);
            setFormData({ name: "", swatch_hex: "" });
            setShowCreateModal(true);
          }}
          className="bg-gradient-to-r from-[#D89AA0] to-[#B48A4E] text-white hover:shadow-lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add {activeTab.slice(0, -1)}
        </Button>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {activeTab === "finishes" && getSwatch(item) ? (
                  <div
                    className="w-12 h-12 rounded-lg border-2 border-gray-200"
                    style={{ backgroundColor: getSwatch(item) || undefined }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#D89AA0]/20 to-[#B48A4E]/20 flex items-center justify-center">
                    {activeTab === "shapes" && <Layers className="w-6 h-6 text-[#B48A4E]" />}
                    {activeTab === "lengths" && <Ruler className="w-6 h-6 text-[#B48A4E]" />}
                    {activeTab === "finishes" && <Palette className="w-6 h-6 text-[#B48A4E]" />}
                  </div>
                )}
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
            </div>
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
                    swatch_hex: getSwatch(item) || "",
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
        ))}
      </div>

      {filteredItems.length === 0 && !loading && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <Layers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No {activeTab} found
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {searchTerm
              ? "Try adjusting your search terms."
              : `Get started by creating your first ${activeTab.slice(0, -1)}.`}
          </p>
          {!searchTerm && (
            <Button
              onClick={() => {
                setEditingItem(null);
                setFormData({ name: "", swatch_hex: "" });
                setShowCreateModal(true);
              }}
              className="bg-gradient-to-r from-[#D89AA0] to-[#B48A4E] text-white hover:shadow-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add {activeTab.slice(0, -1)}
            </Button>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 lg:p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingItem ? `Edit ${activeTab.slice(0, -1)}` : `Create ${activeTab.slice(0, -1)}`}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={`e.g., ${activeTab === "shapes" ? "Almond" : activeTab === "lengths" ? "Short" : "Matte Red"}`}
                  required
                  className="mt-2 border-gray-300 focus:border-[#D89AA0] focus:ring-[#D89AA0]/20"
                />
              </div>
              {activeTab === "finishes" && (
                <div>
                  <Label htmlFor="swatch_hex">Swatch Color (Hex)</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="swatch_hex"
                      type="color"
                      value={formData.swatch_hex}
                      onChange={(e) => setFormData({ ...formData, swatch_hex: e.target.value })}
                      className="w-16 h-10 p-1 border-gray-300"
                    />
                    <Input
                      type="text"
                      value={formData.swatch_hex}
                      onChange={(e) => setFormData({ ...formData, swatch_hex: e.target.value })}
                  placeholder="#FF0000"
                  className="flex-1 border-gray-300 focus:border-[#D89AA0] focus:ring-[#D89AA0]/20"
                />
                {formData.swatch_hex && (
                  <div
                    className="w-10 h-10 rounded border-2 border-gray-200"
                    style={{ backgroundColor: formData.swatch_hex }}
                  />
                )}
              </div>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingItem(null);
                    setFormData({ name: "", swatch_hex: "" });
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
