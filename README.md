# LojaRestauraPhone

Aplicacao unica em Next.js App Router para o MVP da RestauraPhone.

## Requisitos

- Node.js 24 ou compativel com Next.js;
- PostgreSQL acessivel por `DATABASE_URL`;
- npm.

## Configuracao local

1. Instale as dependencias:

   ```bash
   npm install
   ```

2. Copie `.env.example` para `.env` e ajuste os valores:

   ```bash
   cp .env.example .env
   ```

3. Configure obrigatoriamente:

   - `DATABASE_URL`: URL PostgreSQL real;
   - `ADMIN_EMAIL`: e-mail do administrador inicial;
   - `ADMIN_PASSWORD`: senha inicial do administrador;
   - `SESSION_SECRET`: segredo com pelo menos 32 caracteres.

4. Gere o Prisma Client:

   ```bash
   npm run prisma:generate
   ```

5. Aplique as migrations no banco de desenvolvimento:

   ```bash
   npm run prisma:migrate
   ```

6. Execute o seed idempotente:

   ```bash
   npm run prisma:seed
   ```

7. Inicie o ambiente de desenvolvimento:

   ```bash
   npm run dev
   ```

8. Acesse `http://localhost:3000`.

## Administracao

- Login administrativo: `http://localhost:3000/admin/login`;
- Painel protegido: `http://localhost:3000/admin`;
- Usuario autenticado: `GET /api/auth/me`;
- Login via API: `POST /api/auth/login`;
- Logout via API: `POST /api/auth/logout`.

## Scripts

- `npm run dev`: inicia o Next.js em desenvolvimento;
- `npm run lint`: executa ESLint;
- `npm run build`: gera build de producao;
- `npm test`: executa testes automatizados;
- `npm run prisma:generate`: gera Prisma Client;
- `npm run prisma:migrate`: executa migrations em desenvolvimento;
- `npm run prisma:deploy`: aplica migrations em producao;
- `npm run prisma:seed`: executa seed;
- `npm run prisma:studio`: abre Prisma Studio.
