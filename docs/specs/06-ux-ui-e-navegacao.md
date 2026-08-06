# 06 — UX, UI e navegação

## Direção visual

- visual limpo e comercial;
- mobile-first;
- Tailwind e shadcn/ui;
- botões confirmatórios verdes;
- botões destrutivos ou negativos vermelhos;
- demais ações com cores neutras;
- foco visível e navegação por teclado.

## Temas

- tema claro e escuro;
- escolha salva no navegador;
- cores principais configuradas pelo administrador;
- garantir contraste mínimo legível;
- fallback para cores padrão quando configuração inválida.

## Rotas públicas sugeridas

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

## Modais de confirmação

Usar confirmação para:

- criar;
- editar;
- excluir ou desativar;
- adicionar item ao carrinho;
- remover item;
- limpar carrinho;
- enviar pedido ao WhatsApp.

Evitar confirmação desnecessária em ações reversíveis e de baixo risco.

## Responsividade

- menu compacto em mobile;
- cards em uma coluna no menor tamanho;
- galerias adaptáveis;
- botões flutuantes sem cobrir conteúdo;
- painel administrativo utilizável em celular, mas otimizado para desktop.
