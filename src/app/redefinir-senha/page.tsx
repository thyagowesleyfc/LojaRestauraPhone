import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ResetPasswordForm } from "./reset-password-form";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function ResetPasswordPage({
  searchParams
}: ResetPasswordPageProps) {
  const { token } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="w-full max-w-sm space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            Redefinição de senha
          </p>
          <h1 className="text-3xl font-semibold">Criar nova senha</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Informe uma nova senha para acessar o painel administrativo.
          </p>
        </div>
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div className="space-y-4 rounded-lg border border-border bg-card p-4 text-card-foreground">
            <p className="text-sm leading-6 text-muted-foreground">
              Link de redefinição ausente. Solicite um novo link na tela de
              login.
            </p>
            <Button asChild className="w-full" variant="outline">
              <Link href="/admin/login">Voltar para o login</Link>
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}