import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HttpTypes } from "@aiminaabeejs/types";
import { getProductPrice } from "@lib/util/get-product-price";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import PlaceholderImage from "@modules/common/icons/placeholder-image";
import AddToCartIcon from "./add-to-cart-icon";
import PreviewPrice from "./price";

export default async function ProductPreview({
  product,
  storeCode,
}: {
  product: HttpTypes.StoreProduct;
  isFeatured?: boolean;
  region?: HttpTypes.StoreRegion;
  storeCode: string;
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  });
  const image = product.thumbnail || product.images?.[0]?.url;
  const variants = product.variants ?? [];
  const variantId = variants.length === 1 ? variants[0]?.id : null;
  const inventory = variants.reduce(
    (sum, variant) => sum + (variant.inventory_quantity ?? 0),
    0
  );
  const managesInventory = variants.some((variant) => variant.manage_inventory);
  const lowStock =
    managesInventory && inventory > 0 && inventory <= 6 ? inventory : null;
  const onSale = cheapestPrice?.price_type === "sale";

  return (
    <Card
      className="overflow-hidden shadow-none"
      data-testid="product-wrapper"
    >
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className="flex flex-col"
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
          {image ? (
            <Image
              src={image}
              alt={product.title ?? "Product"}
              className="object-cover object-center"
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <PlaceholderImage size={24} />
            </div>
          )}
          {onSale ? (
            <Badge className="absolute left-2 top-2">Sale</Badge>
          ) : null}
        </div>
        <CardHeader className="p-3">
          <CardTitle className="truncate" data-testid="product-title">
            {product.title}
          </CardTitle>
        </CardHeader>
      </LocalizedClientLink>
      <CardFooter className="flex-col items-stretch gap-2 p-3 pt-0">
        <div className="flex items-end justify-between gap-2">
          <div className="flex flex-wrap items-baseline gap-2">
            {cheapestPrice ? <PreviewPrice price={cheapestPrice} /> : null}
          </div>
          <AddToCartIcon
            storeCode={storeCode}
            variantId={variantId}
            productHandle={product.handle}
          />
        </div>
        {lowStock ? (
          <Badge variant="secondary">Only {lowStock} left</Badge>
        ) : null}
      </CardFooter>
    </Card>
  );
}
