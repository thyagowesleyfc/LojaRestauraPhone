"use client";

import { useRef } from "react";

import { deletePromotionAction } from "@/actions/promotions";
import { Button } from "@/components/ui/button";

type PromotionDeleteDialogProps = {
  promotionDescription: string;
  promotionId: string;
};

export function PromotionDeleteDialog({
  promotionDescription,
  promotionId
}: PromotionDeleteDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

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
        aria-describedby={`delete-promotion-${promotionId}-description`}
        aria-labelledby={`delete-promotion-${promotionId}-title`}
        className="fixed left-1/2 top-1/2 m-0 max-h-[calc(100dvh-2rem)] w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-black/45"
        ref={dialogRef}
      >
        <div className="space-y-5 p-5">
          <div className="space-y-2">
            <h2
              className="text-lg font-semibold"
              id={`delete-promotion-${promotionId}-title`}
            >
              Excluir promoção?
            </h2>
            <p
              className="text-sm leading-6 text-muted-foreground"
              id={`delete-promotion-${promotionId}-description`}
            >
              Esta ação remove a promoção {promotionDescription}, suas imagens e
              vínculos com produtos ou categoria. Esta operação não pode ser
              desfeita.
            </p>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <form method="dialog">
              <Button className="w-full sm:w-auto" type="submit" variant="outline">
                Cancelar
              </Button>
            </form>
            <form action={deletePromotionAction}>
              <input name="id" type="hidden" value={promotionId} />
              <Button
                className="w-full sm:w-auto"
                type="submit"
                variant="destructive"
              >
                Excluir promoção
              </Button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}