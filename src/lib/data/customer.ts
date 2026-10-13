"use server";

import { HttpTypes } from "@aiminaabeejs/types";
import { sdk } from "@lib/config";
import { getStoreCode } from "@lib/store-code";
import aiminaabeeError from "@lib/util/aiminaabee-error";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import {
  getAuthHeaders,
  getCacheTag,
  getCartId,
  removeAuthToken,
  removeCartId,
  setAuthToken,
} from "./cookies";

type CustomerResult =
  | { success: true; customer: HttpTypes.StoreCustomer | null }
  | { success: false; error: string };

function authHeadersFromToken(token: string) {
  return { authorization: `Bearer ${token}` };
}

function customerErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

async function retrieveCustomerProfile(
  storeCode: string,
  headers: { authorization: string } | {}
): Promise<HttpTypes.StoreCustomer> {
  const { customer } = (await sdk.store.customer.retrieve(
    storeCode,
    {},
    headers
  )) as HttpTypes.StoreCustomerResponse;

  if (!customer) {
    throw new Error("Customer profile missing");
  }

  if (customer.addresses?.length) {
    return customer;
  }

  const listed = await sdk.store.customer
    .listAddress(storeCode, {}, headers)
    .then(
      ({ addresses = [] }: HttpTypes.StoreCustomerAddressListResponse) =>
        addresses
    )
    .catch(() => [] as HttpTypes.StoreCustomerAddress[]);

  return listed.length ? { ...customer, addresses: listed } : customer;
}

async function fetchCustomer(
  storeCode: string,
  headers: { authorization: string } | {}
) {
  try {
    return await retrieveCustomerProfile(storeCode, headers);
  } catch {
    return null;
  }
}

export const retrieveCustomer = async (
  storeCode: string
): Promise<HttpTypes.StoreCustomer | null> => {
  const headers = await getAuthHeaders();

  if (!("authorization" in headers)) {
    return null;
  }

  return fetchCustomer(storeCode, headers);
};

export const updateCustomer = async (
  storeCode: string,
  body: HttpTypes.StoreUpdateCustomer
) => {
  const headers = {
    ...(await getAuthHeaders()),
  };

  const updateRes = await sdk.store.customer
    .update(storeCode, body, {}, headers)
    .then(({ customer }: HttpTypes.StoreCustomerResponse) => customer)
    .catch(aiminaabeeError);

  const cacheTag = await getCacheTag("customers");
  revalidateTag(cacheTag);

  return updateRes;
};

export async function signup(
  storeCode: string,
  _currentState: unknown,
  formData: FormData
) {
  const password = formData.get("password") as string;
  const customerForm = {
    email: formData.get("email") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    phone: formData.get("phone") as string,
  };

  try {
    const token = await sdk.store.auth.register(storeCode, "emailpass", {
      email: customerForm.email,
      password,
      first_name: customerForm.first_name,
      last_name: customerForm.last_name,
      phone: customerForm.phone,
    });

    if (typeof token !== "string") {
      return "This sign-up method requires a redirect, which is not supported.";
    }

    await sdk.client.setToken(token);
    await setAuthToken(token);

    const customerCacheTag = await getCacheTag("customers");
    revalidateTag(customerCacheTag);

    await transferCart(storeCode).catch(() => undefined);

    return await retrieveCustomerProfile(
      storeCode,
      authHeadersFromToken(token)
    );
  } catch (error: any) {
    return error.toString();
  }
}

export async function login(
  storeCode: string,
  _currentState: unknown,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const token = await sdk.store.auth.login(storeCode, "emailpass", {
      email,
      password,
    });

    if (typeof token !== "string") {
      return "This login method requires a redirect, which is not supported.";
    }

    await sdk.client.setToken(token);
    await setAuthToken(token);

    await retrieveCustomerProfile(storeCode, authHeadersFromToken(token));

    const customerCacheTag = await getCacheTag("customers");
    revalidateTag(customerCacheTag);
  } catch (error: any) {
    return error.toString();
  }

  try {
    await transferCart(storeCode);
  } catch (error: any) {
    return error.toString();
  }
}

export async function signout(countryCode: string) {
  await sdk.client.clearToken();

  await removeAuthToken();

  const customerCacheTag = await getCacheTag("customers");
  revalidateTag(customerCacheTag);

  await removeCartId();

  const cartCacheTag = await getCacheTag("carts");
  revalidateTag(cartCacheTag);

  redirect(`/${countryCode}/account`);
}

export async function transferCart(storeCode: string) {
  const cartId = await getCartId();

  if (!cartId) {
    return;
  }

  const headers = await getAuthHeaders();

  await sdk.store.cart.transferCart(storeCode, cartId, {}, headers);

  const cartCacheTag = await getCacheTag("carts");
  revalidateTag(cartCacheTag);
}

