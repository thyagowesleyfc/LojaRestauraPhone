# 05 â€” Arquitetura tÃ©cnica

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

## OrganizaÃ§Ã£o

AplicaÃ§Ã£o Ãºnica:

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

- usar Server Components por padrÃ£o;
- usar Client Components somente quando houver interaÃ§Ã£o;
- usar Server Actions ou Route Handlers para mutaÃ§Ãµes;
- evitar camada de serviÃ§os abstrata sem necessidade;
- centralizar Prisma, autenticaÃ§Ã£o, Cloudinary e validaÃ§Ãµes em `src/lib`;
- usar Zod na entrada de dados;
- manter lÃ³gica de regra de negÃ³cio fora dos componentes visuais;
- usar transaÃ§Ãµes para operaÃ§Ãµes com relacionamentos e imagens.

## SeguranÃ§a

- sessÃ£o em cookie HTTP-only;
- `secure` em produÃ§Ã£o;
- `sameSite=lax`;
- hash de token de sessÃ£o no banco;
- senhas nunca retornadas pela API;
- validaÃ§Ã£o de MIME, tamanho e quantidade de imagens;
- sanitizaÃ§Ã£o do conteÃºdo exibido;
- proteÃ§Ã£o das rotas `/admin` e mutaÃ§Ãµes administrativas.

## Qualidade mÃ­nima

- TypeScript;
- ESLint padrÃ£o do projeto;
- build obrigatÃ³rio antes de merge/deploy;
- testes focados nas regras crÃ­ticas;
- sem configuraÃ§Ã£o excessiva de lint, formatting ou commits.

## Diretriz de frontend

- Ao trabalhar com frontend, usar a skill impeccable quando disponivel; se nao estiver instalada, registrar a indisponibilidade e seguir as diretrizes visuais do projeto.
