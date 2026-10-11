import { redirect } from "next/navigation";

import { getCurrentAdminUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

type LoginPageProps = {
  searchParams: Promise<{
    senha?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [user, resolvedSearchParams] = await Promise.all([
    getCurrentAdminUser(),
    searchParams
  ]);

  if (user) {
    redirect("/admin");
  }

  const successMessage =
    resolvedSearchParams.senha === "redefinida"
      ? "Senha redefinida com sucesso. Acesse novamente para continuar."
      : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="w-full max-w-sm space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            RestauraPhone
          </p>
          <h1 className="text-3xl font-semibold">Painel administrativo</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Acesse com o e-mail e a senha do administrador.
          </p>
        </div>
        <LoginForm successMessage={successMessage} />
      </section>
    </main>
  );
}