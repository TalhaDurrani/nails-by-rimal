"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, X, Package } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { adminBundleService } from "@/services/admin/adminBundleService";

interface Product {
  id: string;
  title: string;
  image?: string;
}

export default function CreateBundlePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    discount_percentage: 0,
    is_active: true,
    expires_at: undefined as Date | undefined,
  });
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await adminBundleService.getAllProducts();
        setAvailableProducts(products);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products");
      }
    };
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Bundle name is required");
      return;
    }

    if (selectedProducts.length < 2) {
      toast.error("Please select at least 2 products for the bundle");
      return;
    }

    if (formData.discount_percentage < 0 || formData.discount_percentage > 100) {
      toast.error("Discount must be between 0 and 100");
      return;
    }

    setLoading(true);
    try {
      await adminBundleService.createBundle({
        name: formData.name,
        description: formData.description,
        discount_percentage: formData.discount_percentage,
        is_active: formData.is_active,
        expires_at: formData.expires_at ? formData.expires_at.toISOString() : undefined,
        product_ids: selectedProducts.map(p => p.id),
      });
      toast.success("Bundle created successfully");
      router.push("/admin/bundles");
    } catch (error) {
      console.error("Error creating bundle:", error);
      toast.error("Failed to create bundle");
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = (product: Product) => {
    setSelectedProducts((prev) =>
      prev.some((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product]
    );
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/admin/bundles")}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Bundle</h1>
          <p className="text-gray-500 mt-1">Create a product bundle with special discounts</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bundle Name */}
            <div className="lg:col-span-2">
              <Label htmlFor="name" className="text-gray-900 font-medium">
                Bundle Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Summer Collection Bundle"
                required
                className="mt-2 border-gray-300 focus:border-[#D89AA0] focus:ring-[#D89AA0]/20"
              />
            </div>

            {/* Description */}
            <div className="lg:col-span-2">
              <Label htmlFor="description" className="text-gray-900 font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe this bundle and its benefits..."
                rows={3}
                className="mt-2 border-gray-300 focus:border-[#D89AA0] focus:ring-[#D89AA0]/20 resize-none"
              />
            </div>

            {/* Discount Percentage */}
            <div>
              <Label htmlFor="discount" className="text-gray-900 font-medium">
                Discount Percentage *
              </Label>
              <div className="flex items-center gap-3 mt-2">
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount_percentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discount_percentage: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-32 border-gray-300 focus:border-[#D89AA0] focus:ring-[#D89AA0]/20"
                  required
                />
                <span className="text-sm text-gray-600">%</span>
                {formData.discount_percentage > 0 && (
                  <span className="text-xs bg-[#F4DAD3] text-[#BE7681] px-2 py-1 rounded-full">
                    Save {formData.discount_percentage}%
                  </span>
                )}
              </div>
            </div>

            {/* Expiration Date */}
            <div>
              <Label htmlFor="expires_at" className="text-gray-900 font-medium">
                Expiration Date (Optional)
              </Label>
              <Input
                id="expires_at"
                type="date"
                value={formData.expires_at ? format(formData.expires_at, "yyyy-MM-dd") : ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    expires_at: e.target.value ? new Date(e.target.value) : undefined,
                  })
                }
                className="mt-2 border-gray-300 focus:border-[#D89AA0] focus:ring-[#D89AA0]/20"
              />
            </div>

            {/* Active Status */}
            <div className="lg:col-span-2 flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="h-4 w-4 accent-[#BE7681]"
              />
              <Label htmlFor="active" className="cursor-pointer text-gray-900">
                Active (visible to customers)
              </Label>
            </div>

            {/* Product Selection */}
            <div className="lg:col-span-2 space-y-4">
              <Label className="text-gray-900 font-medium">Products in Bundle *</Label>
              
              {/* Selected Products */}
              {selectedProducts.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-[#F4DAD3]/30 rounded-lg border border-[#F4DAD3]">
                  {selectedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 text-sm border border-gray-200 shadow-sm"
                    >
                      <span className="text-gray-900">{product.title}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 hover:bg-gray-100 text-gray-600"
                        onClick={() => removeProduct(product.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Available Products */}
              <div className="border border-gray-200 rounded-lg p-4 max-h-48 overflow-y-auto bg-white">
                <p className="text-sm text-gray-600 mb-3 font-medium">Available Products:</p>
                <div className="space-y-2">
                  {availableProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      onClick={() => toggleProduct(product)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedProducts.some((p) => p.id === product.id)}
                        onChange={() => {}}
                        className="h-4 w-4 accent-[#BE7681]"
                      />
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="flex-1 text-sm text-gray-900">{product.title}</span>
                      {selectedProducts.some((p) => p.id === product.id) && (
                        <span className="text-xs text-[#BE7681]">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/bundles")}
              disabled={loading}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-[#D89AA0] to-[#B48A4E] text-white hover:shadow-lg"
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Creating..." : "Create Bundle"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
