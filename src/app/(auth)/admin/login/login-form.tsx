"use client";

import { useActionState, useState } from "react";

import {
  loginAction,
  requestPasswordResetAction,
  type ForgotPasswordActionState,
  type LoginActionState
} from "@/actions/auth";
import { Button } from "@/components/ui/button";

const initialLoginState: LoginActionState = {};
const initialRecoveryState: ForgotPasswordActionState = {};

type LoginFormProps = {
  successMessage?: string;
};

export function LoginForm({ successMessage }: LoginFormProps) {
  const [loginState, loginFormAction, loginPending] = useActionState(
    loginAction,
    initialLoginState
  );
  const [recoveryState, recoveryFormAction, recoveryPending] = useActionState(
    requestPasswordResetAction,
    initialRecoveryState
  );
  const [dismissedRecoveryDialog, setDismissedRecoveryDialog] = useState(false);
  const showRecoveryDialog =
    Boolean(recoveryState.success) && !dismissedRecoveryDialog;

  return (
    <>
      <form action={loginFormAction} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-medium" htmlFor="password">
              Senha
            </label>
            <button
              className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              disabled={loginPending || recoveryPending}
              formAction={recoveryFormAction}
              onClick={() => setDismissedRecoveryDialog(false)}
              formNoValidate
              type="submit"
            >
              {recoveryPending ? "Enviando..." : "Esqueci a senha"}
            </button>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>
        {successMessage ? (
          <p className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-foreground">
            {successMessage}
          </p>
        ) : null}
        {loginState.error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {loginState.error}
          </p>
        ) : null}
        {recoveryState.error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {recoveryState.error}
          </p>
        ) : null}
        <Button className="w-full" type="submit" disabled={loginPending}>
          {loginPending ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      {showRecoveryDialog && recoveryState.success ? (
        <div
          aria-labelledby="password-recovery-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm"
          role="dialog"
        >
          <div className="w-full max-w-sm rounded-lg border border-border bg-card p-5 text-card-foreground shadow-xl">
            <p
              className="text-lg font-semibold"
              id="password-recovery-title"
            >
              E-mail enviado
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {recoveryState.success} Verifique a caixa de entrada e siga o link
              para criar uma nova senha.
            </p>
            <Button
              className="mt-5 w-full"
              onClick={() => setDismissedRecoveryDialog(true)}
              type="button"
            >
              Entendi
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}