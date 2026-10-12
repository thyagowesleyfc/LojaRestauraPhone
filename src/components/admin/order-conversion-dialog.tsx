"use client";

import { useRef } from "react";

import { markOrderConversionAction } from "@/actions/orders";
import { Button } from "@/components/ui/button";

type OrderConversionDialogProps = {
  converted: boolean;
  orderCode: string;
};

export function OrderConversionDialog({
  converted,
  orderCode
}: OrderConversionDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  if (converted) {
    return (
      <Button disabled type="button" variant="secondary">
        Conversão marcada
      </Button>
    );
  }

  return (
    <>
      <Button onClick={() => dialogRef.current?.showModal()} type="button">
        Marcar conversão
      </Button>
      <dialog
        aria-describedby={`order-conversion-${orderCode}-description`}
        aria-labelledby={`order-conversion-${orderCode}-title`}
        className="fixed left-1/2 top-1/2 m-0 max-h-[calc(100dvh-2rem)] w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-black/45"
        ref={dialogRef}
      >
        <div className="space-y-5 p-5">
          <div className="space-y-2">
            <h2
              className="text-lg font-semibold"
              id={`order-conversion-${orderCode}-title`}
            >
              Marcar conversão?
            </h2>
            <p
              className="text-sm leading-6 text-muted-foreground"
              id={`order-conversion-${orderCode}-description`}
            >
              Confirme se o pedido {orderCode} realmente virou venda. Essa
              marcação será usada no funil de marketing.
            </p>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <form method="dialog">
              <Button className="w-full sm:w-auto" type="submit" variant="outline">
                Cancelar
              </Button>
            </form>
            <form action={markOrderConversionAction}>
              <input name="code" type="hidden" value={orderCode} />
              <Button className="w-full sm:w-auto" type="submit">
                Marcar conversão
              </Button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}