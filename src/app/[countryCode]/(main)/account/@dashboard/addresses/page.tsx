import { Metadata } from "next";

import AddressBook from "@modules/account/components/address-book";

import { retrieveCustomer } from "@lib/data/customer";
import { getRegion } from "@lib/data/regions";
import { getStoreCode } from "@lib/store-code";
import { HttpTypes } from "@aiminaabeejs/types";

export const metadata: Metadata = {
  title: "Addresses",
  description: "View your addresses",
};

export default async function Addresses(props: {
  params: Promise<{ countryCode: string }>;
}) {
  const { countryCode } = await props.params;
  const storeCode = getStoreCode();
  const customer = await retrieveCustomer(storeCode);
  const region =
    (await getRegion(storeCode, countryCode)) ??
    ({
      id: countryCode,
      name: countryCode.toUpperCase(),
      currency_code: "usd",
      countries: [
        {
          iso_2: countryCode,
          display_name: countryCode.toUpperCase(),
        },
      ],
    } as HttpTypes.StoreRegion);

  if (!customer) {
    return null;
  }

  return (
    <div className="w-full" data-testid="addresses-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Shipping Addresses</h1>
        <p className="text-base-regular">
          View and update your shipping addresses, you can add as many as you
          like. Saving your addresses will make them available during checkout.
        </p>
      </div>
      <AddressBook
        storeCode={storeCode}
        customer={customer}
        region={region}
      />
    </div>
  );
}
