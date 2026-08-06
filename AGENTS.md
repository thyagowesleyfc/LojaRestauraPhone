# AGENTS.md — RestauraPhone

## Fonte de verdade

As especificações estão em `docs/specs`.

Antes de implementar:

1. leia `docs/specs/README.md`;
2. consulte os documentos relacionados;
3. siga `09-planejamento-de-implementacao.md`;
4. respeite `11-decisoes-e-pendencias.md`.

## Stack

- Next.js App Router;
- TypeScript estrito;
- Tailwind CSS;
- shadcn/ui;
- Prisma;
- PostgreSQL;
- Zod;
- Cloudinary;
- Heroku.

## Restrições

- não criar monorepo;
- não criar backend separado;
- não exigir Docker;
- não usar SQLite;
- não adicionar dependências sem necessidade;
- não implementar fases futuras;
- não implementar pagamento, estoque ou cadastro de clientes;
- não implementar o módulo de manutenção neste MVP.

## Forma de trabalho

- trabalhar uma fase por vez;
- inspecionar antes de alterar;
- preferir soluções simples;
- não criar abstrações prematuras;
- usar transações nas alterações relacionais;
- validar entradas com Zod;
- manter regras de negócio fora dos componentes visuais;
- atualizar o checklist apenas com itens realmente concluídos.

## Verificações

Ao terminar uma fase:

- executar lint;
- executar testes existentes;
- executar build;
- corrigir erros;
- informar arquivos alterados, decisões e pendências;
- não avançar automaticamente.
