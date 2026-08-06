# 05 — Arquitetura técnica

## Stack

- Next.js com App Router;
- TypeScript estrito;
- Tailwind CSS;
- shadcn/ui;
- Prisma;
- PostgreSQL;
- Zod;
- Argon2 ou bcrypt para senhas;
- Cloudinary para imagens;
- Heroku para hospedagem.

## Organização

Aplicação única:

```text
src/
  app/
    (public)/
    admin/
    api/
  components/
  lib/
  actions/
  schemas/
prisma/
public/
docs/specs/
```

## Diretrizes

- usar Server Components por padrão;
- usar Client Components somente quando houver interação;
- usar Server Actions ou Route Handlers para mutações;
- evitar camada de serviços abstrata sem necessidade;
- centralizar Prisma, autenticação, Cloudinary e validações em `src/lib`;
- usar Zod na entrada de dados;
- manter lógica de regra de negócio fora dos componentes visuais;
- usar transações para operações com relacionamentos e imagens.

## Segurança

- sessão em cookie HTTP-only;
- `secure` em produção;
- `sameSite=lax`;
- hash de token de sessão no banco;
- senhas nunca retornadas pela API;
- validação de MIME, tamanho e quantidade de imagens;
- sanitização do conteúdo exibido;
- proteção das rotas `/admin` e mutações administrativas.

## Qualidade mínima

- TypeScript;
- ESLint padrão do projeto;
- build obrigatório antes de merge/deploy;
- testes focados nas regras críticas;
- sem configuração excessiva de lint, formatting ou commits.
