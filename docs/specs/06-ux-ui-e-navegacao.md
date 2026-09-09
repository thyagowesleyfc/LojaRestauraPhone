# 06 - UX, UI e navegacao

## Direcao visual

- visual limpo e comercial;
- mobile-first;
- Tailwind e shadcn/ui;
- botoes confirmatorios verdes;
- botoes destrutivos ou negativos vermelhos;
- demais acoes com cores neutras;
- foco visivel e navegacao por teclado.

## Temas

- tema claro e escuro;
- escolha salva no navegador;
- cores principais configuradas pelo administrador;
- garantir contraste minimo legivel;
- fallback para cores padrao quando configuracao invalida.

## Rotas publicas sugeridas

- `/`
- `/categorias`
- `/categorias/[slug]`
- `/produtos/[slug]`
- `/promocoes`
- `/promocoes/[slug]`
- `/quem-somos`
- `/carrinho`

## Rotas administrativas sugeridas

- `/admin/login`
- `/admin`
- `/admin/categorias`
- `/admin/produtos`
- `/admin/promocoes`
- `/admin/banners`
- `/admin/configuracoes`
- `/admin/pedidos`
- `/admin/pedidos/[codigo]`

## Pedidos no admin

- listagem de pedidos deve priorizar codigo, data, quantidade de itens, total e acao de visualizar;
- filtros devem permitir busca por codigo e ordenacao por data;
- detalhe do pedido deve exibir o snapshot dos itens de forma escaneavel e responsiva;
- pedido e historico operacional, sem acoes de edicao nesta fase.

## Modais de confirmacao

Usar confirmacao para:

- criar;
- editar;
- excluir ou desativar;
- adicionar item ao carrinho;
- remover item;
- limpar carrinho;
- enviar pedido ao WhatsApp.

Evitar confirmacao desnecessaria em acoes reversiveis e de baixo risco.

## Responsividade

- menu compacto em mobile;
- cards em uma coluna no menor tamanho;
- galerias adaptaveis;
- botoes flutuantes sem cobrir conteudo;
- painel administrativo utilizavel em celular, mas otimizado para desktop.