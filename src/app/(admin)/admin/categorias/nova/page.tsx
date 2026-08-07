import Link from "next/link";

import { createCategoryAction } from "@/actions/catalog";
import { CategoryForm } from "@/components/admin/category-form";
import { FormError } from "@/components/admin/form-error";
import { Button } from "@/components/ui/button";

type NewCategoryPageProps = {
  searchParams: Promise<{
    erro?: string;
  }>;
};

export default async function NewCategoryPage({
  searchParams
}: NewCategoryPageProps) {
  const { erro } = await searchParams;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Nova categoria</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Cadastre uma secao do catalogo publico.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/categorias">Voltar</Link>
        </Button>
      </div>
      <FormError message={erro} />
      <CategoryForm action={createCategoryAction} submitLabel="Salvar" />
    </section>
  );
}
