import {
  assertBackendReady,
  storeCode,
  uniqueEmail,
} from "./test-helpers"
import { loginCustomer, registerCustomer, signOutCustomer } from "./customer"
import {
  acceptTransferRequest,
  createTransferRequest,
  declineTransferRequest,
  listOrders,
  retrieveOrder,
} from "./orders"

const password = "supersecret"

beforeAll(async () => {
  await assertBackendReady()
})

describe("orders", () => {
  describe("retrieveOrder", () => {
    it("returns null for an unknown order id", async () => {
      await expect(
        retrieveOrder(storeCode(), "order_does_not_exist")
      ).resolves.toBeNull()
    })
  })

  describe("listOrders", () => {
    it("throws when the shopper is not signed in", async () => {
      await expect(listOrders(storeCode())).rejects.toThrow()
    })

    it("returns an order list for a signed-in customer", async () => {
      const email = uniqueEmail("orders")
      const created = await registerCustomer({
        storeCode: storeCode(),
        firstName: "Orders",
        email,
        password,
      })
      expect(created.success).toBe(true)

      const orders = await listOrders(storeCode(), 10, 0)

      expect(Array.isArray(orders)).toBe(true)

      await signOutCustomer()
    })
  })

  describe("createTransferRequest", () => {
    it("requires an order id", async () => {
      const form = new FormData()
      await expect(
        createTransferRequest(
          storeCode(),
          { success: false, error: null, order: null },
          form
        )
      ).resolves.toEqual({
        success: false,
        error: "Order ID is required",
        order: null,
      })
    })

    it("returns an error for an unknown order", async () => {
      const form = new FormData()
      form.set("order_id", "order_does_not_exist")

      const result = await createTransferRequest(
        storeCode(),
        { success: false, error: null, order: null },
        form
      )

      expect(result.success).toBe(false)
      expect(result.order).toBeNull()
      expect(result.error).toBeTruthy()
    })
  })

  describe("acceptTransferRequest / declineTransferRequest", () => {
    it("returns an error for a bad token", async () => {
      const accepted = await acceptTransferRequest(
        storeCode(),
        "order_does_not_exist",
        "bad-token"
      )
      const declined = await declineTransferRequest(
        storeCode(),
        "order_does_not_exist",
        "bad-token"
      )

      expect(accepted.success).toBe(false)
      expect(declined.success).toBe(false)
    })
  })

  describe("loginCustomer leftover", () => {
    it("keeps order retrieve null after login with no orders", async () => {
      const email = uniqueEmail("orders-login")
      await registerCustomer({
        storeCode: storeCode(),
        firstName: "None",
        email,
        password,
      })
      await signOutCustomer()
      await loginCustomer({ storeCode: storeCode(), email, password })

      await expect(
        retrieveOrder(storeCode(), "order_does_not_exist")
      ).resolves.toBeNull()
    })
  })
})
