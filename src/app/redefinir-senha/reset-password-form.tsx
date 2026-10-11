"use client";

import { useActionState } from "react";

import {
  resetPasswordAction,
  type ResetPasswordActionState
} from "@/actions/auth";
import { Button } from "@/components/ui/button";

const initialState: ResetPasswordActionState = {};

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      <input name="token" type="hidden" value={token} />
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="password">
          Nova senha
        </label>
        <input
          autoComplete="new-password"
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          id="password"
          minLength={8}
          name="password"
          required
          type="password"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="confirmPassword">
          Confirmar nova senha
        </label>
        <input
          autoComplete="new-password"
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          id="confirmPassword"
          minLength={8}
          name="confirmPassword"
          required
          type="password"
        />
      </div>
      {state.error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Redefinindo..." : "Redefinir senha"}
      </Button>
    </form>
  );
}