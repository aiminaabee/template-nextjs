import { HttpTypes } from "@aiminaabeejs/types";
import { retrieveProduct } from "@lib/data/products";
import ProductActions from "@modules/products/components/product-actions";

/**
 * Fetches real time pricing for a product and renders the product actions component.
 */
export default async function ProductActionsWrapper({
  storeCode,
  id,
  region,
}: {
  storeCode: string;
  id: string;
  region: HttpTypes.StoreRegion | null;
}) {
  const product = await retrieveProduct({
    storeCode,
    productId: id,
    ...(region?.id ? { regionId: region.id } : {}),
  });

  if (!product) {
    return null;
  }

  return (
    <ProductActions
      storeCode={storeCode}
      product={product}
      region={region ?? undefined}
    />
  );
}
