"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

type ConfirmSubmitButtonProps = {
  cancelLabel?: string;
  children: ReactNode;
  confirmLabel?: string;
  description: string;
  title: string;
};

export function ConfirmSubmitButton({
  cancelLabel = "Cancelar",
  children,
  confirmLabel = "Confirmar",
  description,
  title
}: ConfirmSubmitButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const shouldSubmitRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const form = triggerRef.current?.form;

    if (!form) {
      return;
    }

    function handleSubmit(event: SubmitEvent) {
      if (shouldSubmitRef.current) {
        shouldSubmitRef.current = false;
        return;
      }

      event.preventDefault();
      dialogRef.current?.showModal();
    }

    form.addEventListener("submit", handleSubmit);

    return () => {
      form.removeEventListener("submit", handleSubmit);
    };
  }, []);

  function openConfirmation() {
    const form = triggerRef.current?.form;

    if (!form?.reportValidity()) {
      return;
    }

    dialogRef.current?.showModal();
  }

  function closeConfirmation() {
    dialogRef.current?.close();
    triggerRef.current?.focus();
  }

  function confirmSubmit() {
    const form = triggerRef.current?.form;

    if (!form) {
      return;
    }

    setIsSubmitting(true);
    shouldSubmitRef.current = true;
    dialogRef.current?.close();
    form.requestSubmit();
  }

  return (
    <>
      <Button onClick={openConfirmation} ref={triggerRef} type="button">
        {children}
      </Button>
      <dialog
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        className="fixed left-1/2 top-1/2 m-0 max-h-[calc(100dvh-2rem)] w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-black/45"
        ref={dialogRef}
      >
        <div className="space-y-5 p-5">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold" id={titleId}>
              {title}
            </h2>
            <p
              className="text-sm leading-6 text-muted-foreground"
              id={descriptionId}
            >
              {description}
            </p>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              className="w-full sm:w-auto"
              onClick={closeConfirmation}
              type="button"
              variant="outline"
            >
              {cancelLabel}
            </Button>
            <Button
              className="w-full sm:w-auto"
              disabled={isSubmitting}
              onClick={confirmSubmit}
              type="button"
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
