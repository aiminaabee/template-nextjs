import { retrieveCart } from "@lib/data/cart"
import CartDropdown from "../cart-dropdown"

export default async function CartButton({ storeCode }: { storeCode: string }) {
  const cart = await retrieveCart(storeCode).catch(() => null)

  return <CartDropdown cart={cart} />
}
