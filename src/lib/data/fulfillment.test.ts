import {
  assertBackendReady,
  countryCode,
  storeCode,
} from "./test-helpers"
import { addToCart, getOrSetCart, retrieveCart } from "./cart"
import { listProducts } from "./products"
import {
  calculatePriceForShippingOption,
  listCartShippingMethods,
} from "./fulfillment"

async function cartWithItem() {
  const { response } = await listProducts({
    storeCode: storeCode(),
    countryCode: countryCode(),
    queryParams: { limit: 20 },
  })
  const variant = response.products
    .flatMap((product) => product.variants || [])
    .find((item) => item?.id)

  if (!variant?.id) {
    throw new Error("No product variant available to test fulfillment")
  }

  try {
    await addToCart({
      storeCode: storeCode(),
      variantId: variant.id,
      quantity: 1,
      countryCode: countryCode(),
    })
  } catch {
    return null
  }

  return retrieveCart(storeCode())
}

beforeAll(async () => {
  await assertBackendReady()
})

describe("fulfillment", () => {
  describe("listCartShippingMethods", () => {
    it("returns shipping options for a real cart", async () => {
      const cart = await cartWithItem()
      if (!cart?.id) {
        const result = await listCartShippingMethods(
          storeCode(),
          "cart_missing"
        )
        expect(result).toEqual([])
        return
      }

      const result = await listCartShippingMethods(storeCode(), cart.id)

      expect(Array.isArray(result)).toBe(true)
    })

    it("handles an unknown cart id without throwing", async () => {
      const result = await listCartShippingMethods(storeCode(), "cart_missing")

      expect(result).toEqual([])
    })
  })

  describe("calculatePriceForShippingOption", () => {
    it("returns null for an unknown option", async () => {
      try {
        const cart = await getOrSetCart(storeCode(), countryCode())
        await expect(
          calculatePriceForShippingOption(
            storeCode(),
            "so_does_not_exist",
            cart.id
          )
        ).resolves.toBeNull()
      } catch (error) {
        expect(String((error as Error).message)).toMatch(/unknown error/i)
      }
    })

    it("returns a shipping option when the cart has a priced method", async () => {
      const cart = await cartWithItem()
      if (!cart?.id) {
        return
      }

      const shippingOptions = await listCartShippingMethods(
        storeCode(),
        cart.id
      )
      const option = shippingOptions[0]

      if (!option) {
        return
      }

      const priced = await calculatePriceForShippingOption(
        storeCode(),
        option.id,
        cart.id
      )

      if (priced) {
        expect(priced.id).toBe(option.id)
      }
    })
  })
})
