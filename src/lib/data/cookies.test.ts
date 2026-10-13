import { cookieJar } from "./test-helpers"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeAuthToken,
  removeCartId,
  setAuthToken,
  setCartId,
} from "./cookies"

describe("cookies", () => {
  describe("getAuthHeaders", () => {
    it("returns an empty object when no JWT cookie is set", async () => {
      await expect(getAuthHeaders()).resolves.toEqual({})
    })

    it("returns a Bearer header when a JWT cookie is set", async () => {
      await setAuthToken("jwt-token")
      await expect(getAuthHeaders()).resolves.toEqual({
        authorization: "Bearer jwt-token",
      })
    })
  })

  describe("getCacheTag", () => {
    it("returns an empty string when the cache id cookie is missing", async () => {
      await expect(getCacheTag("carts")).resolves.toBe("")
    })

    it("prefixes the tag with the cache id", async () => {
      cookieJar.set("_aiminaabee_cache_id", "abc123")
      await expect(getCacheTag("carts")).resolves.toBe("carts-abc123")
    })
  })

  describe("getCacheOptions", () => {
    it("returns an empty object without a cache id", async () => {
      await expect(getCacheOptions("products")).resolves.toEqual({})
    })

    it("returns Next.js cache tags when a cache id exists", async () => {
      cookieJar.set("_aiminaabee_cache_id", "abc123")
      await expect(getCacheOptions("products")).resolves.toEqual({
        tags: ["products-abc123"],
      })
    })
  })

  describe("auth token cookie", () => {
    it("writes and clears _aiminaabee_jwt", async () => {
      await setAuthToken("session-token")
      expect(cookieJar.get("_aiminaabee_jwt")).toBe("session-token")

      await removeAuthToken()
      expect(cookieJar.get("_aiminaabee_jwt")).toBe("")
      await expect(getAuthHeaders()).resolves.toEqual({})
    })
  })

  describe("cart id cookie", () => {
    it("returns undefined when no cart cookie exists", async () => {
      await expect(getCartId()).resolves.toBeUndefined()
    })

    it("writes and clears _aiminaabee_cart_id", async () => {
      await setCartId("cart_123")
      await expect(getCartId()).resolves.toBe("cart_123")

      await removeCartId()
      expect(cookieJar.get("_aiminaabee_cart_id")).toBe("")
    })
  })
})
