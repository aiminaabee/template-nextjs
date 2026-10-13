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
  removeCartId,
  setCartId,
} from "./cookies";
import { getRegion } from "./regions";

const CART_PAGE_FIELDS =
  "*items, *region, *region.countries, *items.product, *items.variant, *items.thumbnail, *items.metadata, +items.total, *promotions, +shipping_methods.name, *shipping_address, *billing_address, subtotal, discount_total, shipping_total, shipping_subtotal, tax_total, total, currency_code";

/**
 * Retrieves a cart by its ID. If no ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to retrieve.
 * @param fields - optional - field expansion string.
 * @returns The cart object if found, or null if not found.
 */
export async function retrieveCart(
  storeCode: string,
  cartId?: string,
  fields: string = CART_PAGE_FIELDS
): Promise<HttpTypes.StoreCart | null> {
  const id = cartId || (await getCartId());

  if (!id) {
    return null;
  }

  const headers = {
    ...(await getAuthHeaders()),
  };

  return await sdk.store.cart
    .retrieve(
      storeCode,
      id,
      {
        fields,
      },
      headers
    )
    .then(async ({ cart }: HttpTypes.StoreCartResponse) => {
      if (isStaleCheckoutCart(cart)) {
        await removeCartId();
        return null;
      }

      return cart;
    })
    .catch(() => null);
}

/** Empty carts that still carry checkout shipping/payment break line-item adds on the API. */
function isStaleCheckoutCart(cart: HttpTypes.StoreCart | null) {
  if (!cart) {
    return false;
  }

  const itemCount = cart.items?.length ?? 0;
  if (itemCount > 0) {
    return false;
  }

  const hasShipping = (cart.shipping_methods?.length ?? 0) > 0;
  const paymentCollection = (cart as { payment_collection?: { id?: string } })
    .payment_collection;
  const hasCheckoutTotal = Number(cart.total) > 0;

  return hasShipping || Boolean(paymentCollection?.id) || hasCheckoutTotal;
}

function normalizeQuantity(quantity: number) {
  const safe = Math.floor(Number(quantity));
  if (!Number.isFinite(safe) || safe < 1) {
    throw new Error("Invalid quantity");
  }

  return safe;
}

