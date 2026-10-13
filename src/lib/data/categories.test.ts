import { assertBackendReady, storeCode } from "./test-helpers"
import {
  getCategoryByHandle,
  listCategories,
  listCategoryNav,
} from "./categories"

beforeAll(async () => {
  await assertBackendReady()
})

describe("categories", () => {
  describe("listCategories", () => {
    it("returns store categories", async () => {
      const categories = await listCategories(storeCode(), { limit: 20 })

      expect(Array.isArray(categories)).toBe(true)
    })

    it("honors a custom limit", async () => {
      const categories = await listCategories(storeCode(), { limit: 1 })

      expect(categories.length).toBeLessThanOrEqual(1)
    })
  })

  describe("listCategoryNav", () => {
    it("returns a tree of parent categories for the storefront menu", async () => {
      const tree = await listCategoryNav(storeCode())

      expect(Array.isArray(tree)).toBe(true)
      if (tree.length === 0) {
        return
      }

      expect(tree[0].id).toMatch(/^pcat_/)
      expect(tree[0].name).toBeTruthy()
      expect(tree[0].handle).toBeTruthy()
      expect(Array.isArray(tree[0].children)).toBe(true)
    })
  })

  describe("getCategoryByHandle", () => {
    it("returns the category for a known handle", async () => {
      const categories = await listCategories(storeCode(), { limit: 20 })
      const withHandle = categories.find((category) => category.handle)

      if (!withHandle?.handle) {
        return
      }

      const found = await getCategoryByHandle(storeCode(), [
        withHandle.handle,
      ])

      expect(found.id).toBe(withHandle.id)
      expect(found.handle).toBe(withHandle.handle)
    })
  })
})
