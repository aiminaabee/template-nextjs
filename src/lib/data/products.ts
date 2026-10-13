"use server";

import { HttpTypes } from "@aiminaabeejs/types";
import { sdk } from "@lib/config";
import { sortProducts } from "@lib/util/sort-products";
import { SortOptions } from "@modules/store/components/refinement-list/sort-products";
import { getRegion } from "./regions";

const CATALOG_FIELDS =
  "id,title,handle,thumbnail,*variants,+variants.inventory_quantity,*variants.options,*options,*images,+metadata,+tags";
const PRICED_FIELDS =
  "id,title,handle,thumbnail,*variants,*variants.calculated_price,+variants.inventory_quantity,*variants.options,*options,*images,+metadata,+tags";

type ProductQueryParams = HttpTypes.StoreProductListParams;

const resolveRegionId = async ({
  storeCode,
  countryCode,
  regionId,
}: {
  storeCode: string;
  countryCode?: string;
  regionId?: string;
}): Promise<string | undefined> => {
  if (regionId) {
    return regionId;
  }

  if (countryCode) {
    const region = await getRegion(storeCode, countryCode);
    return region?.id;
  }

  return undefined;
};

const productQuery = ({
  regionId,
  countryCode,
  fields,
  ...rest
}: {
  regionId?: string;
  countryCode?: string;
  fields?: string;
} & HttpTypes.StoreProductListParams): HttpTypes.StoreProductListParams => {
  const requested = fields ?? (regionId ? PRICED_FIELDS : CATALOG_FIELDS);
  const safeFields =
    !regionId && requested.includes("calculated_price")
      ? CATALOG_FIELDS
      : requested;

  return {
    ...rest,
    ...(regionId ? { region_id: regionId } : {}),
    ...(countryCode ? { country_code: countryCode } : {}),
    fields: safeFields,
  };
};

export const listProducts = async ({
  storeCode,
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  storeCode: string;
  pageParam?: number;
  queryParams?: ProductQueryParams;
  countryCode?: string;
  regionId?: string;
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number };
  nextPage: number | null;
  queryParams?: ProductQueryParams;
}> => {
  const limit = queryParams?.limit || 12;
  const _pageParam = Math.max(pageParam, 1);
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit;
  const resolvedRegionId = await resolveRegionId({
    storeCode,
    countryCode,
    regionId,
  });
  const { fields: requestedFields, ...restQueryParams } = queryParams ?? {};

  const { products, count }: HttpTypes.StoreProductListResponse =
    await sdk.store.product.list(
      storeCode,
      productQuery({
        regionId: resolvedRegionId,
        countryCode,
        fields: requestedFields,
        limit,
        offset,
        ...restQueryParams,
      })
    );

  const nextPage = count > offset + limit ? pageParam + 1 : null;

  return {
    response: {
      products,
      count,
    },
    nextPage,
    queryParams,
  };
};

export const retrieveProduct = async ({
  storeCode,
  productId,
  countryCode,
  regionId,
  fields,
}: {
  storeCode: string;
  productId: string;
  countryCode?: string;
  regionId?: string;
  fields?: string;
}): Promise<HttpTypes.StoreProduct> => {
  const resolvedRegionId = await resolveRegionId({
    storeCode,
    countryCode,
    regionId,
  });

  try {
    const { product }: HttpTypes.StoreProductResponse =
      await sdk.store.product.retrieve(
        storeCode,
        productId,
        productQuery({
          regionId: resolvedRegionId,
          countryCode,
          fields,
        })
      );

    if (product) {
      return product;
    }
  } catch {
    // Some storefront retrieve-by-id responses 404 even when the product is listable.
  }

  const { products }: HttpTypes.StoreProductListResponse =
    await sdk.store.product.list(
      storeCode,
      productQuery({
        regionId: resolvedRegionId,
        countryCode,
        fields,
        id: [productId],
        limit: 1,
      })
    );

  const listed = products.find((product) => product.id === productId);
  if (!listed) {
    throw new Error("Product not found");
  }

  return listed;
};

/**
 * This will fetch 100 products to the Next.js cache and sort them based on the sortBy parameter.
 * It will then return the paginated products based on the page and limit parameters.
 */
export const listProductsWithSort = async ({
  storeCode,
  page = 0,
  queryParams,
  sortBy = "created_at",
  countryCode,
  regionId,
}: {
  storeCode: string;
  page?: number;
  queryParams?: ProductQueryParams;
  sortBy?: SortOptions;
  countryCode: string;
  regionId?: string;
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number };
  nextPage: number | null;
  queryParams?: ProductQueryParams;
}> => {
  const limit = queryParams?.limit || 12;

  const {
    response: { products, count },
  } = await listProducts({
    storeCode,
    pageParam: 0,
    queryParams: {
      ...queryParams,
      limit: 100,
    },
    countryCode,
    regionId,
  });

  const sortedProducts = sortProducts(products, sortBy);

  const pageParam = (page - 1) * limit;

  const nextPage = count > pageParam + limit ? pageParam + limit : null;

  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit);

  return {
    response: {
      products: paginatedProducts,
      count,
    },
    nextPage,
    queryParams,
  };
};