export async function getOrSetCart(storeCode: string, countryCode: string) {
  const region = await getRegion(storeCode, countryCode);

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`);
  }

  let cart = await retrieveCart(storeCode);

  if (isStaleCheckoutCart(cart)) {
    await removeCartId();
    cart = null;
  }

  const headers = {
    ...(await getAuthHeaders()),
  };

  if (!cart) {
    const cartResp = await sdk.store.cart.create(
      storeCode,
      { region_id: region.id },
      {},
      headers
    );
    const createdCart = cartResp.cart;
    if (!createdCart) {
      throw new Error("Failed to create cart");
    }
    cart = createdCart;

    await setCartId(createdCart.id);

    const cartCacheTag = await getCacheTag("carts");
    revalidateTag(cartCacheTag);
  }

  if (cart && cart?.region_id !== region.id) {
    await sdk.store.cart.update(
      storeCode,
      cart.id,
      { region_id: region.id },
      {},
      headers
    );
    const cartCacheTag = await getCacheTag("carts");
    revalidateTag(cartCacheTag);
  }

  return cart;
}

export async function updateCart(
  storeCode: string,
  data: HttpTypes.StoreUpdateCart
) {
  const cartId = await getCartId();

  if (!cartId) {
    throw new Error(
      "No existing cart found, please create one before updating"
    );
  }

  const headers = {
    ...(await getAuthHeaders()),
  };

  return sdk.store.cart
    .update(storeCode, cartId, data, {}, headers)
    .then(async ({ cart }: HttpTypes.StoreCartResponse) => {
      const cartCacheTag = await getCacheTag("carts");
      revalidateTag(cartCacheTag);

      const fulfillmentCacheTag = await getCacheTag("fulfillment");
      revalidateTag(fulfillmentCacheTag);

      return cart;
    })
    .catch(aiminaabeeError);
}

export async function addToCart({
  storeCode,
  variantId,
  quantity,
  countryCode,
}: {
  storeCode: string;
  variantId: string;
  quantity: number;
  countryCode: string;
}) {
  if (!variantId) {
    throw new Error("Missing variant ID when adding to cart");
  }

  const cart = await getOrSetCart(storeCode, countryCode);

  if (!cart) {
    throw new Error("Error retrieving or creating cart");
  }

  const safeQuantity = normalizeQuantity(quantity);

  const headers = {
    ...(await getAuthHeaders()),
  };

  await sdk.store.cart
    .createLineItem(
      storeCode,
      cart.id,
      {
        variant_id: variantId,
        quantity: safeQuantity,
      },
      {},
      headers
    )
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts");
      revalidateTag(cartCacheTag);

      const fulfillmentCacheTag = await getCacheTag("fulfillment");
      revalidateTag(fulfillmentCacheTag);
    })
    .catch(aiminaabeeError);
}

export async function updateLineItem({
  storeCode,
  lineId,
  quantity,
}: {
  storeCode: string;
  lineId: string;
  quantity: number;
}) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when updating line item");
  }

  const safeQuantity = normalizeQuantity(quantity);

  const cartId = await getCartId();

  if (!cartId) {
    throw new Error("Missing cart ID when updating line item");
  }

  const headers = {
    ...(await getAuthHeaders()),
  };

  await sdk.store.cart
    .updateLineItem(
      storeCode,
      cartId,
      lineId,
      { quantity: safeQuantity },
      {},
      headers
    )
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts");
      revalidateTag(cartCacheTag);

      const fulfillmentCacheTag = await getCacheTag("fulfillment");
      revalidateTag(fulfillmentCacheTag);
    })
    .catch(aiminaabeeError);
}

export async function deleteLineItem(storeCode: string, lineId: string) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when deleting line item");
  }

  const cartId = await getCartId();

  if (!cartId) {
    throw new Error("Missing cart ID when deleting line item");
  }

  const headers = {
    ...(await getAuthHeaders()),
  };

  await sdk.store.cart
    .deleteLineItem(storeCode, cartId, lineId, headers)
    .then(async ({ parent }) => {
      if (!parent?.items?.length) {
        await removeCartId();
      }

      const cartCacheTag = await getCacheTag("carts");
      revalidateTag(cartCacheTag);

      const fulfillmentCacheTag = await getCacheTag("fulfillment");
      revalidateTag(fulfillmentCacheTag);
    })
    .catch(aiminaabeeError);
}

export async function setShippingMethod({
  storeCode,
  cartId,
  shippingMethodId,
}: {
  storeCode: string;
  cartId: string;
  shippingMethodId: string;
}) {
  const headers = {
    ...(await getAuthHeaders()),
  };

  return sdk.store.cart
    .addShippingMethod(
      storeCode,
      cartId,
      { option_id: shippingMethodId },
      {},
      headers
    )
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts");
      revalidateTag(cartCacheTag);
    })
    .catch(aiminaabeeError);
}

export async function initiatePaymentSession(
  storeCode: string,
  cart: HttpTypes.StoreCart,
  data: HttpTypes.StoreInitializePaymentSession
) {
  const headers = {
    ...(await getAuthHeaders()),
  };

  return sdk.store.payment
    .initiatePaymentSession(storeCode, cart, data, {}, headers)
    .then(async (resp: HttpTypes.StorePaymentCollectionResponse) => {
      const cartCacheTag = await getCacheTag("carts");
      revalidateTag(cartCacheTag);
      return resp;
    })
    .catch(aiminaabeeError);
}

export async function applyPromotions(storeCode: string, codes: string[]) {
  const cartId = await getCartId();

  if (!cartId) {
    throw new Error("No existing cart found");
  }

  const headers = {
    ...(await getAuthHeaders()),
  };

  return sdk.store.cart
    .update(storeCode, cartId, { promo_codes: codes }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts");
      revalidateTag(cartCacheTag);

      const fulfillmentCacheTag = await getCacheTag("fulfillment");
      revalidateTag(fulfillmentCacheTag);
    })
    .catch(aiminaabeeError);
}

export async function applyGiftCard(code: string) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, { gift_cards: [{ code }] }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function removeDiscount(code: string) {
  // const cartId = getCartId()
  // if (!cartId) return "No cartId cookie found"
  // try {
  //   await deleteDiscount(cartId, code)
  //   revalidateTag("cart")
  // } catch (error: any) {
  //   throw error
  // }
}

export async function removeGiftCard(
  codeToRemove: string,
  giftCards: any[]
  // giftCards: GiftCard[]
) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, {
  //       gift_cards: [...giftCards]
  //         .filter((gc) => gc.code !== codeToRemove)
  //         .map((gc) => ({ code: gc.code })),
  //     }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function submitPromotionForm(
  storeCode: string,
  currentState: unknown,
  formData: FormData
) {
  const code = formData.get("code") as string;
  try {
    await applyPromotions(storeCode, [code]);
  } catch (e: any) {
    return e.message;
  }
}

function isKnownCartUpdateBug(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('column "nan" does not exist') ||
    normalized.includes("column 'nan' does not exist") ||
    normalized.includes("an unknown error occurred")
  );
}

export async function setAddresses(
  storeCode: string,
  currentState: unknown,
  formData: FormData
) {
  try {
    if (!formData) {
      throw new Error("No form data found when setting addresses");
    }
    const cartId = await getCartId();
    if (!cartId) {
      throw new Error("No existing cart found when setting addresses");
    }

    const shippingAddress = addressFromForm(formData, "shipping_address");
    const data: HttpTypes.StoreUpdateCart = {
      shipping_address: shippingAddress,
      email: formField(formData, "email") || undefined,
    };

    const sameAsBilling = formData.get("same_as_billing");
    data.billing_address =
      sameAsBilling === "on"
        ? shippingAddress
        : addressFromForm(formData, "billing_address");

    try {
      await updateCart(storeCode, data);
    } catch (e: any) {
      const message = String(e?.message || e || "");
      if (!isKnownCartUpdateBug(message)) {
        return message;
      }

      const cart = await retrieveCart(storeCode, cartId);
      const addressSaved = Boolean(
        cart?.shipping_address?.address_1 ||
          cart?.shipping_address?.city ||
          cart?.shipping_address?.country_code
      );

      if (!addressSaved || !cart?.email) {
        return message;
      }

      const cartCacheTag = await getCacheTag("carts");
      revalidateTag(cartCacheTag);
      const fulfillmentCacheTag = await getCacheTag("fulfillment");
      revalidateTag(fulfillmentCacheTag);
    }
  } catch (e: any) {
    return e.message;
  }

  const country =
    String(formData.get("checkout_country_code") || "")
      .toLowerCase()
      .trim() ||
    String(formData.get("shipping_address.country_code") || "")
      .toLowerCase()
      .trim();

  redirect(`/${country}/checkout?step=delivery`);
}

/**
 * Places an order for a cart. If no cart ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to place an order for.
 * @returns The cart object if the order was successful, or null if not.
 */
export async function placeOrder(storeCode: string, cartId?: string) {
  const id = cartId || (await getCartId());

  if (!id) {
    throw new Error("No existing cart found when placing an order");
  }

  const headers = {
    ...(await getAuthHeaders()),
  };

  const cartRes = await sdk.store.cart
    .complete(storeCode, id, {}, headers)
    .then(async (cartRes: HttpTypes.StoreCompleteCartResponse) => {
      const cartCacheTag = await getCacheTag("carts");
      revalidateTag(cartCacheTag);
      return cartRes;
    })
    .catch(aiminaabeeError);

  if (cartRes?.type === "order") {
    const countryCode =
      cartRes.order.shipping_address?.country_code?.toLowerCase();

    const orderCacheTag = await getCacheTag("orders");
    revalidateTag(orderCacheTag);

    removeCartId();
    redirect(`/${countryCode}/order/${cartRes?.order.id}/confirmed`);
  }

  return cartRes.cart;
}

/**
 * Updates the countrycode param and revalidates the regions cache
 * @param regionId
 * @param countryCode
 */
export async function updateRegion(countryCode: string, currentPath: string) {
  const storeCode = getStoreCode();
  const cartId = await getCartId();
  const region = await getRegion(storeCode, countryCode);

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`);
  }

  if (cartId) {
    await updateCart(storeCode, { region_id: region.id });
    const cartCacheTag = await getCacheTag("carts");
    revalidateTag(cartCacheTag);
  }

  const regionCacheTag = await getCacheTag("regions");
  revalidateTag(regionCacheTag);

  const productsCacheTag = await getCacheTag("products");
  revalidateTag(productsCacheTag);

  redirect(`/${countryCode}${currentPath}`);
}

