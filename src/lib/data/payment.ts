"use server";

import { HttpTypes } from "@aiminaabeejs/types";
import { sdk } from "@lib/config";
import { getAuthHeaders } from "./cookies";

export const listCartPaymentMethods = async (
  storeCode: string,
  regionId: string
): Promise<HttpTypes.StorePaymentProvider[]> => {
  const headers = {
    ...(await getAuthHeaders()),
  };

  return sdk.store.payment
    .listPaymentProviders(
      storeCode,
      { region_id: regionId },
      headers
    )
    .then(({ payment_providers }: HttpTypes.StorePaymentProviderListResponse) =>
      payment_providers.sort((a, b) => {
        return a.id > b.id ? 1 : -1;
      })
    )
    .catch(() => {
      return [];
    });
};
