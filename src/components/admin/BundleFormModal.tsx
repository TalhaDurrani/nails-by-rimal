"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  adminBundleService,
  type UpdateBundleData,
} from "@/services/admin/adminBundleService";

interface Product {
  id: string;
  title: string;
  image?: string;
}

interface Bundle {
  id: string;
  name: string;
  description: string;
  discount_percentage: number;
  products: Product[];
  is_active: boolean;
  created_at: string;
  expires_at?: string;
}

interface BundleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateBundleData) => void;
  title: string;
  bundle?: Bundle | null;
}

export function BundleFormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  bundle,
}: BundleFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    discount_percentage: 0,
    is_active: true,
    expires_at: undefined as Date | undefined,
  });
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (bundle) {
      setFormData({
        name: bundle.name,
        description: bundle.description,
        discount_percentage: bundle.discount_percentage,
        is_active: bundle.is_active,
        expires_at: bundle.expires_at ? new Date(bundle.expires_at) : undefined,
      });
      setSelectedProducts(bundle.products);
    } else {
      setFormData({
        name: "",
        description: "",
        discount_percentage: 0,
        is_active: true,
        expires_at: undefined,
      });
      setSelectedProducts([]);
    }
  }, [bundle, isOpen]);

  useEffect(() => {
    let active = true;
    adminBundleService.getAllProducts().then((products) => {
      if (active) setAvailableProducts(products);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
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

    onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim(),
      discount_percentage: formData.discount_percentage,
      is_active: formData.is_active,
      expires_at: formData.expires_at?.toISOString(),
      product_ids: selectedProducts.map((product) => product.id),
    });
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#FFFDFB] border-[#B48A4E]/20">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-semibold text-[#2E2624]">{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Bundle Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[#2E2624] font-medium">Bundle Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Summer Collection Bundle"
              required
              className="border-[#B48A4E]/30 focus:border-[#BE7681] focus:ring-[#BE7681]/20"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-[#2E2624] font-medium">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe this bundle and its benefits..."
              rows={3}
              className="border-[#B48A4E]/30 focus:border-[#BE7681] focus:ring-[#BE7681]/20 resize-none"
            />
          </div>

          {/* Discount Percentage */}
          <div className="space-y-2">
            <Label htmlFor="discount" className="text-[#2E2624] font-medium">Discount Percentage *</Label>
            <div className="flex items-center gap-3">
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
                className="w-32 border-[#B48A4E]/30 focus:border-[#BE7681] focus:ring-[#BE7681]/20"
                required
              />
              <span className="text-sm text-[#7A6C68]">%</span>
              {formData.discount_percentage > 0 && (
                <span className="text-xs bg-[#F4DAD3] text-[#BE7681] px-2 py-1 rounded-full">
                  Save {formData.discount_percentage}%
                </span>
              )}
            </div>
          </div>

          {/* Expiration Date */}
          <div className="space-y-2">
            <Label htmlFor="expires_at" className="text-[#2E2624] font-medium">Expiration Date (Optional)</Label>
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
              className="border-[#B48A4E]/30 focus:border-[#BE7681] focus:ring-[#BE7681]/20"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-3 p-3 bg-[#F4DAD3]/20 rounded-lg">
            <input
              type="checkbox"
              id="active"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData({ ...formData, is_active: e.target.checked })
              }
              className="h-4 w-4 accent-[#BE7681]"
            />
            <Label htmlFor="active" className="cursor-pointer text-[#2E2624]">
              Active (visible to customers)
            </Label>
          </div>

          {/* Product Selection */}
          <div className="space-y-4">
            <Label className="text-[#2E2624] font-medium">Products in Bundle *</Label>
            
            {/* Selected Products */}
            {selectedProducts.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-[#F4DAD3]/30 rounded-lg border border-[#F4DAD3]">
                {selectedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 text-sm border border-[#B48A4E]/20 shadow-sm"
                  >
                    <span className="text-[#2E2624]">{product.title}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 hover:bg-[#F4DAD3] text-[#BE7681]"
                      onClick={() => removeProduct(product.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Available Products */}
            <div className="border border-[#B48A4E]/20 rounded-lg p-4 max-h-48 overflow-y-auto bg-white">
              <p className="text-sm text-[#7A6C68] mb-3 font-medium">Available Products:</p>
              <div className="space-y-2">
                {availableProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-3 hover:bg-[#F4DAD3]/30 rounded-lg cursor-pointer transition-colors"
                    onClick={() => toggleProduct(product)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedProducts.some((p) => p.id === product.id)}
                      onChange={() => {}}
                      className="h-4 w-4 accent-[#BE7681]"
                    />
                    <span className="flex-1 text-sm text-[#2E2624]">{product.title}</span>
                    {selectedProducts.some((p) => p.id === product.id) && (
                      <span className="text-xs text-[#BE7681]">✓</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border-[#B48A4E]/30 text-[#2E2624] hover:bg-[#F4DAD3]/30"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-[#BE7681] to-[#B48A4E] text-white hover:shadow-lg hover:from-[#D89AA0] hover:to-[#C7A25F] transition-all duration-300"
            >
              {bundle ? "Update Bundle" : "Create Bundle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
