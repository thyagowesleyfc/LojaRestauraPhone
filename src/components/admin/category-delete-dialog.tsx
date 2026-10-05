"use client";

import { useRef } from "react";

import { deleteCategoryAction } from "@/actions/catalog";
import { Button } from "@/components/ui/button";

type CategoryDeleteDialogProps = {
  canDelete: boolean;
  categoryId: string;
  categoryName: string;
  disabledReason?: string;
};

export function CategoryDeleteDialog({
  canDelete,
  categoryId,
  categoryName,
  disabledReason
}: CategoryDeleteDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  if (!canDelete) {
    return (
      <Button
        aria-label={`Não é possível excluir ${categoryName}. ${disabledReason}`}
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
        aria-describedby={`delete-category-${categoryId}-description`}
        aria-labelledby={`delete-category-${categoryId}-title`}
        className="w-[min(92vw,28rem)] rounded-lg border border-border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-black/45"
        ref={dialogRef}
      >
        <div className="space-y-5 p-5">
          <div className="space-y-2">
            <h2
              className="text-lg font-semibold"
              id={`delete-category-${categoryId}-title`}
            >
              Excluir categoria?
            </h2>
            <p
              className="text-sm leading-6 text-muted-foreground"
              id={`delete-category-${categoryId}-description`}
            >
              Esta ação remove a categoria {categoryName}. A exclusão só está
              liberada porque não há produtos, promoções nem características
              vinculadas.
            </p>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <form method="dialog">
              <Button className="w-full sm:w-auto" type="submit" variant="outline">
                Cancelar
              </Button>
            </form>
            <form action={deleteCategoryAction}>
              <input name="id" type="hidden" value={categoryId} />
              <Button
                className="w-full sm:w-auto"
                type="submit"
                variant="destructive"
              >
                Excluir categoria
              </Button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}