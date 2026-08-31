"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Upload, X, Plus, Trash2, Layers, Ruler, Palette } from "lucide-react";
import {
  CreateProductData,
} from "@/services/admin/adminProductService";
import { useCategories } from "@/hooks/queries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminProductService } from "@/services/admin/adminProductService";
import { toast } from "sonner";

interface ProductImage {
  url: string;
  file?: File;
  alt_text?: string;
}

interface ProductVariant {
  id?: number;
  shape_id: number;
  length_id: number;
  finish_id: number;
  stock_quantity: number;
  price_override?: number;
  sku?: string;
}

interface FormData {
  title: string;
  description: string;
  price: string;
  stock: string;
  sku: string;
  category_id: string;
  images: ProductImage[];
  selectedShapes: number[];
  selectedLengths: number[];
  selectedFinishes: number[];
  variants: ProductVariant[];
}

export default function CreateProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    price: "",
    stock: "",
    sku: "",
    category_id: "no-category",
    images: [],
    selectedShapes: [],
    selectedLengths: [],
    selectedFinishes: [],
    variants: [],
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [shapes, setShapes] = useState<Array<{ id: number; name: string }>>([]);
  const [lengths, setLengths] = useState<Array<{ id: number; name: string }>>([]);
  const [finishes, setFinishes] = useState<Array<{ id: number; name: string; swatch_hex: string | null }>>([]);

  useEffect(() => {
    // Fetch variant options
    const fetchVariantOptions = async () => {
      try {
        const [shapesData, lengthsData, finishesData] = await Promise.all([
          adminProductService.getShapes(),
          adminProductService.getLengths(),
          adminProductService.getFinishes(),
        ]);
        setShapes(shapesData);
        setLengths(lengthsData);
        setFinishes(finishesData);
      } catch (error) {
        console.error("Error fetching variant options:", error);
      }
    };
    fetchVariantOptions();
  }, []);

  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useCategories();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.price.trim()) {
      newErrors.price = "Price is required";
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        newErrors.price = "Price must be a positive number";
      }
    }

    if (!formData.stock.trim()) {
      newErrors.stock = "Stock is required";
    } else {
      const stock = parseInt(formData.stock);
      if (isNaN(stock) || stock < 0) {
        newErrors.stock = "Stock must be a non-negative number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData: CreateProductData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        image: formData.images.length > 0 ? formData.images[0].url : undefined,
        stock: parseInt(formData.stock),
        sku: formData.sku.trim() || undefined,
        category_id:
          formData.category_id && formData.category_id !== "no-category"
            ? parseInt(formData.category_id)
            : undefined,
        images: formData.images.map((img, index) => ({
          url: img.url,
          file: img.file,
          alt_text: img.alt_text,
          display_order: index,
        })),
        variants: formData.variants,
      };

      await adminProductService.createProduct(submitData);
      toast.success("Product created successfully");
      router.push("/admin/products");
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const generateVariants = () => {
    const newVariants: ProductVariant[] = [];
    
    formData.selectedShapes.forEach((shapeId) => {
      formData.selectedLengths.forEach((lengthId) => {
        formData.selectedFinishes.forEach((finishId) => {
          const shape = shapes.find(s => s.id === shapeId);
          const length = lengths.find(l => l.id === lengthId);
          // Generate SKU: NBR-PRODUCT-SHAPE-LENGTH
          const sku = `NBR-${formData.title.substring(0, 3).toUpperCase()}-${shape?.name.toUpperCase()}-${length?.name.toUpperCase()}`;
          
          newVariants.push({
            shape_id: shapeId,
            length_id: lengthId,
            finish_id: finishId,
            stock_quantity: parseInt(formData.stock) || 0,
            price_override: undefined,
            sku,
          });
        });
      });
    });
    
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  const updateVariant = <K extends keyof ProductVariant>(
    index: number,
    field: K,
    value: ProductVariant[K],
  ) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) => 
        i === index ? { ...v, [field]: value } : v
      ),
    }));
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/admin/products")}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Product</h1>
          <p className="text-gray-500 mt-1">Add a new product to your catalog</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Title */}
            <div className="lg:col-span-2">
              <Label htmlFor="title" className="text-gray-900 font-medium">
                Product Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter product title"
                className={`mt-2 ${
                  errors.title
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-[#D89AA0] focus:ring-[#D89AA0]/20"
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="lg:col-span-2">
              <Label htmlFor="description" className="text-gray-900 font-medium">
                Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter product description"
                rows={4}
                className={`mt-2 resize-none ${
                  errors.description
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-[#D89AA0] focus:ring-[#D89AA0]/20"
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="price" className="text-gray-900 font-medium">
                Price (Rs) *
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="0.00"
                className={`mt-2 ${
                  errors.price
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-[#D89AA0] focus:ring-[#D89AA0]/20"
                }`}
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            {/* Stock */}
            <div>
              <Label htmlFor="stock" className="text-gray-900 font-medium">
                Stock *
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleInputChange("stock", e.target.value)}
                placeholder="0"
                className={`mt-2 ${
                  errors.stock
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-[#D89AA0] focus:ring-[#D89AA0]/20"
                }`}
              />
              {errors.stock && (
                <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
              )}
            </div>

            {/* SKU */}
            <div>
              <Label htmlFor="sku" className="text-gray-900 font-medium">
                SKU
              </Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleInputChange("sku", e.target.value)}
                placeholder="Product SKU (optional)"
                className="mt-2 border-gray-300 focus:border-[#D89AA0] focus:ring-[#D89AA0]/20"
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category" className="text-gray-900 font-medium">
                Category
              </Label>
              {categoriesError && (
                <div className="border-red-200 bg-red-50 mt-2 mb-2 space-y-2 rounded-md border p-3 text-sm">
                  <p className="text-red-600">{categoriesError.message}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => void refetchCategories()}
                  >
                    Retry categories
                  </Button>
                </div>
              )}
              <Select
                value={formData.category_id}
                onValueChange={(value) =>
                  handleInputChange("category_id", value ?? "")
                }
                disabled={categoriesLoading || !!categoriesError}
              >
                <SelectTrigger className="mt-2 border-gray-300 focus:border-[#D89AA0] focus:ring-[#D89AA0]/20">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-category">No category</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Multiple Images Upload */}
            <div className="lg:col-span-2">
              <Label className="text-gray-900 font-medium mb-2 block">
                Product Images
              </Label>
              
              {/* Image Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#D89AA0] transition-colors">
                <input
                  type="file"
                  id="image-upload"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const newImages: ProductImage[] = files.map(file => ({
                      url: URL.createObjectURL(file),
                      file,
                    }));
                    setFormData(prev => ({
                      ...prev,
                      images: [...prev.images, ...newImages],
                    }));
                  }}
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-400">
                    PNG, JPG, GIF up to 10MB each
                  </p>
                </label>
              </div>

              {/* Image Preview Grid */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img.url}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== index),
                          }));
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 bg-[#D89AA0] text-white text-xs px-2 py-1 rounded">
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* URL Input for external images */}
              <div className="mt-4 flex gap-2">
                <Input
                  placeholder="Or paste image URL"
                  className="flex-1 border-gray-300 focus:border-[#D89AA0] focus:ring-[#D89AA0]/20"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                      setFormData(prev => ({
                        ...prev,
                        images: [...prev.images, { url: (e.target as HTMLInputElement).value }],
                      }));
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    if (input.value) {
                      setFormData(prev => ({
                        ...prev,
                        images: [...prev.images, { url: input.value }],
                      }));
                      input.value = '';
                    }
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Variant Selection */}
            <div className="lg:col-span-2 space-y-4">
              <Label className="text-gray-900 font-medium">Product Variants</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Shapes */}
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">
                    <Layers className="w-4 h-4 inline mr-1" />
                    Shapes
                  </Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {shapes.map((shape) => (
                      <label key={shape.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.selectedShapes.includes(shape.id)}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              selectedShapes: e.target.checked
                                ? [...prev.selectedShapes, shape.id]
                                : prev.selectedShapes.filter(id => id !== shape.id),
                            }));
                          }}
                          className="accent-[#BE7681]"
                        />
                        <span className="text-sm">{shape.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Lengths */}
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">
                    <Ruler className="w-4 h-4 inline mr-1" />
                    Lengths
                  </Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {lengths.map((length) => (
                      <label key={length.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.selectedLengths.includes(length.id)}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              selectedLengths: e.target.checked
                                ? [...prev.selectedLengths, length.id]
                                : prev.selectedLengths.filter(id => id !== length.id),
                            }));
                          }}
                          className="accent-[#BE7681]"
                        />
                        <span className="text-sm">{length.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Finishes */}
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">
                    <Palette className="w-4 h-4 inline mr-1" />
                    Finishes
                  </Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {finishes.map((finish) => (
                      <label key={finish.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.selectedFinishes.includes(finish.id)}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              selectedFinishes: e.target.checked
                                ? [...prev.selectedFinishes, finish.id]
                                : prev.selectedFinishes.filter(id => id !== finish.id),
                            }));
                          }}
                          className="accent-[#BE7681]"
                        />
                        <div className="flex items-center gap-2">
                          {finish.swatch_hex && (
                            <div
                              className="w-4 h-4 rounded border border-gray-300"
                              style={{ backgroundColor: finish.swatch_hex }}
                            />
                          )}
                          <span className="text-sm">{finish.name}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                type="button"
                onClick={generateVariants}
                disabled={
                  formData.selectedShapes.length === 0 ||
                  formData.selectedLengths.length === 0 ||
                  formData.selectedFinishes.length === 0
                }
                className="w-full bg-gradient-to-r from-[#D89AA0] to-[#B48A4E] text-white hover:shadow-lg"
              >
                <Plus className="mr-2 h-4 w-4" />
                Generate Variants ({formData.selectedShapes.length * formData.selectedLengths.length * formData.selectedFinishes.length} combinations)
              </Button>

              {/* Generated Variants */}
              {formData.variants.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <Label className="text-sm text-gray-600 mb-3 block">
                    Generated Variants ({formData.variants.length})
                  </Label>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {formData.variants.map((variant, index) => {
                      const shape = shapes.find(s => s.id === variant.shape_id);
                      const length = lengths.find(l => l.id === variant.length_id);
                      const finish = finishes.find(f => f.id === variant.finish_id);
                      
                      return (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                              <span>{shape?.name}</span>
                              <span>×</span>
                              <span>{length?.name}</span>
                              <span>×</span>
                              <span>{finish?.name}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              SKU: {variant.sku}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="Stock"
                              value={variant.stock_quantity}
                              onChange={(e) => updateVariant(index, 'stock_quantity', parseInt(e.target.value) || 0)}
                              className="w-20 text-sm border-gray-300"
                            />
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Price"
                              value={variant.price_override || ''}
                              onChange={(e) => updateVariant(index, 'price_override', parseFloat(e.target.value) || undefined)}
                              className="w-24 text-sm border-gray-300"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeVariant(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/products")}
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
              {loading ? "Creating..." : "Create Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
