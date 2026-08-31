import HomeClient from './HomeClient';
import { getProductsServer } from '@/services/product/getProductsServer';

export const revalidate = 60;

export default async function HomePage() {
  const products = await getProductsServer();
  return <HomeClient products={products} />;
}
