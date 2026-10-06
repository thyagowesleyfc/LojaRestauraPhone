import Link from "next/link";

import { createStoreLinkAction } from "@/actions/links";
import { FormError } from "@/components/admin/form-error";
import { StoreLinkForm } from "@/components/admin/store-link-form";
import { Button } from "@/components/ui/button";

type NewStoreLinkPageProps = {
  searchParams: Promise<{
    erro?: string;
  }>;
};

export default async function NewStoreLinkPage({
  searchParams
}: NewStoreLinkPageProps) {
  const { erro } = await searchParams;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Novo link</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Configure o botão que será exibido na página pública de links.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/links">Voltar</Link>
        </Button>
      </div>
      <FormError message={erro} />
      <StoreLinkForm action={createStoreLinkAction} submitLabel="Salvar" />
    </section>
  );
}