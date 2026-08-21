import Link from "next/link";

import { Button } from "@/components/ui/button";

export function AdminDashboardLink() {
  return (
    <Button asChild variant="outline">
      <Link href="/admin">
        <svg
          aria-hidden="true"
          className="size-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M19 12H5m0 0 6-6m-6 6 6 6"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
        Voltar ao painel
      </Link>
    </Button>
  );
}