export async function loginCustomer({
  storeCode = getStoreCode(),
  email,
  password,
}: {
  storeCode?: string;
  email: string;
  password: string;
}): Promise<CustomerResult> {
  try {
    const token = await sdk.store.auth.login(storeCode, "emailpass", {
      email,
      password,
    });

    if (typeof token !== "string") {
      return { success: false, error: "This login method requires a redirect." };
    }

    await sdk.client.setToken(token);
    await setAuthToken(token);

    let customer: HttpTypes.StoreCustomer;
    try {
      customer = await retrieveCustomerProfile(
        storeCode,
        authHeadersFromToken(token)
      );
    } catch (error: unknown) {
      await sdk.client.clearToken().catch(() => null);
      await removeAuthToken();
      return {
        success: false,
        error: customerErrorMessage(
          error,
          "Signed in, but your customer profile could not be loaded."
        ),
      };
    }

    const cacheTag = await getCacheTag("customers");
    revalidateTag(cacheTag);

    await transferCart(storeCode).catch(() => undefined);

    return { success: true, customer };
  } catch (error: unknown) {
    return { success: false, error: customerErrorMessage(error, String(error)) };
  }
}

export async function registerCustomer({
  storeCode = getStoreCode(),
  firstName,
  lastName = "",
  email,
  password,
  phone = "",
}: {
  storeCode?: string;
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<CustomerResult> {
  try {
    const token = await sdk.store.auth.register(storeCode, "emailpass", {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      phone,
    });

    if (typeof token !== "string") {
      return {
        success: false,
        error: "This sign-up method requires a redirect.",
      };
    }

    await sdk.client.setToken(token);
    await setAuthToken(token);

    let customer: HttpTypes.StoreCustomer;
    try {
      customer = await retrieveCustomerProfile(
        storeCode,
        authHeadersFromToken(token)
      );
    } catch (error: unknown) {
      await sdk.client.clearToken().catch(() => null);
      await removeAuthToken();
      return {
        success: false,
        error: customerErrorMessage(
          error,
          "Account created, but your profile could not be loaded."
        ),
      };
    }

    const cacheTag = await getCacheTag("customers");
    revalidateTag(cacheTag);

    await transferCart(storeCode).catch(() => undefined);

    return { success: true, customer };
  } catch (error: unknown) {
    return { success: false, error: customerErrorMessage(error, String(error)) };
  }
}

export async function signOutCustomer() {
  await sdk.client.clearToken().catch(() => null);
  await removeAuthToken();
  await removeCartId();

  const customerCacheTag = await getCacheTag("customers");
  revalidateTag(customerCacheTag);

  const cartCacheTag = await getCacheTag("carts");
  revalidateTag(cartCacheTag);

  return { success: true };
}

export const addCustomerAddress = async (
  storeCode: string,
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<{ success: boolean; error: string | null }> => {
  const isDefaultBilling = (currentState.isDefaultBilling as boolean) || false;
  const isDefaultShipping =
    (currentState.isDefaultShipping as boolean) || false;

  const address: HttpTypes.StoreCreateCustomerAddress = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
    phone: formData.get("phone") as string,
    is_default_billing: isDefaultBilling,
    is_default_shipping: isDefaultShipping,
  };

  const headers = {
    ...(await getAuthHeaders()),
  };

  return sdk.store.customer
    .createAddress(storeCode, address, {}, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers");
      revalidateTag(customerCacheTag);
      return { success: true, error: null };
    })
    .catch((err: Error) => {
      return { success: false, error: err.toString() };
    });
};

export const deleteCustomerAddress = async (
  storeCode: string,
  addressId: string
): Promise<void> => {
  const headers = {
    ...(await getAuthHeaders()),
  };

  await sdk.store.customer
    .deleteAddress(storeCode, addressId, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers");
      revalidateTag(customerCacheTag);
    })
    .catch(aiminaabeeError);
};

export const updateCustomerAddress = async (
  storeCode: string,
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<{ success: boolean; error: string | null }> => {
  const addressId =
    (currentState.addressId as string) || (formData.get("addressId") as string);

  if (!addressId) {
    return { success: false, error: "Address ID is required" };
  }

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
  } as HttpTypes.StoreUpdateCustomerAddress;

  const phone = formData.get("phone") as string;

  if (phone) {
    address.phone = phone;
  }

  const headers = {
    ...(await getAuthHeaders()),
  };

  return sdk.store.customer
    .updateAddress(storeCode, addressId, address, {}, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers");
      revalidateTag(customerCacheTag);
      return { success: true, error: null };
    })
    .catch((err: Error) => {
      return { success: false, error: err.toString() };
    });
};
