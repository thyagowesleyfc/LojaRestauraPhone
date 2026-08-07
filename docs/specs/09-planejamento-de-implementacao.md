# 09 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Planejamento de implementaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o

Cada fase deve ser executada e validada separadamente. O Codex nÃƒÆ’Ã‚Â£o deve avanÃƒÆ’Ã‚Â§ar automaticamente.

## Fase 0 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â FundaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o

- [x] criar projeto Next.js com TypeScript e App Router;
- [x] configurar Tailwind;
- [x] instalar e configurar shadcn/ui;
- [x] configurar ESLint padrÃƒÆ’Ã‚Â£o;
- [x] criar estrutura inicial de pastas;
- [x] configurar Prisma para PostgreSQL;
- [x] configurar validaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o de ambiente com Zod;
- [x] criar pÃƒÆ’Ã‚Â¡gina inicial mÃƒÆ’Ã‚Â­nima;
- [x] criar rota de health check;
- [x] criar `.env.example`;
- [x] documentar execuÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o local;
- [x] validar lint e build.

## Fase 1 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Banco e autenticaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o

- [x] implementar schema Prisma completo;
- [x] criar migration inicial;
- [x] criar seed idempotente;
- [x] implementar login, sessÃƒÆ’Ã‚Â£o, logout e proteÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o de rotas;
- [x] criar tela mÃƒÆ’Ã‚Â­nima de login;
- [x] criar layout administrativo protegido;
- [x] testar autenticaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o;
- [x] validar migration e seed em PostgreSQL real.

## Fase 2 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Categorias e produtos

- [ ] CRUD de categorias;
- [ ] ordenaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o e ativaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o de categorias;
- [ ] CRUD de produtos;
- [ ] upload e ordenaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o de imagens via Cloudinary;
- [ ] validaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o de 1 a 6 imagens;
- [ ] listagem administrativa;
- [ ] pÃƒÆ’Ã‚Â¡ginas pÃƒÆ’Ã‚Âºblicas de categorias e produtos.

## Fase 3 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â PromoÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Âµes

- [x] CRUD de promoÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Âµes;
- [x] promoÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o percentual por categoria;
- [x] promoÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o de combo;
- [x] galeria da promoÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o;
- [x] cÃƒÆ’Ã‚Â¡lculo de preÃƒÆ’Ã‚Â§o promocional;
- [x] regras de nÃƒÆ’Ã‚Â£o cumulatividade;
- [x] pÃƒÆ’Ã‚Â¡ginas pÃƒÆ’Ã‚Âºblicas de promoÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Âµes.

## Fase 4 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Banners e configuraÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Âµes

- [x] CRUD de banners;
- [x] ordenaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o de banners;
- [x] configuraÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Âµes institucionais;
- [x] Quem somos;
- [x] rodapÃƒÆ’Ã‚Â©;
- [x] WhatsApp;
- [x] logo;
- [x] cores de tema;
- [x] mapa.

## Fase 5 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Home e navegaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o pÃƒÆ’Ã‚Âºblica

- [x] menu responsivo;
- [x] hero em carrossel;
- [x] seÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o de categorias;
- [x] seÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o de promoÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Âµes;
- [x] rodapÃƒÆ’Ã‚Â©;
- [x] botÃƒÆ’Ã‚Âµes flutuantes;
- [x] tema claro e escuro;
- [x] SEO bÃƒÆ’Ã‚Â¡sico e metadados.

## Fase 6 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Carrinho e WhatsApp

- [x] carrinho em localStorage;
- [x] produtos e combos;
- [x] quantidades e remoÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o;
- [x] revalidaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o de preÃƒÆ’Ã‚Â§os;
- [x] geraÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o da mensagem;
- [x] confirmaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o de envio;
- [x] limpeza do carrinho;
- [x] testes das regras crÃƒÆ’Ã‚Â­ticas.

## Fase 7 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ProduÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o

- [ ] preparar Heroku;
- [ ] configurar PostgreSQL de produÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o;
- [ ] configurar Cloudinary;
- [ ] configurar variÃƒÆ’Ã‚Â¡veis de ambiente;
- [ ] configurar GitHub Actions;
- [ ] configurar deploy automÃƒÆ’Ã‚Â¡tico;
- [ ] executar migrations no release;
- [ ] revisar seguranÃƒÆ’Ã‚Â§a;
- [ ] validar responsividade;
- [ ] executar smoke test de produÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o.

## CritÃƒÆ’Ã‚Â©rios globais

Ao concluir cada fase:

- executar lint;
- executar testes existentes;
- executar build;
- corrigir erros;
- atualizar checklist;
- listar arquivos alterados;
- registrar decisÃƒÆ’Ã‚Âµes e pendÃƒÆ’Ã‚Âªncias;
- nÃƒÆ’Ã‚Â£o avanÃƒÆ’Ã‚Â§ar para a fase seguinte.


