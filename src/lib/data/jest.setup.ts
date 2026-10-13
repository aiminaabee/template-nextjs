import { cookieJar } from "./test-helpers"

jest.mock("server-only", () => ({}))

jest.mock("next/cache", () => ({
  revalidateTag: jest.fn(),
}))

jest.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  },
}))

jest.mock("next/headers", () => {
  const { cookieJar: cookies } = require("./test-helpers") as {
    cookieJar: Map<string, string>
  }

  return {
    cookies: async () => ({
      get: (name: string) => {
        const value = cookies.get(name)
        return value == null ? undefined : { name, value }
      },
      set: (name: string, value: string) => {
        cookies.set(name, value)
      },
    }),
  }
})

beforeEach(() => {
  cookieJar.clear()
})

jest.setTimeout(60_000)
