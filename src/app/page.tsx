import { PromotionType } from "@prisma/client";
import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/catalog/product-card";
import { PromotionCard } from "@/components/catalog/promotion-card";
import { HeroCarousel } from "@/components/public/hero-carousel";
import { Button } from "@/components/ui/button";
import {
  getPromotionalPriceInCents,
  isPromotionCurrentlyActive
} from "@/lib/promotions";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/store-settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();

  return {
    title: `${settings.tradeName} | Catalogo e promocoes`,
    description: `Veja categorias, produtos e promocoes da ${settings.tradeName}.`
  };
}

export default async function Home() {
  const [settings, banners, categories, promotions] = await Promise.all([
    getStoreSettings(),
    prisma.banner.findMany({
      where: { active: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }]
    }),
    prisma.category.findMany({
      where: { active: true },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      take: 6,
      include: {
        promotions: {
          where: {
            type: PromotionType.CATEGORY_PERCENTAGE,
            active: true
          }
        },
        products: {
          where: { active: true },
          orderBy: [{ createdAt: "desc" }],
          take: 4,
          include: {
            images: {
              orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
              take: 1
            }
          }
        }
      }
    }),
    prisma.promotion.findMany({
      where: { active: true },
      orderBy: [{ createdAt: "desc" }],
      take: 6,
      include: {
        category: true,
        images: {
          orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
          take: 1
        },
        products: {
          include: { product: true },
          orderBy: [{ displayOrder: "asc" }]
        }
      }
    })
  ]);
  const activePromotions = promotions.filter((promotion) =>
    isPromotionCurrentlyActive(promotion)
  );
  const categoriesWithProducts = categories.filter(
    (category) => category.products.length > 0
  );

  return (
    <main className="pb-14">
      <HeroCarousel
        autoplaySeconds={settings.bannerTransitionSeconds}
        banners={banners}
        fallbackTitle={settings.tradeName}
      />

      <section className="mx-auto w-full max-w-6xl space-y-6 px-6 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold tracking-[-0.02em]">
              Categorias
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Navegue pelas secoes ativas do catalogo e confira os itens mais
              recentes de cada uma.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/categorias">Todas as categorias</Link>
          </Button>
        </div>
        <div className="space-y-10">
          {categoriesWithProducts.map((category) => (
            <section key={category.id} className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-xl font-semibold">{category.name}</h3>
                <Link
                  className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  href={`/categorias/${category.slug}`}
                >
                  Ver categoria
                </Link>
              </div>
              <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {category.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      ...product,
                      ...getPromotionalPriceInCents(
                        product.priceInCents,
                        category.promotions
                      )
                    }}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
        {categoriesWithProducts.length === 0 ? (
          <p className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
            Nenhum produto ativo em destaque no momento.
          </p>
        ) : null}
      </section>

      <section className="border-y border-border bg-muted/30 py-14">
        <div className="mx-auto w-full max-w-6xl space-y-6 px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-[-0.02em]">
                Promocoes
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                Descontos por categoria e combos ativos recalculados no servidor.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/promocoes">Todas as promocoes</Link>
            </Button>
          </div>
          <div className="grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">
            {activePromotions.map((promotion) => (
              <PromotionCard key={promotion.id} promotion={promotion} />
            ))}
          </div>
          {activePromotions.length === 0 ? (
            <p className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
              Nenhuma promocao ativa no momento.
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}