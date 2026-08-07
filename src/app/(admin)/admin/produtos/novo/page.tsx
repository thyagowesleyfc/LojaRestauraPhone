import Link from "next/link";

import { createProductAction } from "@/actions/catalog";
import { FormError } from "@/components/admin/form-error";
import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

type NewProductPageProps = {
  searchParams: Promise<{
    erro?: string;
  }>;
};

export default async function NewProductPage({
  searchParams
}: NewProductPageProps) {
  const [{ erro }, categories] = await Promise.all([
    searchParams,
    prisma.category.findMany({
      where: { active: true },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }]
    })
  ]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Novo produto</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Cadastre dados comerciais e envie de 1 a 6 imagens.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/produtos">Voltar</Link>
        </Button>
      </div>
      <FormError message={erro} />
      <ProductForm
        action={createProductAction}
        categories={categories}
        submitLabel="Salvar"
      />
    </section>
  );
}
