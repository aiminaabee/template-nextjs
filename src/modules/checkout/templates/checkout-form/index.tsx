import { HttpTypes } from "@aiminaabeejs/types"
import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import Addresses from "@modules/checkout/components/addresses"
import Payment from "@modules/checkout/components/payment"
import Review from "@modules/checkout/components/review"
import Shipping from "@modules/checkout/components/shipping"

export default async function CheckoutForm({
  storeCode,
  cart,
  customer,
}: {
  storeCode: string
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  if (!cart) {
    return null
  }

  const shippingMethods = await listCartShippingMethods(storeCode, cart.id)
  const paymentMethods = await listCartPaymentMethods(
    storeCode,
    cart.region?.id ?? ""
  )

  return (
    <div className="w-full grid grid-cols-1 gap-y-8">
      <Addresses cart={cart} customer={customer} />

      <Shipping
        storeCode={storeCode}
        cart={cart}
        availableShippingMethods={shippingMethods}
      />

      <Payment
        storeCode={storeCode}
        cart={cart}
        availablePaymentMethods={paymentMethods}
      />

      <Review storeCode={storeCode} cart={cart} />
    </div>
  )
}
