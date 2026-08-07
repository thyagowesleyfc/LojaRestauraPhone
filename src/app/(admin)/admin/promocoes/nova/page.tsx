import Link from "next/link";

import { createPromotionAction } from "@/actions/promotions";
import { FormError } from "@/components/admin/form-error";
import { PromotionForm } from "@/components/admin/promotion-form";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

type NewPromotionPageProps = {
  searchParams: Promise<{
    erro?: string;
  }>;
};

export default async function NewPromotionPage({
  searchParams
}: NewPromotionPageProps) {
  const [{ erro }, categories, products] = await Promise.all([
    searchParams,
    prisma.category.findMany({
      where: { active: true },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }]
    }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: [{ description: "asc" }]
    })
  ]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Nova promocao</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Cadastre desconto por categoria ou combo com preco fixo.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/promocoes">Voltar</Link>
        </Button>
      </div>
      <FormError message={erro} />
      <PromotionForm
        action={createPromotionAction}
        categories={categories}
        products={products}
        submitLabel="Salvar"
      />
    </section>
  );
}
