import { HttpTypes } from "@aiminaabeejs/types";
import ProductRail from "@modules/home/components/featured-products/product-rail";

export default async function FeaturedProducts({
  collections,
  region,
  storeCode,
}: {
  collections: HttpTypes.StoreCollection[];
  region: HttpTypes.StoreRegion;
  storeCode: string;
}) {
  return collections.map((collection) => (
    <li key={collection.id}>
      <ProductRail
        collection={collection}
        region={region}
        storeCode={storeCode}
      />
    </li>
  ));
}
