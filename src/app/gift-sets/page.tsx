import { Suspense } from "react";
import CategoryPage from "@/components/CategoryPage";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function GiftSetsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CategoryPage categoryName="Gift Sets" categoryId={3} />
    </Suspense>
  );
}