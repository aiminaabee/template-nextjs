import { Metadata } from "next";
import { notFound } from "next/navigation";

import { StoreCollection, StoreRegion } from "@aiminaabeejs/types";
import { getCollectionByHandle, listCollections } from "@lib/data/collections";
import { listRegions } from "@lib/data/regions";
import { getStoreCode } from "@lib/store-code";
import CollectionTemplate from "@modules/collections/templates";
import { SortOptions } from "@modules/store/components/refinement-list/sort-products";

type Props = {
  params: Promise<{ handle: string; countryCode: string }>;
  searchParams: Promise<{
    page?: string;
    sortBy?: SortOptions;
  }>;
};

export const PRODUCT_LIMIT = 12;

export async function generateStaticParams() {
  const storeCode = getStoreCode();

  const { collections } = await listCollections(storeCode, {
    fields: "*products",
  });

  if (!collections) {
    return [];
  }

  const countryCodes = await listRegions(storeCode).then(
    (regions: StoreRegion[]) =>
      regions
        ?.map((r) => r.countries?.map((c) => c.iso_2))
        .flat()
        .filter(Boolean) as string[]
  );

  const collectionHandles = collections.map(
    (collection: StoreCollection) => collection.handle
  );

  const staticParams = countryCodes
    ?.map((countryCode: string) =>
      collectionHandles.map((handle: string | undefined) => ({
        countryCode,
        handle,
      }))
    )
    .flat();

  return staticParams;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const collection = await getCollectionByHandle(
    getStoreCode(),
    params.handle
  );

  if (!collection) {
    notFound();
  }

  const metadata = {
    title: `${collection.title} | Aiminaabee Store`,
    description: `${collection.title} collection`,
  } as Metadata;

  return metadata;
}

export default async function CollectionPage(props: Props) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const { sortBy, page } = searchParams;
  const storeCode = getStoreCode();

  const collection = await getCollectionByHandle(
    storeCode,
    params.handle
  ).then((collection: StoreCollection) => collection);

  if (!collection) {
    notFound();
  }

  return (
    <CollectionTemplate
      storeCode={storeCode}
      collection={collection}
      page={page}
      sortBy={sortBy}
      countryCode={params.countryCode}
    />
  );
}
