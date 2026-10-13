import {
  assertBackendReady,
  countryCode,
  storeCode,
} from "./test-helpers"
import { getRegion } from "./regions"
import { listCartPaymentMethods } from "./payment"

beforeAll(async () => {
  await assertBackendReady()
})

describe("payment", () => {
  describe("listCartPaymentMethods", () => {
    it("returns providers for the store region, sorted by id", async () => {
      const region = await getRegion(storeCode(), countryCode())
      expect(region?.id).toBeTruthy()

      const providers = await listCartPaymentMethods(storeCode(), region!.id)

      expect(Array.isArray(providers)).toBe(true)
      const ids = providers.map((provider) => provider.id)
      expect(ids).toEqual([...ids].sort())
    })

    it("returns an empty list for an unknown region", async () => {
      await expect(
        listCartPaymentMethods(storeCode(), "reg_does_not_exist")
      ).resolves.toEqual([])
    })
  })
})
