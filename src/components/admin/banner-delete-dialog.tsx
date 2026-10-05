"use client";

import { useRef } from "react";

import { deleteBannerAction } from "@/actions/settings";
import { Button } from "@/components/ui/button";

type BannerDeleteDialogProps = {
  bannerId: string;
  bannerName: string;
};

export function BannerDeleteDialog({
  bannerId,
  bannerName
}: BannerDeleteDialogProps) {
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
        aria-describedby={`delete-banner-${bannerId}-description`}
        aria-labelledby={`delete-banner-${bannerId}-title`}
        className="fixed left-1/2 top-1/2 m-0 max-h-[calc(100dvh-2rem)] w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-black/45"
        ref={dialogRef}
      >
        <div className="space-y-5 p-5">
          <div className="space-y-2">
            <h2
              className="text-lg font-semibold"
              id={`delete-banner-${bannerId}-title`}
            >
              Excluir banner?
            </h2>
            <p
              className="text-sm leading-6 text-muted-foreground"
              id={`delete-banner-${bannerId}-description`}
            >
              Esta ação remove o banner {bannerName} e suas imagens cadastradas.
              Esta operação não pode ser desfeita.
            </p>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <form method="dialog">
              <Button className="w-full sm:w-auto" type="submit" variant="outline">
                Cancelar
              </Button>
            </form>
            <form action={deleteBannerAction}>
              <input name="id" type="hidden" value={bannerId} />
              <Button
                className="w-full sm:w-auto"
                type="submit"
                variant="destructive"
              >
                Excluir banner
              </Button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}