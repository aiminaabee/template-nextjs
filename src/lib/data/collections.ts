"use server";

import { HttpTypes } from "@aiminaabeejs/types";
import { sdk } from "@lib/config";

export const retrieveCollection = async (
  storeCode: string,
  id: string
): Promise<HttpTypes.StoreCollection> => {
  const { collection }: HttpTypes.StoreCollectionResponse =
    await sdk.store.collection.retrieve(storeCode, id);

  return collection;
};

export const listCollections = async (
  storeCode: string,
  queryParams: HttpTypes.FindParams & HttpTypes.StoreCollectionFilters = {}
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> => {
  const query: HttpTypes.FindParams & HttpTypes.StoreCollectionFilters = {
    limit: queryParams.limit ?? 100,
    offset: queryParams.offset ?? 0,
    ...queryParams,
  };

  const { collections, count }: HttpTypes.StoreCollectionListResponse =
    await sdk.store.collection.list(storeCode, query);

  return {
    collections,
    count: count ?? collections.length,
  };
};

export const getCollectionByHandle = async (
  storeCode: string,
  handle: string
): Promise<HttpTypes.StoreCollection> => {
  const { collections }: HttpTypes.StoreCollectionListResponse =
    await sdk.store.collection.list(storeCode, {
      handle,
      fields: "*products",
    });

  return collections[0];
};
