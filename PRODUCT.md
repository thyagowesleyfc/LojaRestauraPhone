# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Clientes publicos da RestauraPhone, sem cadastro ou login, que navegam pelo catalogo, escolhem produtos ou combos e enviam o pedido para a loja pelo WhatsApp.

Administrador autenticado da loja, responsavel por manter categorias, produtos, promocoes, banners, identidade visual configuravel e informacoes institucionais.

## Product Purpose

A RestauraPhone e uma aplicacao web comercial para vender acessorios de celulares por catalogo publico e encaminhar pedidos pelo WhatsApp. O sistema ajuda o cliente a montar um carrinho com produtos ou combos, revisar quantidades e valores, e iniciar a conversa de compra com a loja.

O sucesso do MVP e permitir que a loja publique catalogo, promocoes e dados institucionais sem suporte tecnico diario, e que o cliente chegue ao WhatsApp com um pedido claro e organizado.

## Positioning

O produto e uma loja-catalogo simples para comercio local, sem checkout online: a decisao e a negociacao final acontecem no WhatsApp, enquanto o site organiza descoberta, precos, promocoes e pedido inicial.

## Operating Context

O cliente usa a area publica em desktop ou celular para navegar pela home, categorias, produtos, promocoes, pagina institucional e carrinho.

O administrador usa o painel protegido para cadastrar e editar categorias, produtos, promocoes, banners e configuracoes da loja.

Imagens de catalogo, promocoes, banners e logo usam Cloudinary. Dados persistentes usam PostgreSQL via Prisma. O carrinho fica somente no navegador e nao gera reserva de estoque.

## Capabilities and Constraints

- Catalogo publico por categorias ativas.
- Produtos ativos com descricao, especificacao, preco e 1 a 6 imagens.
- Promocoes percentuais por categoria e combos de produtos.
- Regras de promocao nao cumulativas; em percentuais, vale o maior desconto aplicavel.
- Combo entra no carrinho como item proprio.
- Precos sao armazenados em centavos e revalidados no servidor antes do envio pelo WhatsApp.
- Carrinho persistido em `localStorage`, sem gravacao no banco.
- Fechamento por WhatsApp usando numero e mensagem inicial configurados pelo administrador.
- Painel administrativo com login por email e senha e sessao em cookie HTTP-only.
- Tema claro e escuro, logo, cores, rodape, mapa e conteudo de Quem somos configuraveis.
- Fora do MVP: pagamento online, estoque, emissao fiscal, cadastro de clientes, historico persistido de pedidos, entrega, marketplace, app mobile nativo e modulo de manutencao.

## Brand Commitments

Nome do produto/loja: RestauraPhone.

O produto deve preservar a proposta comercial de catalogo simples, responsivo e voltado a conversao pelo WhatsApp. Identidade final, logo oficial, cores finais, dados institucionais definitivos e copy final do WhatsApp permanecem pendentes.

## Evidence on Hand

- Especificacoes funcionais e tecnicas em `docs/specs`.
- Implementacao Next.js App Router existente em `src/app`.
- Componentes publicos e administrativos existentes em `src/components`.
- Schema Prisma em `prisma/schema.prisma`.
- Testes existentes em `src/**/*.test.ts`.

Nao ha provas comerciais reais registradas no projeto, como depoimentos, metricas, cases, fotos oficiais da loja ou press kit. Trabalhos futuros nao devem fabricar esse tipo de evidencia.

## Product Principles

- Manter o fluxo de compra curto: descobrir, adicionar, revisar e chamar no WhatsApp.
- Priorizar simplicidade operacional para o administrador da loja.
- Recalcular regras comerciais no servidor quando o valor exibido ou enviado importar.
- Evitar escopo de e-commerce completo enquanto o MVP depende de fechamento humano pelo WhatsApp.
- Preservar responsividade e legibilidade para uso mobile-first.

## Accessibility & Inclusion

O projeto deve manter foco visivel, navegacao por teclado e contraste legivel nos temas claro e escuro. Nao ha requisito especifico adicional de acessibilidade registrado ate agora.
