"use client";

import { useRef } from "react";

import { deleteStoreLinkAction } from "@/actions/links";
import { Button } from "@/components/ui/button";

type StoreLinkDeleteDialogProps = {
  linkId: string;
  linkTitle: string;
};

export function StoreLinkDeleteDialog({
  linkId,
  linkTitle
}: StoreLinkDeleteDialogProps) {
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
        aria-describedby={`delete-store-link-${linkId}-description`}
        aria-labelledby={`delete-store-link-${linkId}-title`}
        className="fixed left-1/2 top-1/2 m-0 max-h-[calc(100dvh-2rem)] w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-black/45"
        ref={dialogRef}
      >
        <div className="space-y-5 p-5">
          <div className="space-y-2">
            <h2
              className="text-lg font-semibold"
              id={`delete-store-link-${linkId}-title`}
            >
              Excluir link?
            </h2>
            <p
              className="text-sm leading-6 text-muted-foreground"
              id={`delete-store-link-${linkId}-description`}
            >
              Esta ação remove o link {linkTitle} e sua imagem cadastrada. Esta
              operação não pode ser desfeita.
            </p>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <form method="dialog">
              <Button className="w-full sm:w-auto" type="submit" variant="outline">
                Cancelar
              </Button>
            </form>
            <form action={deleteStoreLinkAction}>
              <input name="id" type="hidden" value={linkId} />
              <Button
                className="w-full sm:w-auto"
                type="submit"
                variant="destructive"
              >
                Excluir link
              </Button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}