import Link from "next/link";
import { notFound } from "next/navigation";

import { updateStoreLinkAction } from "@/actions/links";
import { FormError } from "@/components/admin/form-error";
import { StoreLinkForm } from "@/components/admin/store-link-form";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

type EditStoreLinkPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    erro?: string;
  }>;
};

export default async function EditStoreLinkPage({
  params,
  searchParams
}: EditStoreLinkPageProps) {
  const [{ id }, { erro }] = await Promise.all([params, searchParams]);
  const storeLink = await prisma.storeLink.findUnique({ where: { id } });

  if (!storeLink) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Editar link</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Atualize título, ordem, redirecionamento, descrição, imagem e status.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/links">Voltar</Link>
        </Button>
      </div>
      <FormError message={erro} />
      <StoreLinkForm
        action={updateStoreLinkAction}
        link={storeLink}
        submitLabel="Atualizar"
      />
    </section>
  );
}