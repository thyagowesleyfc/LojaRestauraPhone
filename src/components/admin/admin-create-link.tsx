import type { ReactNode } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type AdminCreateLinkProps = {
  children: ReactNode;
  href: string;
  label: string;
};

export function AdminCreateLink({
  children,
  href,
  label
}: AdminCreateLinkProps) {
  return (
    <Button asChild className="size-9 px-0 sm:h-9 sm:w-auto sm:px-3" size="sm">
      <Link aria-label={label} href={href}>
        <svg
          aria-hidden="true"
          className="size-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
        <span className="hidden sm:inline">{children}</span>
      </Link>
    </Button>
  );
}
