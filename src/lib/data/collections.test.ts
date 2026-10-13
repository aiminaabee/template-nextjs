import { assertBackendReady, storeCode } from "./test-helpers"
import {
  getCollectionByHandle,
  listCollections,
  retrieveCollection,
} from "./collections"

beforeAll(async () => {
  await assertBackendReady()
})

describe("collections", () => {
  describe("listCollections", () => {
    it("returns collections with a count", async () => {
      const { collections, count } = await listCollections(storeCode(), {
        limit: 20,
      })

      expect(Array.isArray(collections)).toBe(true)
      expect(count).toBeGreaterThanOrEqual(collections.length)
    })
  })

  describe("retrieveCollection", () => {
    it("returns a collection by id when one exists", async () => {
      const { collections } = await listCollections(storeCode(), { limit: 1 })

      if (!collections[0]) {
        return
      }

      const collection = await retrieveCollection(
        storeCode(),
        collections[0].id
      )

      expect(collection.id).toBe(collections[0].id)
    })
  })

  describe("getCollectionByHandle", () => {
    it("returns the collection for a known handle", async () => {
      const { collections } = await listCollections(storeCode(), {
        limit: 20,
      })
      const withHandle = collections.find((collection) => collection.handle)

      if (!withHandle?.handle) {
        return
      }

      const found = await getCollectionByHandle(storeCode(), withHandle.handle)

      expect(found.id).toBe(withHandle.id)
      expect(found.handle).toBe(withHandle.handle)
    })
  })
})
