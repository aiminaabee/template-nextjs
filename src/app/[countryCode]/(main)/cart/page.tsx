import { retrieveCart } from "@lib/data/cart";
import { retrieveCustomer } from "@lib/data/customer";
import { getStoreCode } from "@lib/store-code";
import CartTemplate from "@modules/cart/templates";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Cart",
  description: "View your cart",
};

export default async function Cart() {
  const storeCode = getStoreCode();
  const cart = await retrieveCart(storeCode).catch((error) => {
    console.error(error);
    return notFound();
  });

  const customer = await retrieveCustomer(storeCode);

  return (
    <CartTemplate storeCode={storeCode} cart={cart} customer={customer} />
  );
}
