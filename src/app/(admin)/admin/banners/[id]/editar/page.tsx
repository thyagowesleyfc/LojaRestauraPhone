import Link from "next/link";
import { notFound } from "next/navigation";

import { updateBannerAction } from "@/actions/settings";
import { BannerForm } from "@/components/admin/banner-form";
import { FormError } from "@/components/admin/form-error";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

type EditBannerPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    erro?: string;
  }>;
};

export default async function EditBannerPage({
  params,
  searchParams
}: EditBannerPageProps) {
  const [{ id }, { erro }] = await Promise.all([params, searchParams]);
  const banner = await prisma.banner.findUnique({ where: { id } });

  if (!banner) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Editar banner</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Atualize imagens desktop/mobile, headline, link, ordem e status.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/banners">Voltar</Link>
        </Button>
      </div>
      <FormError message={erro} />
      <BannerForm
        action={updateBannerAction}
        banner={banner}
        submitLabel="Atualizar"
      />
    </section>
  );
}
