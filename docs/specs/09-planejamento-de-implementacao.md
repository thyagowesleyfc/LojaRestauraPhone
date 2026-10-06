# 09 - Planejamento de implementacao

Cada fase deve ser executada e validada separadamente. O Codex nao deve avancar automaticamente.

## Fase 0 - Fundacao

- [x] criar projeto Next.js com TypeScript e App Router;
- [x] configurar Tailwind;
- [x] instalar e configurar shadcn/ui;
- [x] configurar ESLint padrao;
- [x] criar estrutura inicial de pastas;
- [x] configurar Prisma para PostgreSQL;
- [x] configurar validacao de ambiente com Zod;
- [x] criar pagina inicial minima;
- [x] criar rota de health check;
- [x] criar `.env.example`;
- [x] documentar execucao local;
- [x] validar lint e build.

## Fase 1 - Banco e autenticacao

- [x] implementar schema Prisma completo;
- [x] criar migration inicial;
- [x] criar seed idempotente;
- [x] implementar login, sessao, logout e protecao de rotas;
- [x] criar tela minima de login;
- [x] criar layout administrativo protegido;
- [x] testar autenticacao;
- [x] validar migration e seed em PostgreSQL real.

## Fase 2 - Categorias e produtos

- [ ] CRUD de categorias;
- [ ] ordenacao e ativacao de categorias;
- [ ] CRUD de produtos;
- [ ] upload e ordenacao de imagens via Cloudinary;
- [ ] validacao de 1 a 6 imagens;
- [ ] listagem administrativa;
- [ ] paginas publicas de categorias e produtos.

## Fase 3 - Promocoes

- [x] CRUD de promocoes;
- [x] promocao percentual por categoria;
- [x] promocao de combo;
- [x] galeria da promocao;
- [x] calculo de preco promocional;
- [x] regras de nao cumulatividade;
- [x] paginas publicas de promocoes.

## Fase 4 - Banners e configuracoes

- [x] CRUD de banners;
- [x] ordenacao de banners;
- [x] configuracoes institucionais;
- [x] Quem somos;
- [x] rodape;
- [x] WhatsApp;
- [x] logo;
- [x] cores de tema;
- [x] mapa.

## Fase 5 - Home e navegacao publica

- [x] menu responsivo;
- [x] hero em carrossel;
- [x] secao de categorias;
- [x] secao de promocoes;
- [x] rodape;
- [x] botoes flutuantes;
- [x] tema claro e escuro;
- [x] SEO basico e metadados;
- [x] página pública de links e cadastro administrativo de Meus Links.

## Fase 6 - Carrinho, pedidos e WhatsApp

- [x] carrinho em localStorage;
- [x] produtos, SKUs/variantes e combos;
- [x] quantidades e remocao;
- [x] revalidacao de precos;
- [x] persistencia do pedido enviado ao WhatsApp;
- [x] codigo unico de pedido;
- [x] mensagem curta de WhatsApp com codigo do pedido;
- [x] listagem e detalhe administrativo de pedidos;
- [x] confirmacao de envio;
- [x] limpeza do carrinho;
- [x] testes das regras criticas.

## Fase 7 - Producao

- [ ] preparar Heroku;
- [ ] configurar PostgreSQL de producao;
- [ ] configurar Cloudinary;
- [ ] configurar variaveis de ambiente;
- [ ] configurar GitHub Actions;
- [ ] configurar deploy automatico;
- [ ] executar migrations no release;
- [ ] revisar seguranca;
- [ ] validar responsividade;
- [ ] executar smoke test de producao.

## Criterios globais

Ao concluir cada fase:

- executar lint;
- executar testes existentes;
- executar build;
- corrigir erros;
- atualizar checklist;
- listar arquivos alterados;
- registrar decisoes e pendencias;
- nao avancar para a fase seguinte.