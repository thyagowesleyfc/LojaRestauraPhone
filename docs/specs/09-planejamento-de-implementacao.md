# 09 â€” Planejamento de implementaÃ§Ã£o

Cada fase deve ser executada e validada separadamente. O Codex nÃ£o deve avanÃ§ar automaticamente.

## Fase 0 â€” FundaÃ§Ã£o

- [x] criar projeto Next.js com TypeScript e App Router;
- [x] configurar Tailwind;
- [x] instalar e configurar shadcn/ui;
- [x] configurar ESLint padrÃ£o;
- [x] criar estrutura inicial de pastas;
- [x] configurar Prisma para PostgreSQL;
- [x] configurar validaÃ§Ã£o de ambiente com Zod;
- [x] criar pÃ¡gina inicial mÃ­nima;
- [x] criar rota de health check;
- [x] criar `.env.example`;
- [x] documentar execuÃ§Ã£o local;
- [x] validar lint e build.

## Fase 1 â€” Banco e autenticaÃ§Ã£o

- [ ] implementar schema Prisma completo;
- [ ] criar migration inicial;
- [ ] criar seed idempotente;
- [ ] implementar login, sessÃ£o, logout e proteÃ§Ã£o de rotas;
- [ ] criar tela mÃ­nima de login;
- [ ] criar layout administrativo protegido;
- [ ] testar autenticaÃ§Ã£o;
- [ ] validar migration e seed em PostgreSQL real.

## Fase 2 â€” Categorias e produtos

- [ ] CRUD de categorias;
- [ ] ordenaÃ§Ã£o e ativaÃ§Ã£o de categorias;
- [ ] CRUD de produtos;
- [ ] upload e ordenaÃ§Ã£o de imagens via Cloudinary;
- [ ] validaÃ§Ã£o de 1 a 6 imagens;
- [ ] listagem administrativa;
- [ ] pÃ¡ginas pÃºblicas de categorias e produtos.

## Fase 3 â€” PromoÃ§Ãµes

- [ ] CRUD de promoÃ§Ãµes;
- [ ] promoÃ§Ã£o percentual por categoria;
- [ ] promoÃ§Ã£o de combo;
- [ ] galeria da promoÃ§Ã£o;
- [ ] cÃ¡lculo de preÃ§o promocional;
- [ ] regras de nÃ£o cumulatividade;
- [ ] pÃ¡ginas pÃºblicas de promoÃ§Ãµes.

## Fase 4 â€” Banners e configuraÃ§Ãµes

- [ ] CRUD de banners;
- [ ] ordenaÃ§Ã£o de banners;
- [ ] configuraÃ§Ãµes institucionais;
- [ ] Quem somos;
- [ ] rodapÃ©;
- [ ] WhatsApp;
- [ ] logo;
- [ ] cores de tema;
- [ ] mapa.

## Fase 5 â€” Home e navegaÃ§Ã£o pÃºblica

- [ ] menu responsivo;
- [ ] hero em carrossel;
- [ ] seÃ§Ã£o de categorias;
- [ ] seÃ§Ã£o de promoÃ§Ãµes;
- [ ] rodapÃ©;
- [ ] botÃµes flutuantes;
- [ ] tema claro e escuro;
- [ ] SEO bÃ¡sico e metadados.

## Fase 6 â€” Carrinho e WhatsApp

- [ ] carrinho em localStorage;
- [ ] produtos e combos;
- [ ] quantidades e remoÃ§Ã£o;
- [ ] revalidaÃ§Ã£o de preÃ§os;
- [ ] geraÃ§Ã£o da mensagem;
- [ ] confirmaÃ§Ã£o de envio;
- [ ] limpeza do carrinho;
- [ ] testes das regras crÃ­ticas.

## Fase 7 â€” ProduÃ§Ã£o

- [ ] preparar Heroku;
- [ ] configurar PostgreSQL de produÃ§Ã£o;
- [ ] configurar Cloudinary;
- [ ] configurar variÃ¡veis de ambiente;
- [ ] configurar GitHub Actions;
- [ ] configurar deploy automÃ¡tico;
- [ ] executar migrations no release;
- [ ] revisar seguranÃ§a;
- [ ] validar responsividade;
- [ ] executar smoke test de produÃ§Ã£o.

## CritÃ©rios globais

Ao concluir cada fase:

- executar lint;
- executar testes existentes;
- executar build;
- corrigir erros;
- atualizar checklist;
- listar arquivos alterados;
- registrar decisÃµes e pendÃªncias;
- nÃ£o avanÃ§ar para a fase seguinte.

