"use server";

import { HttpTypes } from "@aiminaabeejs/types";
import { sdk } from "@lib/config";
import { getAuthHeaders } from "./cookies";

export const listCartShippingMethods = async (
  storeCode: string,
  cartId: string
): Promise<HttpTypes.StoreCartShippingOption[]> => {
  const headers = {
    ...(await getAuthHeaders()),
  };

  return sdk.store.fulfillment
    .listCartOptions(
      storeCode,
      {
        cart_id: cartId,
        fields:
          "+service_zone.fulfillment_set.type,*service_zone.fulfillment_set.location.address",
      },
      headers
    )
    .then(
      ({ shipping_options }: HttpTypes.StoreShippingOptionListResponse) =>
        shipping_options
    )
    .catch(() => {
      return [];
    });
};

export const calculatePriceForShippingOption = async (
  storeCode: string,
  optionId: string,
  cartId: string,
  data?: Record<string, unknown>
): Promise<HttpTypes.StoreCartShippingOption | null> => {
  const headers = {
    ...(await getAuthHeaders()),
  };

  const body: HttpTypes.StoreCalculateShippingOptionPrice = {
    cart_id: cartId,
    ...(data ? { data } : {}),
  };

  return sdk.store.fulfillment
    .calculate(storeCode, optionId, body, {}, headers)
    .then(
      ({ shipping_option }: HttpTypes.StoreShippingOptionResponse) =>
        shipping_option
    )
    .catch(() => null);
};
