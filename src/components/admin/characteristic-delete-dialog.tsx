"use client";

import { useRef } from "react";

import { deleteCharacteristicAction } from "@/actions/characteristics";
import { Button } from "@/components/ui/button";

type CharacteristicDeleteDialogProps = {
  canDelete: boolean;
  characteristicId: string;
  characteristicName: string;
  disabledReason?: string;
};

export function CharacteristicDeleteDialog({
  canDelete,
  characteristicId,
  characteristicName,
  disabledReason
}: CharacteristicDeleteDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  if (!canDelete) {
    return (
      <Button
        aria-label={`Não é possível excluir ${characteristicName}. ${disabledReason}`}
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
        aria-describedby={`delete-characteristic-${characteristicId}-description`}
        aria-labelledby={`delete-characteristic-${characteristicId}-title`}
        className="fixed left-1/2 top-1/2 m-0 max-h-[calc(100dvh-2rem)] w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-black/45"
        ref={dialogRef}
      >
        <div className="space-y-5 p-5">
          <div className="space-y-2">
            <h2
              className="text-lg font-semibold"
              id={`delete-characteristic-${characteristicId}-title`}
            >
              Excluir característica?
            </h2>
            <p
              className="text-sm leading-6 text-muted-foreground"
              id={`delete-characteristic-${characteristicId}-description`}
            >
              Esta ação remove a característica {characteristicName}. A exclusão
              só está liberada porque não há opções, categorias nem SKUs
              vinculados.
            </p>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <form method="dialog">
              <Button className="w-full sm:w-auto" type="submit" variant="outline">
                Cancelar
              </Button>
            </form>
            <form action={deleteCharacteristicAction}>
              <input name="id" type="hidden" value={characteristicId} />
              <Button
                className="w-full sm:w-auto"
                type="submit"
                variant="destructive"
              >
                Excluir característica
              </Button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}
