import { notFound } from "next/navigation";
import ProductDetailsClient from "./ProductDetailsClient";
import { productServerService } from "@/services/product/productServerService";
import { getProductsServer } from "@/services/product/getProductsServer";

interface ProductDetailsPageProps {
  params: Promise<{
    productId: string;
  }>;
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const resolvedParams = await params;
  const [product, products] = await Promise.all([
    productServerService.getProductById(resolvedParams.productId),
    getProductsServer(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <ProductDetailsClient
      product={product}
      relatedProducts={products.filter((item) => item.product_id !== product.product_id).slice(0, 4)}
    />
  );
}
