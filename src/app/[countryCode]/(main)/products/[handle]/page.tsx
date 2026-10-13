import { listProducts, retrieveProduct } from "@lib/data/products";
import { getRegion, listRegions } from "@lib/data/regions";
import { getStoreCode } from "@lib/store-code";
import ProductTemplate from "@modules/products/templates";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ countryCode: string; handle: string }>;
};

export async function generateStaticParams() {
  try {
    const storeCode = getStoreCode();
    const countryCodes = await listRegions(storeCode).then((regions) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
    );

    if (!countryCodes) {
      return [];
    }

    const promises = countryCodes.map(async (country) => {
      const { response } = await listProducts({
        storeCode,
        countryCode: country,
        queryParams: { limit: 100, fields: "handle" },
      });

      return {
        country,
        products: response.products,
      };
    });

    const countryProducts = await Promise.all(promises);

    return countryProducts
      .flatMap((countryData) =>
        countryData.products.map((product) => ({
          countryCode: countryData.country,
          handle: product.handle,
        }))
      )
      .filter((param) => param.handle);
  } catch (error) {
    console.error(
      `Failed to generate static paths for product pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }.`
    );
    return [];
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { handle, countryCode } = params;
  const storeCode = getStoreCode();

  const product = await listProducts({
    storeCode,
    countryCode,
    queryParams: { handle, limit: 1, fields: "id,title,handle,thumbnail" },
  }).then(({ response }) => response.products[0]);

  if (!product) {
    notFound();
  }

  return {
    title: `${product.title} | Aiminaabee Store`,
    description: `${product.title}`,
    openGraph: {
      title: `${product.title} | Aiminaabee Store`,
      description: `${product.title}`,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  };
}

export default async function ProductPage(props: Props) {
  const params = await props.params;
  const storeCode = getStoreCode();
  const region =
    (await getRegion(storeCode, params.countryCode)) ?? null;

  const listed = await listProducts({
    storeCode,
    countryCode: params.countryCode,
    queryParams: { handle: params.handle, limit: 1, fields: "id" },
  }).then(({ response }) => response.products[0]);

  if (!listed?.id) {
    notFound();
  }

  const pricedProduct = await retrieveProduct({
    storeCode,
    productId: listed.id,
    ...(region?.id ? { regionId: region.id } : {}),
    countryCode: params.countryCode,
  });

  if (!pricedProduct) {
    notFound();
  }

  return (
    <ProductTemplate
      storeCode={storeCode}
      product={pricedProduct}
      region={region}
      countryCode={params.countryCode}
    />
  );
}
