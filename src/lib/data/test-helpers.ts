/**
 * Shared helpers for colocated data-layer tests.
 * Copy this file with the rest of `src/lib/data` when moving the folder.
 */

export const cookieJar = new Map<string, string>()

export function resetDataLayerCookies() {
  cookieJar.clear()
}

export function storeCode() {
  const value = process.env.NEXT_PUBLIC_DEFAULT_STORE_CODE
  if (!value) {
    throw new Error("NEXT_PUBLIC_DEFAULT_STORE_CODE is missing from .env.local")
  }
  return value
}

export function countryCode() {
  return (process.env.NEXT_PUBLIC_DEFAULT_REGION || "us").toLowerCase()
}

export function backendUrl() {
  return process.env.AIMINAABEE_BACKEND_URL || "http://localhost:3000"
}

export function publishableKey() {
  const value = process.env.NEXT_PUBLIC_AIMINAABEE_PUBLISHABLE_KEY
  if (!value) {
    throw new Error(
      "NEXT_PUBLIC_AIMINAABEE_PUBLISHABLE_KEY is missing from .env.local"
    )
  }
  return value
}

export function uniqueEmail(prefix = "data-test") {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`
}

export function isRedirect(error: unknown, url?: string) {
  if (!(error instanceof Error) || !error.message.startsWith("NEXT_REDIRECT:")) {
    return false
  }

  if (!url) {
    return true
  }

  return error.message === `NEXT_REDIRECT:${url}`
}

export async function assertBackendReady() {
  const response = await fetch(
    `${backendUrl()}/store/${storeCode()}/regions`,
    {
      headers: {
        accept: "application/json",
        "x-publishable-api-key": publishableKey(),
      },
    }
  )

  if (!response.ok) {
    const body = await response.text()
    throw new Error(
      `Aiminaabee API is not ready at ${backendUrl()} (${response.status}): ${body}`
    )
  }
}

export function shippingForm(overrides: Record<string, string> = {}) {
  const form = new FormData()
  const fields = {
    email: uniqueEmail("cart"),
    "shipping_address.first_name": "Test",
    "shipping_address.last_name": "Buyer",
    "shipping_address.address_1": "1 Marine Drive",
    "shipping_address.city": "Male",
    "shipping_address.postal_code": "20000",
    "shipping_address.country_code": countryCode(),
    "shipping_address.phone": "7771234",
    same_as_billing: "on",
    checkout_country_code: countryCode(),
    ...overrides,
  }

  for (const [key, value] of Object.entries(fields)) {
    form.set(key, value)
  }

  return form
}

export function customerAddressForm(overrides: Record<string, string> = {}) {
  const form = new FormData()
  const fields = {
    first_name: "Addr",
    last_name: "User",
    address_1: "2 Marine Drive",
    city: "Male",
    postal_code: "20000",
    country_code: countryCode(),
    phone: "7770003",
    ...overrides,
  }

  for (const [key, value] of Object.entries(fields)) {
    form.set(key, value)
  }

  return form
}
