import { Metadata } from "next";

import { getStoreCode } from "@lib/store-code";
import { SortOptions } from "@modules/store/components/refinement-list/sort-products";
import StoreTemplate from "@modules/store/templates";

export const metadata: Metadata = {
  title: "Store",
  description: "Explore all of our products.",
};

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions;
    page?: string;
  }>;
  params: Promise<{
    countryCode: string;
  }>;
};

export default async function StorePage(props: Params) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { sortBy, page } = searchParams;
  const storeCode = getStoreCode();

  return (
    <StoreTemplate
      storeCode={storeCode}
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
    />
  );
}
