import { Metadata } from "next";
import { Suspense } from "react";

import { listCategoryNav } from "@lib/data/categories";
import { getStoreCode } from "@lib/store-code";
import BrowseToolbar from "@modules/home/components/browse-toolbar";
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid";
import { SortOptions } from "@modules/store/components/refinement-list/sort-products";
import PaginatedProducts from "@modules/store/templates/paginated-products";

export const metadata: Metadata = {
  title: "Store",
  description: "Shop products in this Aiminaabee storefront.",
};

export default async function Home(props: {
  params: Promise<{ countryCode: string }>;
  searchParams: Promise<{
    q?: string;
    sortBy?: SortOptions;
    page?: string;
    category?: string;
  }>;
}) {
  const { countryCode } = await props.params;
  const searchParams = await props.searchParams;
  const storeCode = getStoreCode();
  const categories = await listCategoryNav(storeCode).catch(() => []);
  const sortBy = searchParams.sortBy || "created_at";
  const page = searchParams.page ? parseInt(searchParams.page) : 1;

  return (
    <div className="content-container flex flex-col gap-4 py-6">
      <BrowseToolbar categories={categories} sortBy={sortBy} />
      <Suspense fallback={<SkeletonProductGrid numberOfProducts={10} />}>
        <PaginatedProducts
          storeCode={storeCode}
          sortBy={sortBy}
          page={page}
          countryCode={countryCode}
          categoryId={searchParams.category}
          q={searchParams.q}
        />
      </Suspense>
    </div>
  );
}
