import Link from "next/link";
import { notFound } from "next/navigation";

import { updateCategoryAction } from "@/actions/catalog";
import { CategoryCharacteristicsForm } from "@/components/admin/category-characteristics-form";
import { CategoryForm } from "@/components/admin/category-form";
import { FormError } from "@/components/admin/form-error";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

type EditCategoryPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    erro?: string;
  }>;
};

export default async function EditCategoryPage({
  params,
  searchParams
}: EditCategoryPageProps) {
  const [{ id }, { erro }] = await Promise.all([params, searchParams]);
  const [category, characteristics] = await Promise.all([
    prisma.category.findUnique({
      where: { id },
      include: {
        characteristics: {
          orderBy: [{ displayOrder: "asc" }]
        }
      }
    }),
    prisma.characteristic.findMany({
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      include: {
        options: {
          where: { active: true },
          select: { id: true }
        }
      }
    })
  ]);

  if (!category) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Editar categoria</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Atualize nome, ordem, disponibilidade e caracteristicas para SKUs.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/categorias">Voltar</Link>
        </Button>
      </div>
      <FormError message={erro} />
      <CategoryForm
        action={updateCategoryAction}
        category={category}
        submitLabel="Atualizar"
      />
      <CategoryCharacteristicsForm
        category={category}
        characteristics={characteristics}
        selectedCharacteristics={category.characteristics}
      />
    </section>
  );
}