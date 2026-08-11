import { Suspense } from "react";
import CategoryPage from "@/components/CategoryPage";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function SeasonalPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CategoryPage categoryName="Seasonal Collections" categoryId={4} />
    </Suspense>
  );
}