import Link from "next/link";
import { notFound } from "next/navigation";

import { updateProductAction } from "@/actions/catalog";
import { FormError } from "@/components/admin/form-error";
import { ProductForm } from "@/components/admin/product-form";
import { ProductVariantsPanel } from "@/components/admin/product-variants-panel";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    erro?: string;
  }>;
};

export default async function EditProductPage({
  params,
  searchParams
}: EditProductPageProps) {
  const [{ id }, { erro }] = await Promise.all([params, searchParams]);
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          include: {
            characteristics: {
              orderBy: [{ displayOrder: "asc" }],
              include: {
                characteristic: {
                  include: {
                    options: {
                      orderBy: [{ displayOrder: "asc" }, { name: "asc" }]
                    }
                  }
                }
              }
            }
          }
        },
        images: {
          orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }]
        },
        variants: {
          orderBy: [{ createdAt: "desc" }],
          include: {
            values: true,
            images: {
              orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }]
            }
          }
        }
      }
    }),
    prisma.category.findMany({
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }]
    })
  ]);

  if (!product) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Editar produto</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Atualize dados, imagens, status publico e SKUs do produto.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/produtos">Voltar</Link>
        </Button>
      </div>
      <FormError message={erro} />
      <ProductForm
        action={updateProductAction}
        categories={categories}
        product={product}
        submitLabel="Atualizar"
      />
      <ProductVariantsPanel
        product={product}
        categoryCharacteristics={product.category.characteristics}
        variants={product.variants}
      />
    </section>
  );
}