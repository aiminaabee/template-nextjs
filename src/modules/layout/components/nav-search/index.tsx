"use client";

import { Search } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const NavSearch = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const countryCode =
    typeof params.countryCode === "string" ? params.countryCode : "us";
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = new URLSearchParams(searchParams.toString());
    const trimmed = query.trim();
    if (trimmed) {
      next.set("q", trimmed);
    } else {
      next.delete("q");
    }
    next.delete("page");
    const qs = next.toString();
    router.push(`/${countryCode}${qs ? `?${qs}` : ""}`);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="relative flex w-full max-w-xl flex-1 items-center"
      role="search"
    >
      <Input
        type="search"
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search products"
        className="h-10 rounded-full pr-12"
        aria-label="Search products"
        data-testid="nav-search-input"
      />
      <Button
        type="submit"
        size="icon"
        className="absolute right-1 size-8 rounded-full"
        aria-label="Search"
      >
        <Search />
      </Button>
    </form>
  );
};

export default NavSearch;
