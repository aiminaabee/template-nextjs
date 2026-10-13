import { Metadata } from "next";

import { retrieveCustomer } from "@lib/data/customer";
import { listOrders } from "@lib/data/orders";
import { getStoreCode } from "@lib/store-code";
import Overview from "@modules/account/components/overview";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Account",
  description: "Overview of your account activity.",
};

export default async function OverviewTemplate() {
  const storeCode = getStoreCode();
  const customer = await retrieveCustomer(storeCode).catch(() => null);
  const orders = (await listOrders(storeCode).catch(() => null)) || null;

  if (!customer) {
    notFound();
  }

  return <Overview customer={customer} orders={orders} />;
}
