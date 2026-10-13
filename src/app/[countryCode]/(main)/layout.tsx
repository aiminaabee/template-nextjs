import { Metadata } from "next";

import { retrieveCart } from "@lib/data/cart";
import { retrieveCustomer } from "@lib/data/customer";
import { getStoreCode } from "@lib/store-code";
import { getBaseURL } from "@lib/util/env";
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner";
import Footer from "@modules/layout/templates/footer";
import Nav from "@modules/layout/templates/nav";

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
};

export default async function PageLayout(props: {
  children: React.ReactNode;
  params: Promise<{ countryCode: string }>;
}) {
  const storeCode = getStoreCode();
  const customer = await retrieveCustomer(storeCode);
  const cart = await retrieveCart(storeCode);

  return (
    <>
      <Nav storeCode={storeCode} customer={customer} />
      {customer && cart && (
        <CartMismatchBanner customer={customer} cart={cart} />
      )}

      {props.children}
      <Footer storeCode={storeCode} />
    </>
  );
}
