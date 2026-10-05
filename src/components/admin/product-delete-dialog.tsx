"use client";

import { useRef } from "react";

import { deleteProductAction } from "@/actions/catalog";
import { Button } from "@/components/ui/button";

type ProductDeleteDialogProps = {
  canDelete: boolean;
  disabledReason?: string;
  productDescription: string;
  productId: string;
};

export function ProductDeleteDialog({
  canDelete,
  disabledReason,
  productDescription,
  productId
}: ProductDeleteDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  if (!canDelete) {
    return (
      <Button
        aria-label={`Não é possível excluir ${productDescription}. ${disabledReason}`}
        disabled
        size="sm"
        title={disabledReason}
        type="button"
        variant="destructive"
      >
        Excluir
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={() => dialogRef.current?.showModal()}
        size="sm"
        type="button"
        variant="destructive"
      >
        Excluir
      </Button>
      <dialog
        aria-describedby={`delete-product-${productId}-description`}
        aria-labelledby={`delete-product-${productId}-title`}
        className="w-[min(92vw,28rem)] rounded-lg border border-border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-black/45"
        ref={dialogRef}
      >
        <div className="space-y-5 p-5">
          <div className="space-y-2">
            <h2
              className="text-lg font-semibold"
              id={`delete-product-${productId}-title`}
            >
              Excluir produto?
            </h2>
            <p
              className="text-sm leading-6 text-muted-foreground"
              id={`delete-product-${productId}-description`}
            >
              Esta ação remove o produto {productDescription} e suas imagens do
              catálogo. A exclusão só está liberada porque não há SKUs nem
              promoções vinculadas.
            </p>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <form method="dialog">
              <Button className="w-full sm:w-auto" type="submit" variant="outline">
                Cancelar
              </Button>
            </form>
            <form action={deleteProductAction}>
              <input name="id" type="hidden" value={productId} />
              <Button
                className="w-full sm:w-auto"
                type="submit"
                variant="destructive"
              >
                Excluir produto
              </Button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}