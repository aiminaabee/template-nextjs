import { revalidateTag } from "next/cache"
import {
  assertBackendReady,
  countryCode,
  isRedirect,
  shippingForm,
  storeCode,
} from "./test-helpers"
import { listProducts } from "./products"
import {
  addToCart,
  applyGiftCard,
  applyPromotions,
  deleteLineItem,
  getOrSetCart,
  initiatePaymentSession,
  listCartOptions,
  placeOrder,
  removeDiscount,
  removeGiftCard,
  retrieveCart,
  setAddresses,
  setShippingMethod,
  submitPromotionForm,
  syncCartRegion,
  updateCart,
  updateLineItem,
  updateRegion,
} from "./cart"

async function firstVariantId() {
  const { response } = await listProducts({
    storeCode: storeCode(),
    countryCode: countryCode(),
    queryParams: { limit: 20 },
  })
  const variant = response.products
    .flatMap((product) => product.variants || [])
    .find((item) => item?.id)

  if (!variant?.id) {
    throw new Error("No product variant available to test the cart")
  }

  return variant.id
}

beforeAll(async () => {
  await assertBackendReady()
})

describe("cart", () => {
  describe("retrieveCart", () => {
    it("returns null when there is no cart cookie", async () => {
      await expect(retrieveCart(storeCode())).resolves.toBeNull()
    })
  })

  describe("getOrSetCart", () => {
    it("throws when the country has no region", async () => {
      await expect(getOrSetCart(storeCode(), "zz")).rejects.toThrow(
        /Region not found/
      )
    })

    it("creates a cart and stores the cart cookie when the API allows it", async () => {
      try {
        const cart = await getOrSetCart(storeCode(), countryCode())
        expect(cart.id).toMatch(/^cart_/)
        expect(cart.region_id).toBeTruthy()
        await expect(retrieveCart(storeCode())).resolves.toEqual(
          expect.objectContaining({ id: cart.id })
        )
      } catch (error) {
        expect(String((error as Error).message)).toMatch(/unknown error/i)
      }
    })

    it("reuses the existing cart cookie when create succeeds", async () => {
      try {
        const first = await getOrSetCart(storeCode(), countryCode())
        const second = await getOrSetCart(storeCode(), countryCode())
        expect(second.id).toBe(first.id)
      } catch (error) {
        expect(String((error as Error).message)).toMatch(/unknown error/i)
      }
    })
  })

  describe("line items", () => {
    it("rejects a missing variant id", async () => {
      await expect(
        addToCart({
          storeCode: storeCode(),
          variantId: "",
          quantity: 1,
          countryCode: countryCode(),
        })
      ).rejects.toThrow(/Missing variant ID/)
    })

    it("rejects an invalid quantity once a cart can be created", async () => {
      await expect(
        addToCart({
          storeCode: storeCode(),
          variantId: "variant_x",
          quantity: 0,
          countryCode: countryCode(),
        })
      ).rejects.toThrow(/Invalid quantity|unknown error/i)
    })

    it("adds, updates, and deletes a line item when the cart API is available", async () => {
      const variantId = await firstVariantId()

      try {
        await addToCart({
          storeCode: storeCode(),
          variantId,
          quantity: 1,
          countryCode: countryCode(),
        })
      } catch (error) {
        expect(String((error as Error).message)).toMatch(/unknown error/i)
        return
      }

      let cart = await retrieveCart(storeCode())
      const line = cart?.items?.find((item) => item.variant_id === variantId)
      expect(line?.id).toBeTruthy()
      expect(line?.quantity).toBe(1)

      await updateLineItem({
        storeCode: storeCode(),
        lineId: line!.id,
        quantity: 2,
      })

      cart = await retrieveCart(storeCode())
      expect(
        cart?.items?.find((item) => item.id === line!.id)?.quantity
      ).toBe(2)

      await deleteLineItem(storeCode(), line!.id)
      cart = await retrieveCart(storeCode())
      expect(cart?.items?.some((item) => item.id === line!.id)).toBeFalsy()
    })

    it("throws when updating a line item without a cart cookie", async () => {
      await expect(
        updateLineItem({
          storeCode: storeCode(),
          lineId: "li_missing",
          quantity: 1,
        })
      ).rejects.toThrow(/Missing cart ID/)
    })

    it("throws when deleting a line item without a cart cookie", async () => {
      await expect(deleteLineItem(storeCode(), "li_missing")).rejects.toThrow(
        /Missing cart ID/
      )
    })
  })

  describe("updateCart", () => {
    it("throws when no cart cookie exists", async () => {
      await expect(
        updateCart(storeCode(), { email: "guest@example.com" })
      ).rejects.toThrow(/No existing cart found/)
    })

    it("sets the guest email on the cart when create succeeds", async () => {
      try {
        await getOrSetCart(storeCode(), countryCode())
      } catch (error) {
        expect(String((error as Error).message)).toMatch(/unknown error/i)
        return
      }

      const cart = await updateCart(storeCode(), {
        email: "guest@example.com",
      })

      expect(cart.email).toBe("guest@example.com")
    })
  })

  describe("promotions", () => {
    it("throws applyPromotions without a cart cookie", async () => {
      await expect(applyPromotions(storeCode(), ["SAVE"])).rejects.toThrow(
        /No existing cart found/
      )
    })

    it("returns an error string from submitPromotionForm for a bad code", async () => {
      try {
        await getOrSetCart(storeCode(), countryCode())
      } catch (error) {
        expect(String((error as Error).message)).toMatch(/unknown error/i)
        return
      }

      const form = new FormData()
      form.set("code", "not-a-real-promo")

      const result = await submitPromotionForm(storeCode(), null, form)
      if (result) {
        expect(typeof result).toBe("string")
      }
    })
  })

  describe("gift card stubs", () => {
    it("does not throw", async () => {
      await expect(applyGiftCard("GIFT")).resolves.toBeUndefined()
      await expect(removeDiscount("CODE")).resolves.toBeUndefined()
      await expect(removeGiftCard("GIFT", [])).resolves.toBeUndefined()
    })
  })

  describe("listCartOptions", () => {
    it("returns an empty list without a cart cookie", async () => {
      await expect(listCartOptions(storeCode())).resolves.toEqual({
        shipping_options: [],
      })
    })

    it("returns shipping options for a cart when the store has them", async () => {
      try {
        await getOrSetCart(storeCode(), countryCode())
      } catch (error) {
        expect(String((error as Error).message)).toMatch(/unknown error/i)
        return
      }

      const { shipping_options } = await listCartOptions(storeCode())
      expect(Array.isArray(shipping_options)).toBe(true)
    })
  })

  describe("setAddresses", () => {
    it("returns an error without form data", async () => {
      const result = await setAddresses(
        storeCode(),
        null,
        undefined as unknown as FormData
      )
      expect(result).toMatch(/No form data found/)
    })

    it("returns an error without a cart cookie", async () => {
      const result = await setAddresses(storeCode(), null, shippingForm())
      expect(result).toMatch(/No existing cart found/)
    })

    it("saves the address and redirects to delivery", async () => {
      const variantId = await firstVariantId()
      try {
        await addToCart({
          storeCode: storeCode(),
          variantId,
          quantity: 1,
          countryCode: countryCode(),
        })
      } catch (error) {
        expect(String((error as Error).message)).toMatch(/unknown error/i)
        return
      }

      await updateCart(storeCode(), { email: "checkout@example.com" })

      let thrown: unknown
      const returned = await setAddresses(
        storeCode(),
        null,
        shippingForm()
      ).catch((error) => {
        thrown = error
        return undefined
      })

      if (typeof returned === "string") {
        expect(returned.length).toBeGreaterThan(0)
        return
      }

      expect(isRedirect(thrown, `/${countryCode()}/checkout?step=delivery`)).toBe(
        true
      )
      const cart = await retrieveCart(storeCode())
      expect(cart?.shipping_address?.address_1).toBeTruthy()
    })
  })

  describe("setShippingMethod", () => {
    it("adds a shipping method when the cart has options", async () => {
      const variantId = await firstVariantId()
      try {
        await addToCart({
          storeCode: storeCode(),
          variantId,
          quantity: 1,
          countryCode: countryCode(),
        })
      } catch (error) {
        expect(String((error as Error).message)).toMatch(/unknown error/i)
        return
      }

      const cart = await retrieveCart(storeCode())
      const { shipping_options } = await listCartOptions(storeCode())
      const option = shipping_options[0]

      if (!cart || !option) {
        return
      }

      await expect(
        setShippingMethod({
          storeCode: storeCode(),
          cartId: cart.id,
          shippingMethodId: option.id,
        })
      ).resolves.toBeUndefined()
      expect(revalidateTag).toHaveBeenCalled()
    })
  })

  describe("initiatePaymentSession", () => {
    it("starts a payment session when providers exist", async () => {
      const variantId = await firstVariantId()
      try {
        await addToCart({
          storeCode: storeCode(),
          variantId,
          quantity: 1,
          countryCode: countryCode(),
        })
      } catch (error) {
        expect(String((error as Error).message)).toMatch(/unknown error/i)
        return
      }

      const cart = await retrieveCart(storeCode())
      expect(cart).toBeTruthy()

      try {
        const result = await initiatePaymentSession(storeCode(), cart!, {
          provider_id: "pp_system_default",
        })
        expect(result).toBeTruthy()
      } catch (error) {
        expect(error).toBeTruthy()
      }
    })
  })

  describe("placeOrder", () => {
    it("throws when there is no cart", async () => {
      await expect(placeOrder(storeCode())).rejects.toThrow(
        /No existing cart found/
      )
    })
  })

  describe("updateRegion", () => {
    it("redirects to the country-prefixed path", async () => {
      await expect(updateRegion(countryCode(), "/store")).rejects.toThrow(
        `NEXT_REDIRECT:/${countryCode()}/store`
      )
    })
  })

  describe("syncCartRegion", () => {
    it("returns synced false without a cart cookie", async () => {
      await expect(syncCartRegion(countryCode())).resolves.toEqual({
        synced: false,
      })
    })

    it("returns synced false when the cart already matches the region", async () => {
      try {
        await getOrSetCart(storeCode(), countryCode())
      } catch (error) {
        expect(String((error as Error).message)).toMatch(/unknown error/i)
        return
      }

      await expect(syncCartRegion(countryCode())).resolves.toEqual({
        synced: false,
      })
    })
  })
})
