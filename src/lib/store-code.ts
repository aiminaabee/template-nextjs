export function getStoreCode() {
  const storeCode = process.env.NEXT_PUBLIC_DEFAULT_STORE_CODE

  if (!storeCode) {
    throw new Error(
      "NEXT_PUBLIC_DEFAULT_STORE_CODE is not set. Add it to apps/template-storefront-nextjs/.env.local"
    )
  }

  return storeCode
}
