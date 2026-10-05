/* eslint-disable @next/next/no-img-element */
import { Prisma } from "@prisma/client";
import Link from "next/link";

import { AdminDashboardLink } from "@/components/admin/admin-dashboard-link";
import { ProductDeleteDialog } from "@/components/admin/product-delete-dialog";
import { Button } from "@/components/ui/button";
import { formatMoneyFromCents } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type ProductsPageProps = {
  searchParams?: Promise<{
    busca?: string | string[];
    erro?: string | string[];
    status?: string | string[];
  }>;
};

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeProductSearch(value: string | string[] | undefined) {
  return (getSingleParam(value) ?? "").trim();
}

function normalizeProductStatus(value: string | string[] | undefined) {
  const status = getSingleParam(value);

  if (status === "inativos" || status === "todos") {
    return status;
  }

  return "ativos";
}

function getProductBlockers(product: {
  _count: {
    promotions: number;
    variants: number;
  };
}) {
  return [
    product._count.variants > 0
      ? `${product._count.variants} SKU${product._count.variants > 1 ? "s" : ""}`
      : null,
    product._count.promotions > 0
      ? `${product._count.promotions} promoção${product._count.promotions > 1 ? "ões" : ""}`
      : null
  ].filter(Boolean);
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const error = getSingleParam(resolvedSearchParams.erro);
  const search = normalizeProductSearch(resolvedSearchParams.busca);
  const status = normalizeProductStatus(resolvedSearchParams.status);
  const productWhere: Prisma.ProductWhereInput = {
    ...(status !== "todos" ? { active: status === "ativos" } : {}),
    ...(search
      ? {
          OR: [
            { description: { contains: search, mode: "insensitive" } },
            { slug: { contains: search, mode: "insensitive" } },
            {
              variants: {
                some: { sku: { contains: search, mode: "insensitive" } }
              }
            }
          ]
        }
      : {})
  };
  const products = await prisma.product.findMany({
    where: productWhere,
    orderBy: [{ createdAt: "desc" }],
    include: {
      category: true,
      images: {
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
        take: 1
      },
      _count: {
        select: {
          promotions: true,
          variants: true
        }
      }
    }
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Produtos</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gerencie itens, preços, imagens e status público.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AdminDashboardLink />
          <Button asChild>
            <Link href="/admin/produtos/novo">Novo produto</Link>
          </Button>
        </div>
      </div>

      <form className="grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-[1fr_220px_auto] sm:items-end">
        <label className="space-y-2 text-sm">
          <span className="font-medium">Buscar por produto ou SKU</span>
          <input
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            defaultValue={search}
            name="busca"
            placeholder="Nome, slug ou código SKU"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium">Filtrar por status</span>
          <select
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            defaultValue={status}
            name="status"
          >
            <option value="ativos">Ativos</option>
            <option value="inativos">Inativos</option>
            <option value="todos">Todos</option>
          </select>
        </label>
        <Button type="submit">Aplicar</Button>
      </form>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <div className="grid gap-4">
        {products.map((product) => {
          const blockers = getProductBlockers(product);
          const disabledReason = blockers.length
            ? `Vinculado a ${blockers.join(" e ")}.`
            : undefined;

          return (
            <article
              key={product.id}
              className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-[120px_1fr_auto]"
            >
              {product.images[0] ? (
                <img
                  alt={product.images[0].altText ?? product.description}
                  className="aspect-square w-full rounded-md object-cover md:w-[120px]"
                  src={product.images[0].url}
                />
              ) : (
                <div className="aspect-square rounded-md bg-muted md:w-[120px]" />
              )}
              <div className="space-y-1">
                <h2 className="font-semibold">{product.description}</h2>
                <p className="text-sm text-muted-foreground">
                  {product.category.name} - {" "}
                  {formatMoneyFromCents(product.priceInCents)}
                </p>
                <p className="text-sm">
                  {product.active ? "Ativo" : "Inativo"}
                </p>
                {disabledReason ? (
                  <p className="text-xs text-muted-foreground">
                    Exclusão bloqueada: {disabledReason}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-start gap-2 md:justify-end">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/produtos/${product.id}/editar`}>
                    Editar
                  </Link>
                </Button>
                <ProductDeleteDialog
                  canDelete={blockers.length === 0}
                  disabledReason={disabledReason}
                  productDescription={product.description}
                  productId={product.id}
                />
              </div>
            </article>
          );
        })}
        {products.length === 0 ? (
          <p className="rounded-lg border border-border p-6 text-sm text-muted-foreground">
            {search || status !== "ativos"
              ? "Nenhum produto encontrado para os filtros aplicados."
              : "Nenhum produto cadastrado."}
          </p>
        ) : null}
      </div>
    </section>
  );
}