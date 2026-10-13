"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { CategoryNavItem } from "@lib/data/categories";
import { SortOptions } from "@modules/store/components/refinement-list/sort-products";

const sortOptions: { value: SortOptions; label: string }[] = [
  { value: "created_at", label: "Sort by: Latest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

type Chip = {
  id: string;
  name: string;
};

const BrowseToolbar = ({
  categories,
  sortBy,
}: {
  categories: CategoryNavItem[];
  sortBy: SortOptions;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  const chips: Chip[] = categories.flatMap((category) => [
    { id: category.id, name: category.name },
    ...category.children.map((child) => ({
      id: child.id,
      name: child.name,
    })),
  ]);

  const setParam = (name: string, value?: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) {
      next.set(name, value);
    } else {
      next.delete(name);
    }
    next.delete("page");
    const qs = next.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
  };

  return (
    <div className="flex flex-col gap-3" data-testid="home-browse-toolbar">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {sortOptions.map((option) => (
          <Button
            key={option.value}
            type="button"
            size="sm"
            variant={sortBy === option.value ? "default" : "outline"}
            className="shrink-0 rounded-full"
            onClick={() => setParam("sortBy", option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
      {chips.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Button
            type="button"
            size="sm"
            variant={!activeCategory ? "default" : "outline"}
            className="shrink-0 rounded-full"
            onClick={() => setParam("category")}
          >
            All
          </Button>
          {chips.map((chip) => (
            <Button
              key={chip.id}
              type="button"
              size="sm"
              variant={activeCategory === chip.id ? "default" : "outline"}
              className="shrink-0 rounded-full"
              onClick={() => setParam("category", chip.id)}
            >
              {chip.name}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default BrowseToolbar;
