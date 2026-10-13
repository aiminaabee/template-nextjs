import { retrieveOrder } from "@lib/data/orders";
import { getStoreCode } from "@lib/store-code";
import OrderDetailsTemplate from "@modules/order/templates/order-details-template";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const order = await retrieveOrder(getStoreCode(), params.id).catch(
    () => null
  );

  if (!order) {
    notFound();
  }

  return {
    title: `Order #${order.display_id}`,
    description: `View your order`,
  };
}

export default async function OrderDetailPage(props: Props) {
  const params = await props.params;
  const order = await retrieveOrder(getStoreCode(), params.id).catch(
    () => null
  );

  if (!order) {
    notFound();
  }

  return <OrderDetailsTemplate order={order} />;
}
