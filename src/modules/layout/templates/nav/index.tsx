import { HttpTypes } from "@aiminaabeejs/types";
import { User } from "lucide-react";
import { Suspense } from "react";

import { listCategoryNav } from "@lib/data/categories";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import CartButton from "@modules/layout/components/cart-button";
import CategoryMenu from "@modules/layout/components/category-menu";
import NavSearch from "@modules/layout/components/nav-search";

export default async function Nav({
  storeCode,
  customer,
}: {
  storeCode: string;
  customer?: HttpTypes.StoreCustomer | null;
}) {
  const categories = await listCategoryNav(storeCode).catch(() => []);
  const greeting = customer?.first_name
    ? `Hello, ${customer.first_name}`
    : "Hello";

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-16 mx-auto overflow-visible border-b bg-background">
        <nav className="content-container flex h-full w-full items-center gap-3">
          <div className="flex shrink-0 items-center gap-2">
            <LocalizedClientLink
              href="/"
              className="truncate"
              data-testid="nav-store-link"
            >
              Store
            </LocalizedClientLink>
            <CategoryMenu categories={categories} />
          </div>

          <div className="flex min-w-0 flex-1 justify-center">
            <NavSearch />
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <LocalizedClientLink
              className="flex items-center gap-2"
              href="/account"
              data-testid="nav-account-link"
            >
              <User />
              <span className="hidden flex-col leading-tight small:flex">
                <span className="text-muted-foreground">{greeting}</span>
                <span>Orders & Account</span>
              </span>
            </LocalizedClientLink>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="flex items-center"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Cart
                </LocalizedClientLink>
              }
            >
              <CartButton storeCode={storeCode} />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  );
}
