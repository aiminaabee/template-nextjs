"use client";

import { Table, TableBody } from "@/components/ui/table";
import { clx } from "@lib/util/clx";
import { HttpTypes } from "@aiminaabeejs/types";
import repeat from "@lib/util/repeat";

import Item from "@modules/cart/components/item";
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item";

type ItemsTemplateProps = {
  storeCode: string;
  cart: HttpTypes.StoreCart;
};

const ItemsPreviewTemplate = ({ storeCode, cart }: ItemsTemplateProps) => {
  const items = cart.items;
  const hasOverflow = items && items.length > 4;

  return (
    <div
      className={clx({
        "pl-[1px] overflow-y-scroll overflow-x-hidden no-scrollbar max-h-[420px]":
          hasOverflow,
      })}
    >
      <Table>
        <TableBody data-testid="items-table">
          {items
            ? items
                .sort((a, b) => {
                  return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1;
                })
                .map((item) => {
                  return (
                    <Item
                      key={item.id}
                      storeCode={storeCode}
                      item={item}
                      type="preview"
                      currencyCode={cart.currency_code}
                    />
                  );
                })
            : repeat(5).map((i) => {
                return <SkeletonLineItem key={i} />;
              })}
        </TableBody>
      </Table>
    </div>
  );
};

export default ItemsPreviewTemplate;
