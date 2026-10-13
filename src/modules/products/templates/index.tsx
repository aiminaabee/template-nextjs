import React, { Suspense } from "react";

import { HttpTypes } from "@aiminaabeejs/types";
import ImageGallery from "@modules/products/components/image-gallery";
import ProductActions from "@modules/products/components/product-actions";
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta";
import ProductTabs from "@modules/products/components/product-tabs";
import RelatedProducts from "@modules/products/components/related-products";
import ProductInfo from "@modules/products/templates/product-info";
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products";
import { notFound } from "next/navigation";
import ProductActionsWrapper from "./product-actions-wrapper";

type ProductTemplateProps = {
  storeCode: string;
  product: HttpTypes.StoreProduct;
  region: HttpTypes.StoreRegion | null;
  countryCode: string;
};

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  storeCode,
  product,
  region,
  countryCode,
}) => {
  if (!product || !product.id) {
    return notFound();
  }

  return (
    <>
      <div
        className="content-container flex flex-col small:flex-row small:items-start py-6 relative"
        data-testid="product-container"
      >
        <div className="flex flex-col small:sticky small:top-48 small:py-0 small:max-w-[300px] w-full py-8 gap-y-6">
          <ProductInfo product={product} />
          <ProductTabs product={product} />
        </div>
        <div className="block w-full relative">
          <ImageGallery
            images={
              product.images?.length
                ? product.images
                : product.thumbnail
                  ? [{ id: "thumbnail", url: product.thumbnail }]
                  : []
            }
          />
        </div>
        <div className="flex flex-col small:sticky small:top-48 small:py-0 small:max-w-[300px] w-full py-8 gap-y-12">
          <ProductOnboardingCta />
          <Suspense
            fallback={
              <ProductActions
                storeCode={storeCode}
                disabled={true}
                product={product}
                region={region ?? undefined}
              />
            }
          >
            <ProductActionsWrapper
              storeCode={storeCode}
              id={product.id}
              region={region}
            />
          </Suspense>
        </div>
      </div>
      <div
        className="content-container my-16 small:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts
            storeCode={storeCode}
            product={product}
            countryCode={countryCode}
          />
        </Suspense>
      </div>
    </>
  );
};

export default ProductTemplate;
