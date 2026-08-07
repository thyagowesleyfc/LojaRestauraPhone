import Link from "next/link";

import { createBannerAction } from "@/actions/settings";
import { BannerForm } from "@/components/admin/banner-form";
import { FormError } from "@/components/admin/form-error";
import { Button } from "@/components/ui/button";

type NewBannerPageProps = {
  searchParams: Promise<{
    erro?: string;
  }>;
};

export default async function NewBannerPage({
  searchParams
}: NewBannerPageProps) {
  const { erro } = await searchParams;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Novo banner</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Envie as imagens desktop/mobile e defina headline, link e ordem.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/banners">Voltar</Link>
        </Button>
      </div>
      <FormError message={erro} />
      <BannerForm action={createBannerAction} submitLabel="Salvar" />
    </section>
  );
}
