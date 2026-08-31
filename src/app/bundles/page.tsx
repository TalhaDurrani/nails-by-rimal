import { getStoreBundles } from '@/services/storefront/storefrontOptions';
import BundlesClient from './BundlesClient';

export const revalidate = 60;

export default async function BundlesPage() {
  const bundles = await getStoreBundles();
  return <BundlesClient bundles={bundles} />;
}
