import { PromotionType } from "@prisma/client";
import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/catalog/product-card";
import { PromotionCard } from "@/components/catalog/promotion-card";
import { HeroCarousel } from "@/components/public/hero-carousel";
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
  const now = new Date();
  const [settings, banners, categories, promotions] = await Promise.all([
    getStoreSettings(),
    prisma.banner.findMany({
      where: { active: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }]
    }),
    prisma.category.findMany({
      where: {
        active: true,
        products: {
          some: {
            active: true
          }
        }
      },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
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
      where: {
        active: true,
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }]
      },
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
    isPromotionCurrentlyActive(promotion, now)
  );
  const categoriesWithProducts = categories.filter(
    (category) => category.products.length > 0
  );

  return (
    <main className="pb-14">
      <HeroCarousel
        autoplaySeconds={settings.bannerTransitionSeconds}
        banners={banners}
      />

      <section className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
        <div className="space-y-8 sm:space-y-10">
          {categoriesWithProducts.map((category) => (
            <section key={category.id} className="space-y-3 sm:space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-[1.8rem] font-semibold leading-tight sm:text-[2rem]">
                  {category.name}
                </h2>
                <Link
                  className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  href={`/categorias/${category.slug}`}
                >
                  Ver mais
                </Link>
              </div>
              <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:overflow-visible lg:px-0 lg:pb-0">
                <div className="flex min-w-0 snap-x gap-3 sm:gap-4 lg:grid lg:grid-cols-4 lg:items-stretch">
                  {category.products.map((product) => (
                    <div
                      className="w-40 shrink-0 snap-start sm:w-56 md:w-64 lg:w-auto lg:shrink"
                      key={product.id}
                    >
                      <ProductCard
                        variant="compact"
                        product={{
                          ...product,
                          ...getPromotionalPriceInCents(
                            product.priceInCents,
                            category.promotions
                          )
                        }}
                      />
                    </div>
                  ))}
                </div>
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

      {activePromotions.length > 0 ? (
        <section className="border-y border-border bg-muted/30 py-10">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">
              {activePromotions.map((promotion) => (
                <PromotionCard key={promotion.id} promotion={promotion} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
