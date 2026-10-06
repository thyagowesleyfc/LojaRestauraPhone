/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

import { AdminDashboardLink } from "@/components/admin/admin-dashboard-link";
import { StoreLinkDeleteDialog } from "@/components/admin/store-link-delete-dialog";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

type LinksPageProps = {
  searchParams: Promise<{
    erro?: string;
  }>;
};

export default async function LinksPage({ searchParams }: LinksPageProps) {
  const { erro } = await searchParams;
  const links = await prisma.storeLink.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }]
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Meus Links</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Cadastre botões da página /links com imagem, descrição, ordem e
            redirecionamento.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AdminDashboardLink />
          <Button asChild>
            <Link href="/admin/links/novo">Novo link</Link>
          </Button>
        </div>
      </div>
      {erro ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {erro}
        </p>
      ) : null}
      <div className="grid gap-4">
        {links.map((storeLink) => (
          <article
            className="grid gap-4 rounded-lg border border-border bg-card p-4 md:grid-cols-[72px_1fr_auto]"
            key={storeLink.id}
          >
            {storeLink.imageUrl ? (
              <img
                alt={storeLink.title}
                className="size-16 rounded-lg object-cover"
                src={storeLink.imageUrl}
              />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-lg bg-muted text-lg font-semibold text-muted-foreground">
                {storeLink.title.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 space-y-1">
              <h2 className="font-semibold">{storeLink.title}</h2>
              <p className="break-all text-sm text-muted-foreground">
                {storeLink.redirectUrl}
              </p>
              {storeLink.description ? (
                <p className="text-sm leading-6 text-muted-foreground">
                  {storeLink.description}
                </p>
              ) : null}
              <p className="text-sm">
                Ordem {storeLink.displayOrder} - {storeLink.active ? "Ativo" : "Inativo"}
              </p>
            </div>
            <div className="flex flex-wrap items-start gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href={`/admin/links/${storeLink.id}/editar`}>Editar</Link>
              </Button>
              <StoreLinkDeleteDialog
                linkId={storeLink.id}
                linkTitle={storeLink.title}
              />
            </div>
          </article>
        ))}
        {links.length === 0 ? (
          <p className="rounded-lg border border-border p-6 text-sm text-muted-foreground">
            Nenhum link cadastrado.
          </p>
        ) : null}
      </div>
    </section>
  );
}