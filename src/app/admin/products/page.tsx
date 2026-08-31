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
  AlertTriangle,
  Eye,
  X,
  ArrowUpDown,
} from "lucide-react";
import {
  adminProductService,
  ProductWithDetails,
} from "@/services/admin/adminProductService";
import { formatCurrency } from "@/utils/formatCurrency";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { DeleteConfirmModal } from "@/components/admin/DeleteConfirmModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/queries";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [deletingProduct, setDeletingProduct] =
    useState<ProductWithDetails | null>(null);

  const { data: categories } = useCategories();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await adminProductService.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteProduct = async (productId: string) => {
    try {
      await adminProductService.deleteProduct(productId);
      toast.success("Product deleted successfully");
      setDeletingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const filteredProducts = products
    .filter((product) => {
      // Search filter
      const matchesSearch =
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory =
        categoryFilter === "all" ||
        product.category_id?.toString() === categoryFilter;

      // Stock filter
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "low" && product.stock <= 10) ||
        (stockFilter === "out" && product.stock === 0) ||
        (stockFilter === "available" && product.stock > 0);

      return matchesSearch && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      // Sort logic
      let comparison = 0;

      if (sortBy === "price") {
        comparison = a.price - b.price;
      } else if (sortBy === "stock") {
        comparison = a.stock - b.stock;
      } else if (sortBy === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === "created_at") {
        comparison = a.created_at && b.created_at
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : 0;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  if (loading) {
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
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">Manage your product catalog</p>
        </div>
        <Link href="/admin/products/create">
          <Button className="bg-gradient-to-r from-[#D89AA0] to-[#B48A4E] text-white hover:shadow-lg">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search products by name, SKU, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:border-[#D89AA0] focus:ring-[#D89AA0]/20"
            />
          </div>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value || "all")}>
            <SelectTrigger className="border-gray-200 focus:border-[#D89AA0] focus:ring-[#D89AA0]/20">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Stock Filter */}
          <Select value={stockFilter} onValueChange={(value) => setStockFilter(value || "all")}>
            <SelectTrigger className="border-gray-200 focus:border-[#D89AA0] focus:ring-[#D89AA0]/20">
              <SelectValue placeholder="All Stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="available">In Stock</SelectItem>
              <SelectItem value="low">Low Stock (≤10)</SelectItem>
              <SelectItem value="out">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-600">Sort by:</span>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value || "created_at")}>
            <SelectTrigger className="w-40 border-gray-200 focus:border-[#D89AA0] focus:ring-[#D89AA0]/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Date Added</SelectItem>
              <SelectItem value="title">Name</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="stock">Stock</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="border-gray-200"
          >
            <ArrowUpDown className="w-4 h-4 mr-1" />
            {sortOrder === "asc" ? "Ascending" : "Descending"}
          </Button>
          {(searchTerm || categoryFilter !== "all" || stockFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("all");
                setStockFilter("all");
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              <X className="w-4 h-4 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.product_id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
            <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Package className="h-12 w-12 text-gray-300" />
                </div>
              )}

              {/* Stock badge */}
              <div className="absolute top-3 right-3">
                {product.stock <= 5 ? (
                  <Badge className="bg-red-500 text-white border-none">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Low Stock
                  </Badge>
                ) : (
                  <Badge className="bg-green-500 text-white border-none">
                    In Stock
                  </Badge>
                )}
              </div>
            </div>

            <div className="p-4">
              <h3 className="line-clamp-2 text-base font-semibold text-gray-900 mb-2">
                {product.title}
              </h3>
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-sm text-gray-500">
                  Stock: <span className="font-semibold text-gray-700">{product.stock}</span>
                </span>
              </div>
            </div>

            <div className="px-4 pb-4">
              <p className="text-gray-500 mb-4 line-clamp-2 text-sm">
                {product.description}
              </p>

              <div className="mb-4 space-y-1.5">
                {product.sku && (
                  <div className="text-gray-500 text-xs">
                    SKU: <span className="font-mono">{product.sku}</span>
                  </div>
                )}
                {product.category && (
                  <div className="text-gray-500 text-xs">
                    Category: <span className="font-medium text-gray-700">{product.category.name}</span>
                  </div>
                )}
                {product.total_reviews !== undefined && (
                  <div className="text-gray-500 text-xs">
                    Reviews: {product.total_reviews}
                    {product.average_rating
                      ? ` (${product.average_rating}★)`
                      : ""}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Link href={`/products/${product.product_id}`} className="flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <Eye className="mr-2 h-3 w-3" />
                    View
                  </Button>
                </Link>
                <Link
                  href={`/admin/products/${product.product_id}/edit`}
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <Edit className="mr-2 h-3 w-3" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeletingProduct(product)}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && !loading && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {searchTerm
              ? "Try adjusting your search terms."
              : "Get started by adding your first product."}
          </p>
          {!searchTerm && (
            <Link href="/admin/products/create">
              <Button className="bg-gradient-to-r from-[#D89AA0] to-[#B48A4E] text-white hover:shadow-lg">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </Link>
          )}
        </div>
      )}

      <DeleteConfirmModal
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={() => handleDeleteProduct(deletingProduct!.product_id)}
        title="Delete Product"
        description={`Are you sure you want to delete "${deletingProduct?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
