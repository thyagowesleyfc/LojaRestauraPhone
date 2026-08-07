# 09 Ã¢â‚¬â€ Planejamento de implementaÃƒÂ§ÃƒÂ£o

Cada fase deve ser executada e validada separadamente. O Codex nÃƒÂ£o deve avanÃƒÂ§ar automaticamente.

## Fase 0 Ã¢â‚¬â€ FundaÃƒÂ§ÃƒÂ£o

- [x] criar projeto Next.js com TypeScript e App Router;
- [x] configurar Tailwind;
- [x] instalar e configurar shadcn/ui;
- [x] configurar ESLint padrÃƒÂ£o;
- [x] criar estrutura inicial de pastas;
- [x] configurar Prisma para PostgreSQL;
- [x] configurar validaÃƒÂ§ÃƒÂ£o de ambiente com Zod;
- [x] criar pÃƒÂ¡gina inicial mÃƒÂ­nima;
- [x] criar rota de health check;
- [x] criar `.env.example`;
- [x] documentar execuÃƒÂ§ÃƒÂ£o local;
- [x] validar lint e build.

## Fase 1 Ã¢â‚¬â€ Banco e autenticaÃƒÂ§ÃƒÂ£o

- [x] implementar schema Prisma completo;
- [x] criar migration inicial;
- [x] criar seed idempotente;
- [x] implementar login, sessÃƒÂ£o, logout e proteÃƒÂ§ÃƒÂ£o de rotas;
- [x] criar tela mÃƒÂ­nima de login;
- [x] criar layout administrativo protegido;
- [x] testar autenticaÃƒÂ§ÃƒÂ£o;
- [x] validar migration e seed em PostgreSQL real.

## Fase 2 Ã¢â‚¬â€ Categorias e produtos

- [ ] CRUD de categorias;
- [ ] ordenaÃƒÂ§ÃƒÂ£o e ativaÃƒÂ§ÃƒÂ£o de categorias;
- [ ] CRUD de produtos;
- [ ] upload e ordenaÃƒÂ§ÃƒÂ£o de imagens via Cloudinary;
- [ ] validaÃƒÂ§ÃƒÂ£o de 1 a 6 imagens;
- [ ] listagem administrativa;
- [ ] pÃƒÂ¡ginas pÃƒÂºblicas de categorias e produtos.

## Fase 3 Ã¢â‚¬â€ PromoÃƒÂ§ÃƒÂµes

- [x] CRUD de promoÃƒÂ§ÃƒÂµes;
- [x] promoÃƒÂ§ÃƒÂ£o percentual por categoria;
- [x] promoÃƒÂ§ÃƒÂ£o de combo;
- [x] galeria da promoÃƒÂ§ÃƒÂ£o;
- [x] cÃƒÂ¡lculo de preÃƒÂ§o promocional;
- [x] regras de nÃƒÂ£o cumulatividade;
- [x] pÃƒÂ¡ginas pÃƒÂºblicas de promoÃƒÂ§ÃƒÂµes.

## Fase 4 Ã¢â‚¬â€ Banners e configuraÃƒÂ§ÃƒÂµes

- [ ] CRUD de banners;
- [ ] ordenaÃƒÂ§ÃƒÂ£o de banners;
- [ ] configuraÃƒÂ§ÃƒÂµes institucionais;
- [ ] Quem somos;
- [ ] rodapÃƒÂ©;
- [ ] WhatsApp;
- [ ] logo;
- [ ] cores de tema;
- [ ] mapa.

## Fase 5 Ã¢â‚¬â€ Home e navegaÃƒÂ§ÃƒÂ£o pÃƒÂºblica

- [ ] menu responsivo;
- [ ] hero em carrossel;
- [ ] seÃƒÂ§ÃƒÂ£o de categorias;
- [ ] seÃƒÂ§ÃƒÂ£o de promoÃƒÂ§ÃƒÂµes;
- [ ] rodapÃƒÂ©;
- [ ] botÃƒÂµes flutuantes;
- [ ] tema claro e escuro;
- [ ] SEO bÃƒÂ¡sico e metadados.

## Fase 6 Ã¢â‚¬â€ Carrinho e WhatsApp

- [ ] carrinho em localStorage;
- [ ] produtos e combos;
- [ ] quantidades e remoÃƒÂ§ÃƒÂ£o;
- [ ] revalidaÃƒÂ§ÃƒÂ£o de preÃƒÂ§os;
- [ ] geraÃƒÂ§ÃƒÂ£o da mensagem;
- [ ] confirmaÃƒÂ§ÃƒÂ£o de envio;
- [ ] limpeza do carrinho;
- [ ] testes das regras crÃƒÂ­ticas.

## Fase 7 Ã¢â‚¬â€ ProduÃƒÂ§ÃƒÂ£o

- [ ] preparar Heroku;
- [ ] configurar PostgreSQL de produÃƒÂ§ÃƒÂ£o;
- [ ] configurar Cloudinary;
- [ ] configurar variÃƒÂ¡veis de ambiente;
- [ ] configurar GitHub Actions;
- [ ] configurar deploy automÃƒÂ¡tico;
- [ ] executar migrations no release;
- [ ] revisar seguranÃƒÂ§a;
- [ ] validar responsividade;
- [ ] executar smoke test de produÃƒÂ§ÃƒÂ£o.

## CritÃƒÂ©rios globais

Ao concluir cada fase:

- executar lint;
- executar testes existentes;
- executar build;
- corrigir erros;
- atualizar checklist;
- listar arquivos alterados;
- registrar decisÃƒÂµes e pendÃƒÂªncias;
- nÃƒÂ£o avanÃƒÂ§ar para a fase seguinte.


