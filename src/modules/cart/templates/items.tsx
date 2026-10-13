import { Heading } from "@modules/common/components/ui";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HttpTypes } from "@aiminaabeejs/types";
import repeat from "@lib/util/repeat";

import Item from "@modules/cart/components/item";
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item";

type ItemsTemplateProps = {
  storeCode: string;
  cart?: HttpTypes.StoreCart;
};

const ItemsTemplate = ({ storeCode, cart }: ItemsTemplateProps) => {
  const items = cart?.items;
  return (
    <div>
      <div className="pb-3 flex items-center">
        <Heading className="text-[2rem] leading-[2.75rem]">Cart</Heading>
      </div>
      <Table>
        <TableHeader className="border-t-0">
          <TableRow className="text-ui-fg-subtle txt-medium-plus">
            <TableHead className="!pl-0">Item</TableHead>
            <TableHead></TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead className="hidden small:table-cell">Price</TableHead>
            <TableHead className="!pr-0 text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
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
                      currencyCode={cart?.currency_code}
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

export default ItemsTemplate;
