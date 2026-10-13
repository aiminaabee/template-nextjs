import { listProductsWithSort } from "@lib/data/products";
import { getRegion } from "@lib/data/regions";
import ProductPreview from "@modules/products/components/product-preview";
import { Pagination } from "@modules/store/components/pagination";
import { SortOptions } from "@modules/store/components/refinement-list/sort-products";

const PRODUCT_LIMIT = 20;

type PaginatedProductsParams = {
  limit: number;
  collection_id?: string[];
  category_id?: string[];
  id?: string[];
  order?: string;
  q?: string;
};

export default async function PaginatedProducts({
  storeCode,
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
  q,
}: {
  storeCode: string;
  sortBy?: SortOptions;
  page: number;
  collectionId?: string;
  categoryId?: string;
  productsIds?: string[];
  countryCode: string;
  q?: string;
}) {
  const queryParams: PaginatedProductsParams = {
    limit: PRODUCT_LIMIT,
  };

  if (collectionId) {
    queryParams["collection_id"] = [collectionId];
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId];
  }

  if (productsIds) {
    queryParams["id"] = productsIds;
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at";
  }

  if (q) {
    queryParams.q = q;
  }

  const region = await getRegion(storeCode, countryCode);

  let {
    response: { products, count },
  } = await listProductsWithSort({
    storeCode,
    page,
    queryParams,
    sortBy,
    countryCode,
    regionId: region?.id,
  });

  const totalPages = Math.ceil(count / PRODUCT_LIMIT);

  if (!products.length) {
    return (
      <p className="text-muted-foreground" data-testid="products-empty">
        No products found.
      </p>
    );
  }

  return (
    <>
      <ul
        className="grid w-full grid-cols-2 gap-3 xsmall:grid-cols-3 small:grid-cols-4 medium:grid-cols-5"
        data-testid="products-list"
      >
        {products.map((p) => {
          return (
            <li key={p.id}>
              <ProductPreview
                product={p}
                region={region ?? undefined}
                storeCode={storeCode}
              />
            </li>
          );
        })}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  );
}
