"use server";

import { HttpTypes } from "@aiminaabeejs/types";
import { sdk } from "@lib/config";
import aiminaabeeError from "@lib/util/aiminaabee-error";
import { getAuthHeaders } from "./cookies";

export const retrieveOrder = async (
  storeCode: string,
  id: string
): Promise<HttpTypes.StoreOrder | null> => {
  const headers = {
    ...(await getAuthHeaders()),
  };

  return sdk.store.order
    .retrieve(
      storeCode,
      id,
      {
        fields:
          "*payment_collections.payments,*items,*items.metadata,*items.variant,*items.product,*shipping_address,*billing_address,*fulfillments,+subtotal,+discount_total,+shipping_total,+tax_total,+total",
      },
      headers
    )
    .then(({ order }: HttpTypes.StoreOrderResponse) => order)
    .catch(() => null);
};

export const listOrders = async (
  storeCode: string,
  limit: number = 10,
  offset: number = 0,
  filters?: HttpTypes.StoreOrderFilters
): Promise<HttpTypes.StoreOrder[]> => {
  const headers = {
    ...(await getAuthHeaders()),
  };

  const query: HttpTypes.StoreOrderFilters = {
    limit,
    offset,
    order: "-created_at",
    fields: "*items,+items.metadata,*items.variant,*items.product",
    ...filters,
  };

  return sdk.store.order
    .list(storeCode, query, headers)
    .then(({ orders }: HttpTypes.StoreOrderListResponse) => orders)
    .catch((err: unknown) => aiminaabeeError(err));
};

type TransferResult = {
  success: boolean;
  error: string | null;
  order: HttpTypes.StoreOrder | null;
};

export const createTransferRequest = async (
  storeCode: string,
  _state: TransferResult,
  formData: FormData
): Promise<TransferResult> => {
  const id = formData.get("order_id") as string;

  if (!id) {
    return { success: false, error: "Order ID is required", order: null };
  }

  const headers = await getAuthHeaders();

  return sdk.store.order
    .requestTransfer(
      storeCode,
      id,
      {},
      {
        fields: "id, email",
      },
      headers
    )
    .then(({ order }: HttpTypes.StoreOrderResponse) => ({
      success: true,
      error: null,
      order,
    }))
    .catch((err: Error) => ({
      success: false,
      error: err.message,
      order: null,
    }));
};

export const acceptTransferRequest = async (
  storeCode: string,
  id: string,
  token: string
): Promise<TransferResult> => {
  const headers = await getAuthHeaders();

  return sdk.store.order
    .acceptTransfer(storeCode, id, { token }, {}, headers)
    .then(({ order }: HttpTypes.StoreOrderResponse) => ({
      success: true,
      error: null,
      order,
    }))
    .catch((err: Error) => ({
      success: false,
      error: err.message,
      order: null,
    }));
};

export const declineTransferRequest = async (
  storeCode: string,
  id: string,
  token: string
): Promise<TransferResult> => {
  const headers = await getAuthHeaders();

  return sdk.store.order
    .declineTransfer(storeCode, id, { token }, {}, headers)
    .then(({ order }: HttpTypes.StoreOrderResponse) => ({
      success: true,
      error: null,
      order,
    }))
    .catch((err: Error) => ({
      success: false,
      error: err.message,
      order: null,
    }));
};
