import {
  assertBackendReady,
  countryCode,
  storeCode,
} from "./test-helpers"
import { getRegion, listRegions, retrieveRegion } from "./regions"

beforeAll(async () => {
  await assertBackendReady()
})

describe("regions", () => {
  describe("listRegions", () => {
    it("returns the store's regions with countries", async () => {
      const regions = await listRegions(storeCode())

      expect(Array.isArray(regions)).toBe(true)
      expect(regions.length).toBeGreaterThan(0)
      expect(regions[0]).toEqual(
        expect.objectContaining({
          id: expect.stringMatching(/^reg_/),
          currency_code: expect.any(String),
        })
      )
      expect(regions.some((region) => region.countries?.length)).toBe(true)
    })
  })

  describe("retrieveRegion", () => {
    it("returns a single region by id", async () => {
      const [region] = await listRegions(storeCode())
      const retrieved = await retrieveRegion(storeCode(), region.id)

      expect(retrieved.id).toBe(region.id)
      expect(retrieved.currency_code).toBe(region.currency_code)
    })

    it("throws for an unknown region id", async () => {
      await expect(
        retrieveRegion(storeCode(), "reg_does_not_exist")
      ).rejects.toThrow()
    })
  })

  describe("getRegion", () => {
    it("resolves the default country to a region", async () => {
      const region = await getRegion(storeCode(), countryCode())

      expect(region?.id).toMatch(/^reg_/)
      expect(
        region?.countries?.some(
          (country) => country.iso_2?.toLowerCase() === countryCode()
        )
      ).toBe(true)
    })

    it("is case-insensitive for country codes", async () => {
      const lower = await getRegion(storeCode(), countryCode())
      const upper = await getRegion(storeCode(), countryCode().toUpperCase())

      expect(upper?.id).toBe(lower?.id)
    })

    it("returns undefined for a country the store does not sell to", async () => {
      const region = await getRegion(storeCode(), "zz")
      expect(region == null).toBe(true)
    })
  })
})
