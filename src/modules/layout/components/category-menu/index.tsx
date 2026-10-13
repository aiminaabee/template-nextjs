"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type {
  CategoryNavChild,
  CategoryNavItem,
} from "@lib/data/categories";
import LocalizedClientLink from "@modules/common/components/localized-client-link";

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const CategoryTile = ({
  item,
  onNavigate,
}: {
  item: CategoryNavChild;
  onNavigate: () => void;
}) => (
  <LocalizedClientLink
    href={`/categories/${item.handle}`}
    onClick={onNavigate}
    className="flex flex-col items-center gap-2 text-center"
    data-testid="category-menu-tile"
  >
    <Avatar className="size-24">
      {item.image ? (
        <AvatarImage src={item.image} alt={item.name} />
      ) : null}
      <AvatarFallback className="text-base">{initials(item.name)}</AvatarFallback>
    </Avatar>
    <span className="line-clamp-2 text-sm text-foreground">{item.name}</span>
  </LocalizedClientLink>
);

const CategoryMenu = ({ categories }: { categories: CategoryNavItem[] }) => {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState(categories[0]?.id);
  const active =
    categories.find((category) => category.id === activeId) ?? categories[0];
  const tiles: CategoryNavChild[] =
    active?.children.length ? active.children : active ? [active] : [];

  if (!categories.length || !active) {
    return null;
  }

  return (
    <div
      className="relative flex h-full items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Button
        type="button"
        variant={open ? "default" : "ghost"}
        className="h-9 rounded-full"
        aria-expanded={open}
        aria-haspopup="true"
        data-testid="nav-categories-button"
        onClick={() => setOpen((current) => !current)}
      >
        Categories
        <ChevronDown
          data-icon="inline-end"
          className={cn("transition-transform", open && "rotate-180")}
        />
      </Button>

      {open ? (
        <div className="absolute left-0 top-full pt-2">
          <div
            className="flex min-h-96 w-[min(52rem,calc(100vw-2rem))] overflow-hidden rounded-xl border bg-background shadow-lg"
            data-testid="nav-categories-panel"
          >
            <ul className="flex w-56 shrink-0 flex-col bg-muted/50 py-2">
              {categories.map((category) => {
                const selected = category.id === active.id;
                return (
                  <li key={category.id}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm",
                        selected
                          ? "bg-background text-foreground"
                          : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                      )}
                      onMouseEnter={() => setActiveId(category.id)}
                      onFocus={() => setActiveId(category.id)}
                      data-testid="category-menu-parent"
                    >
                      <span className="truncate">{category.name}</span>
                      <ChevronRight />
                    </button>
                  </li>
                );
              })}
            </ul>
            <Separator orientation="vertical" />
            <div className="grid flex-1 grid-cols-2 gap-6 p-6 sm:grid-cols-3 lg:grid-cols-4">
              {tiles.map((tile) => (
                <CategoryTile
                  key={tile.id}
                  item={tile}
                  onNavigate={() => setOpen(false)}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default CategoryMenu;
