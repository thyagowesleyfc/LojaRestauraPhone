/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

import { deleteBannerAction } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

type BannersPageProps = {
  searchParams: Promise<{
    erro?: string;
  }>;
};

export default async function BannersPage({ searchParams }: BannersPageProps) {
  const { erro } = await searchParams;
  const banners = await prisma.banner.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }]
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Banners</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Cadastre imagens desktop/mobile, headline, links, ordem e
            disponibilidade publica.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/banners/novo">Novo banner</Link>
        </Button>
      </div>
      {erro ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {erro}
        </p>
      ) : null}
      <div className="grid gap-4">
        {banners.map((banner) => (
          <article
            key={banner.id}
            className="grid gap-4 rounded-lg border border-border p-4 lg:grid-cols-[260px_1fr_auto]"
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <img
                alt={banner.altText ?? "Banner desktop"}
                className="aspect-[16/6] w-full rounded-md object-cover"
                src={banner.imageUrl}
              />
              {banner.mobileImageUrl ? (
                <img
                  alt={banner.altText ?? "Banner mobile"}
                  className="aspect-[4/5] w-full rounded-md object-cover sm:max-h-40 lg:max-h-none"
                  src={banner.mobileImageUrl}
                />
              ) : null}
            </div>
            <div className="space-y-1">
              <h2 className="font-semibold">{banner.altText || "Banner"}</h2>
              <p className="break-all text-sm text-muted-foreground">
                {banner.redirectUrl}
              </p>
              <p className="text-sm">
                Ordem {banner.displayOrder} - {banner.active ? "Ativo" : "Inativo"}
              </p>
              <p className="text-xs text-muted-foreground">
                Desktop: 1920x720px recomendado. Mobile: 900x1200px
                recomendado.
              </p>
            </div>
            <div className="flex flex-wrap items-start gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href={`/admin/banners/${banner.id}/editar`}>Editar</Link>
              </Button>
              <form action={deleteBannerAction}>
                <input type="hidden" name="id" value={banner.id} />
                <Button type="submit" size="sm" variant="destructive">
                  Excluir
                </Button>
              </form>
            </div>
          </article>
        ))}
        {banners.length === 0 ? (
          <p className="rounded-lg border border-border p-6 text-sm text-muted-foreground">
            Nenhum banner cadastrado.
          </p>
        ) : null}
      </div>
    </section>
  );
}