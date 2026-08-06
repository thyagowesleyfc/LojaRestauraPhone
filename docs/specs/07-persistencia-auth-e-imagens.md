# 07 — Persistência, autenticação e imagens

## PostgreSQL

Usar PostgreSQL no desenvolvimento e na produção.

A aplicação deve funcionar com qualquer URL PostgreSQL compatível com Prisma.

Não exigir Docker. O desenvolvedor pode usar:

- PostgreSQL instalado localmente;
- banco remoto de desenvolvimento;
- Heroku Postgres.

## Prisma

Scripts esperados:

- `prisma:generate`;
- `prisma:migrate` para desenvolvimento;
- `prisma:deploy` para produção;
- `prisma:seed`;
- `prisma:studio`.

## Seed

Seed idempotente:

- administrador inicial por variáveis de ambiente;
- seis categorias iniciais;
- configurações padrão da loja.

## Autenticação

- um perfil administrativo simples;
- login por e-mail e senha;
- sessão persistida em tabela;
- token aleatório armazenado em cookie;
- somente hash do token salvo no banco;
- logout revoga a sessão;
- sessões expiradas devem ser rejeitadas.

## Imagens

Usar Cloudinary.

O banco armazena:

- URL;
- `publicId`;
- ordem;
- texto alternativo.

Regras:

- validar formatos permitidos;
- limitar tamanho por arquivo;
- no máximo seis imagens por produto;
- excluir imagem do Cloudinary quando removida definitivamente;
- não salvar uploads em disco local do Heroku.
