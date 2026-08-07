import Link from "next/link";
import { notFound } from "next/navigation";

import { updatePromotionAction } from "@/actions/promotions";
import { FormError } from "@/components/admin/form-error";
import { PromotionForm } from "@/components/admin/promotion-form";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

type EditPromotionPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    erro?: string;
  }>;
};

export default async function EditPromotionPage({
  params,
  searchParams
}: EditPromotionPageProps) {
  const [{ id }, { erro }] = await Promise.all([params, searchParams]);
  const [promotion, categories, products] = await Promise.all([
    prisma.promotion.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }]
        },
        products: {
          orderBy: [{ displayOrder: "asc" }]
        }
      }
    }),
    prisma.category.findMany({
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }]
    }),
    prisma.product.findMany({
      orderBy: [{ description: "asc" }]
    })
  ]);

  if (!promotion) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Editar promocao</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Atualize regra, produtos, periodo, imagens e status publico.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/promocoes">Voltar</Link>
        </Button>
      </div>
      <FormError message={erro} />
      <PromotionForm
        action={updatePromotionAction}
        categories={categories}
        products={products}
        promotion={promotion}
        submitLabel="Atualizar"
      />
    </section>
  );
}