export async function syncCartRegion(countryCode: string) {
  const storeCode = getStoreCode();
  const cartId = await getCartId();

  if (!cartId) {
    return { synced: false as const };
  }

  const region = await getRegion(storeCode, countryCode);

  if (!region?.id) {
    return { synced: false as const };
  }

  const cart = await retrieveCart(storeCode, cartId);

  if (!cart || cart.region_id === region.id) {
    return { synced: false as const };
  }

  await updateCart(storeCode, { region_id: region.id });

  const cartCacheTag = await getCacheTag("carts");
  revalidateTag(cartCacheTag);

  const fulfillmentCacheTag = await getCacheTag("fulfillment");
  revalidateTag(fulfillmentCacheTag);

  return { synced: true as const };
}

export async function listCartOptions(
  storeCode: string
): Promise<HttpTypes.StoreShippingOptionListResponse> {
  const cartId = await getCartId();
  const headers = {
    ...(await getAuthHeaders()),
  };

  if (!cartId) {
    return { shipping_options: [] as HttpTypes.StoreCartShippingOption[] };
  }

  return sdk.store.fulfillment
    .listCartOptions(storeCode, { cart_id: cartId }, headers)
    .catch(() => {
      return { shipping_options: [] as HttpTypes.StoreCartShippingOption[] };
    });
}

function formField(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  if (!value || value.toLowerCase() === "nan") {
    return "";
  }
  return value;
}

function addressFromForm(
  formData: FormData,
  prefix: "shipping_address" | "billing_address"
): HttpTypes.StoreAddAddress {
  const countryCode =
    formField(formData, `${prefix}.country_code`).toLowerCase() ||
    String(process.env.NEXT_PUBLIC_DEFAULT_REGION || "us").toLowerCase();

  return {
    first_name: formField(formData, `${prefix}.first_name`) || undefined,
    last_name: formField(formData, `${prefix}.last_name`) || undefined,
    address_1: formField(formData, `${prefix}.address_1`) || undefined,
    address_2: formField(formData, `${prefix}.address_2`) || undefined,
    company: formField(formData, `${prefix}.company`) || undefined,
    city: formField(formData, `${prefix}.city`) || undefined,
    province: formField(formData, `${prefix}.province`) || undefined,
    postal_code: formField(formData, `${prefix}.postal_code`) || "00000",
    country_code: countryCode,
    phone: formField(formData, `${prefix}.phone`) || undefined,
  };
}
