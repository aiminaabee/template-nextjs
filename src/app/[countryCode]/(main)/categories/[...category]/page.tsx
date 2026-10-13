import { Metadata } from "next";
import { notFound } from "next/navigation";

import { StoreRegion } from "@aiminaabeejs/types";
import { getCategoryByHandle, listCategories } from "@lib/data/categories";
import { listRegions } from "@lib/data/regions";
import { getStoreCode } from "@lib/store-code";
import CategoryTemplate from "@modules/categories/templates";
import { SortOptions } from "@modules/store/components/refinement-list/sort-products";

type Props = {
  params: Promise<{
    category: string[];
    countryCode: string;
  }>;
  searchParams: Promise<{
    sortBy?: SortOptions;
    page?: string;
  }>;
};

export async function generateStaticParams() {
  const storeCode = getStoreCode();
  const product_categories = await listCategories(storeCode);

  if (!product_categories) {
    return [];
  }

  const countryCodes = await listRegions(storeCode).then(
    (regions: StoreRegion[]) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
  );

  const categoryHandles = product_categories.map(
    (category: any) => category.handle
  );

  const staticParams = countryCodes
    ?.map((countryCode: string | undefined) =>
      categoryHandles.map((handle: any) => ({
        countryCode,
        category: [handle],
      }))
    )
    .flat();

  return staticParams;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  try {
    const productCategory = await getCategoryByHandle(
      getStoreCode(),
      params.category
    );

    const title = productCategory.name + " | Aiminaabee Store";

    const description = productCategory.description ?? `${title} category.`;

    return {
      title: `${title} | Aiminaabee Store`,
      description,
      alternates: {
        canonical: `${params.category.join("/")}`,
      },
    };
  } catch (error) {
    notFound();
  }
}

export default async function CategoryPage(props: Props) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const { sortBy, page } = searchParams;
  const storeCode = getStoreCode();

  const productCategory = await getCategoryByHandle(
    storeCode,
    params.category
  );

  if (!productCategory) {
    notFound();
  }

  return (
    <CategoryTemplate
      storeCode={storeCode}
      category={productCategory}
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
    />
  );
}
