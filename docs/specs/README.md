# RestauraPhone — Especificações v2

Pacote de especificações para implementação via Codex CLI.

## Objetivo

Construir uma aplicação web simples, responsiva e pronta para produção para a loja RestauraPhone, com catálogo público, promoções, carrinho e fechamento de pedido pelo WhatsApp, além de painel administrativo.

## Arquitetura adotada

- Next.js com App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma ORM
- PostgreSQL
- Cloudinary para imagens
- Autenticação administrativa por sessão em cookie HTTP-only
- Deploy no Heroku
- Integração GitHub → Heroku para CI/CD simples

## Princípios

- aplicação única, sem monorepo;
- sem backend separado;
- sem Docker obrigatório;
- sem microserviços;
- sem controle de estoque;
- sem pagamento online;
- sem cadastro de clientes;
- foco em MVP comercial.

## Documentos

1. `01-visao-e-escopo.md`
2. `02-requisitos-funcionais.md`
3. `03-regras-de-negocio.md`
4. `04-modelo-de-dominio.md`
5. `05-arquitetura-tecnica.md`
6. `06-ux-ui-e-navegacao.md`
7. `07-persistencia-auth-e-imagens.md`
8. `08-deploy-ci-cd-e-operacao.md`
9. `09-planejamento-de-implementacao.md`
10. `10-prompt-inicial-codex.md`
11. `11-decisoes-e-pendencias.md`
12. `AGENTS.md`
