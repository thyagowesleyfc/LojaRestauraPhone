import type { Metadata } from "next";

import { StoreLinksList } from "@/components/public/store-links-list";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/store-settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();

  return {
    title: `Links | ${settings.tradeName}`,
    description: `Links úteis da ${settings.tradeName}.`
  };
}

export default async function LinksPage() {
  const links = await prisma.storeLink.findMany({
    where: { active: true },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    select: {
      description: true,
      id: true,
      imageUrl: true,
      redirectUrl: true,
      title: true
    }
  });

  return (
    <main className="min-h-[52vh] bg-background px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
        <header className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            REDIRECIONAMENTO
          </p>
          <h1 className="text-4xl font-semibold">Página de Links</h1>
        </header>
        {links.length > 0 ? <StoreLinksList links={links} /> : null}
      </div>
    </main>
  );
}