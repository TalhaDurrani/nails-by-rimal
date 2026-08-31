import ShopClient from './ShopClient';
import { getProductsServer } from '@/services/product/getProductsServer';

export const revalidate = 60;

export default async function ShopPage() {
  const products = await getProductsServer();
  return <ShopClient initialProducts={products} />;
}
