"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ChangeEvent } from "react";

export type CategoryProductSort = "alfabetica" | "maior-preco" | "menor-preco";

const sortOptions: Array<{ label: string; value: CategoryProductSort }> = [
  { label: "Alfabética", value: "alfabetica" },
  { label: "Maior Preço", value: "maior-preco" },
  { label: "Menor Preço", value: "menor-preco" }
];

type CategoryProductSortSelectProps = {
  value: CategoryProductSort;
};

export function CategoryProductSortSelect({
  value
}: CategoryProductSortSelectProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSortChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextSort = event.target.value as CategoryProductSort;
    const nextSearchParams = new URLSearchParams(searchParams.toString());

    if (nextSort === "alfabetica") {
      nextSearchParams.delete("ordenar");
    } else {
      nextSearchParams.set("ordenar", nextSort);
    }

    const queryString = nextSearchParams.toString();

    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false
    });
  }

  return (
    <div className="flex w-full flex-row items-center gap-2 sm:w-auto">
      <label
        className="shrink-0 whitespace-nowrap text-sm font-medium text-muted-foreground"
        htmlFor="category-product-sort"
      >
        Ordenar por
      </label>
      <select
        className="h-10 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:w-44 sm:flex-none"
        id="category-product-sort"
        onChange={handleSortChange}
        value={value}
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
