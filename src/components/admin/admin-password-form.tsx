import { changeAdminPasswordAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";

type AdminPasswordFormProps = {
  error?: string;
  success?: string;
};

export function AdminPasswordForm({ error, success }: AdminPasswordFormProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 text-card-foreground">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Alteração de senha</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Atualize a senha do perfil administrador autenticado.
        </p>
      </div>
      <form
        action={changeAdminPasswordAction}
        className="mt-5 grid gap-4 sm:max-w-xl"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="currentPassword">
            Senha atual
          </label>
          <input
            autoComplete="current-password"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            id="currentPassword"
            name="currentPassword"
            required
            type="password"
          />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="newPassword">
              Nova senha
            </label>
            <input
              autoComplete="new-password"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              id="newPassword"
              minLength={8}
              name="newPassword"
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
        </div>
        {error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-foreground">
            {success}
          </p>
        ) : null}
        <Button className="w-full sm:w-fit" type="submit">
          Salvar nova senha
        </Button>
      </form>
    </section>
  );
}