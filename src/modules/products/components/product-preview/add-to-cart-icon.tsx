"use client";

import { ShoppingCart } from "lucide-react";
import { useParams } from "next/navigation";
import { useState, type MouseEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { addToCart } from "@lib/data/cart";
import LocalizedClientLink from "@modules/common/components/localized-client-link";

const AddToCartIcon = ({
  storeCode,
  variantId,
  productHandle,
}: {
  storeCode: string;
  variantId?: string | null;
  productHandle: string;
}) => {
  const countryCode = useParams().countryCode as string;
  const [pending, setPending] = useState(false);

  if (!variantId) {
    return (
      <Button
        asChild
        size="icon"
        variant="outline"
        className="rounded-full"
        aria-label="View product"
      >
        <LocalizedClientLink href={`/products/${productHandle}`}>
          <ShoppingCart />
        </LocalizedClientLink>
      </Button>
    );
  }

  const onClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setPending(true);
    try {
      await addToCart({
        storeCode,
        variantId,
        quantity: 1,
        countryCode,
      });
      toast.success("Added to cart");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not add to cart"
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      className="rounded-full"
      disabled={pending}
      onClick={onClick}
      aria-label="Add to cart"
      data-testid="product-preview-add"
    >
      {pending ? <Spinner data-icon="inline-start" /> : <ShoppingCart />}
    </Button>
  );
};

export default AddToCartIcon;
