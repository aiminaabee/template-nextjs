import {
  assertBackendReady,
  countryCode,
  storeCode,
} from "./test-helpers"
import {
  listProducts,
  listProductsWithSort,
  retrieveProduct,
} from "./products"

beforeAll(async () => {
  await assertBackendReady()
})

describe("products", () => {
  describe("listProducts", () => {
    it("returns a paginated catalog for the store", async () => {
      const result = await listProducts({
        storeCode: storeCode(),
        queryParams: { limit: 5 },
      })

      expect(result.response.products.length).toBeGreaterThan(0)
      expect(result.response.count).toBeGreaterThanOrEqual(
        result.response.products.length
      )
      expect(result.response.products[0].id).toMatch(/^prod_/)
    })

    it("attaches calculated prices when a country is provided", async () => {
      const { response } = await listProducts({
        storeCode: storeCode(),
        countryCode: countryCode(),
        queryParams: { limit: 5 },
      })
      const priced = response.products.find((product) =>
        product.variants?.some((variant) => variant.calculated_price)
      )

      expect(priced).toBeTruthy()
    })

    it("paginates with pageParam", async () => {
      const page1 = await listProducts({
        storeCode: storeCode(),
        pageParam: 1,
        queryParams: { limit: 1 },
      })
      const page2 = await listProducts({
        storeCode: storeCode(),
        pageParam: 2,
        queryParams: { limit: 1 },
      })

      expect(page1.response.products[0].id).toBeTruthy()
      if (page1.response.count > 1) {
        expect(page2.response.products[0].id).not.toBe(
          page1.response.products[0].id
        )
        expect(page1.nextPage).toBe(2)
      }
    })
  })

  describe("retrieveProduct", () => {
    it("retrieves a listed product by id, falling back to list if retrieve 404s", async () => {
      const { response } = await listProducts({
        storeCode: storeCode(),
        queryParams: { limit: 1 },
      })
      const listed = response.products[0]

      const product = await retrieveProduct({
        storeCode: storeCode(),
        productId: listed.id,
        countryCode: countryCode(),
      })

      expect(product.id).toBe(listed.id)
      expect(product.title).toBe(listed.title)
      expect(Array.isArray(product.images)).toBe(true)
    })

    it("throws for an unknown product id", async () => {
      await expect(
        retrieveProduct({
          storeCode: storeCode(),
          productId: "prod_does_not_exist",
          countryCode: countryCode(),
        })
      ).rejects.toThrow(/not found/i)
    })
  })

  describe("listProductsWithSort", () => {
    it("returns a page of sorted products for a country", async () => {
      const result = await listProductsWithSort({
        storeCode: storeCode(),
        page: 1,
        countryCode: countryCode(),
        queryParams: { limit: 4 },
      })

      expect(result.response.products.length).toBeGreaterThan(0)
      expect(result.response.products.length).toBeLessThanOrEqual(4)
    })
  })
})
