"use server";

import { HttpTypes } from "@aiminaabeejs/types";
import { sdk } from "@lib/config";

export type CategoryNavChild = {
  id: string;
  name: string;
  handle: string;
  image: string | null;
};

export type CategoryNavItem = {
  id: string;
  name: string;
  handle: string;
  image: string | null;
  children: CategoryNavChild[];
};

const categoryImage = (
  category: HttpTypes.StoreProductCategory
): string | null => {
  const meta = category.metadata as
    | Record<string, unknown>
    | null
    | undefined;
  const fromMeta = meta?.thumbnail ?? meta?.image;
  if (typeof fromMeta === "string" && fromMeta.length > 0) {
    return fromMeta;
  }

  return category.products?.[0]?.thumbnail ?? null;
};

const toNavChild = (
  category: HttpTypes.StoreProductCategory
): CategoryNavChild => ({
  id: category.id,
  name: category.name,
  handle: category.handle,
  image: categoryImage(category),
});

export const listCategories = async (
  storeCode: string,
  query?: HttpTypes.FindParams & HttpTypes.StoreProductCategoryListParams
): Promise<HttpTypes.StoreProductCategory[]> => {
  const { product_categories }: HttpTypes.StoreProductCategoryListResponse =
    await sdk.store.category.list(storeCode, {
      fields:
        "*category_children, *products, *parent_category, *parent_category.parent_category",
      limit: query?.limit || 100,
      ...query,
    });

  return product_categories;
};

export const listCategoryNav = async (
  storeCode: string
): Promise<CategoryNavItem[]> => {
  const categories = await listCategories(storeCode, {
    fields: "*category_children, *category_children.products, *products",
    include_descendants_tree: true,
    limit: 100,
  });

  const roots = categories.filter((category) => !category.parent_category_id);
  const source = roots.length > 0 ? roots : categories;

  return source.map((category) => ({
    ...toNavChild(category),
    children: (category.category_children ?? []).map(toNavChild),
  }));
};

export const getCategoryByHandle = async (
  storeCode: string,
  categoryHandle: string[]
): Promise<HttpTypes.StoreProductCategory> => {
  const handle = categoryHandle.join("/");

  const { product_categories }: HttpTypes.StoreProductCategoryListResponse =
    await sdk.store.category.list(storeCode, {
      fields: "*category_children, *products",
      handle,
    });

  return product_categories[0];
};
