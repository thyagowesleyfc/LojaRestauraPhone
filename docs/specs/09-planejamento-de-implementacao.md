# 09 — Planejamento de implementação

Cada fase deve ser executada e validada separadamente. O Codex não deve avançar automaticamente.

## Fase 0 — Fundação

- [ ] criar projeto Next.js com TypeScript e App Router;
- [ ] configurar Tailwind;
- [ ] instalar e configurar shadcn/ui;
- [ ] configurar ESLint padrão;
- [ ] criar estrutura inicial de pastas;
- [ ] configurar Prisma para PostgreSQL;
- [ ] configurar validação de ambiente com Zod;
- [ ] criar página inicial mínima;
- [ ] criar rota de health check;
- [ ] criar `.env.example`;
- [ ] documentar execução local;
- [ ] validar lint e build.

## Fase 1 — Banco e autenticação

- [ ] implementar schema Prisma completo;
- [ ] criar migration inicial;
- [ ] criar seed idempotente;
- [ ] implementar login, sessão, logout e proteção de rotas;
- [ ] criar tela mínima de login;
- [ ] criar layout administrativo protegido;
- [ ] testar autenticação;
- [ ] validar migration e seed em PostgreSQL real.

## Fase 2 — Categorias e produtos

- [ ] CRUD de categorias;
- [ ] ordenação e ativação de categorias;
- [ ] CRUD de produtos;
- [ ] upload e ordenação de imagens via Cloudinary;
- [ ] validação de 1 a 6 imagens;
- [ ] listagem administrativa;
- [ ] páginas públicas de categorias e produtos.

## Fase 3 — Promoções

- [ ] CRUD de promoções;
- [ ] promoção percentual por categoria;
- [ ] promoção de combo;
- [ ] galeria da promoção;
- [ ] cálculo de preço promocional;
- [ ] regras de não cumulatividade;
- [ ] páginas públicas de promoções.

## Fase 4 — Banners e configurações

- [ ] CRUD de banners;
- [ ] ordenação de banners;
- [ ] configurações institucionais;
- [ ] Quem somos;
- [ ] rodapé;
- [ ] WhatsApp;
- [ ] logo;
- [ ] cores de tema;
- [ ] mapa.

## Fase 5 — Home e navegação pública

- [ ] menu responsivo;
- [ ] hero em carrossel;
- [ ] seção de categorias;
- [ ] seção de promoções;
- [ ] rodapé;
- [ ] botões flutuantes;
- [ ] tema claro e escuro;
- [ ] SEO básico e metadados.

## Fase 6 — Carrinho e WhatsApp

- [ ] carrinho em localStorage;
- [ ] produtos e combos;
- [ ] quantidades e remoção;
- [ ] revalidação de preços;
- [ ] geração da mensagem;
- [ ] confirmação de envio;
- [ ] limpeza do carrinho;
- [ ] testes das regras críticas.

## Fase 7 — Produção

- [ ] preparar Heroku;
- [ ] configurar PostgreSQL de produção;
- [ ] configurar Cloudinary;
- [ ] configurar variáveis de ambiente;
- [ ] configurar GitHub Actions;
- [ ] configurar deploy automático;
- [ ] executar migrations no release;
- [ ] revisar segurança;
- [ ] validar responsividade;
- [ ] executar smoke test de produção.

## Critérios globais

Ao concluir cada fase:

- executar lint;
- executar testes existentes;
- executar build;
- corrigir erros;
- atualizar checklist;
- listar arquivos alterados;
- registrar decisões e pendências;
- não avançar para a fase seguinte.
