# RestauraPhone — Incremento de Domínio: Variantes/SKU e Marketing Analytics

## 1. Objetivo

Este documento especifica um incremento ao domínio existente da RestauraPhone.

O objetivo é adicionar:

1. características configuráveis por categoria;
2. variantes/SKUs de produtos;
3. imagens específicas por SKU;
4. disponibilidade ativa/inativa por SKU;
5. coleta de eventos de navegação e marketing;
6. dashboard administrativo de marketing;
7. captura de parâmetros UTM;
8. geração de links de campanha;
9. configuração de marcadores externos de marketing, como Google Tag Manager, Meta Pixel e TikTok Pixel.

Este incremento deve ser aplicado sobre o projeto existente, preservando as funcionalidades já implementadas.

---

## 2. Características configuráveis

As características não devem ser campos fixos no modelo `Product`.

O sistema deve permitir que o administrador cadastre definições genéricas de características, como Cor, Tamanho, Material, Modelo compatível, Voltagem, Capacidade, Conector ou qualquer outra característica futura.

Cada característica possui uma lista configurável de valores possíveis.

Exemplos:

- Cor: Preto, Branco, Azul, Vermelho
- Tamanho: PP, P, M, G, GG
- Numeração: 10, 11, 12
- Material: Silicone, Couro, Acrílico

### 2.1. Características por categoria

A categoria define quais características são aplicáveis aos produtos pertencentes a ela.

Exemplo:

Categoria: `Capinhas e Películas`

Características configuradas:

- Cor
- Modelo compatível
- Material

O cadastro de categoria deve permitir:

- adicionar uma ou mais características;
- remover características;
- ordenar as características;
- definir se a característica é obrigatória para as variantes;
- definir os valores permitidos.

Uma alteração nas características de uma categoria não deve apagar silenciosamente dados já utilizados por SKUs existentes.

Caso uma característica esteja sendo usada por uma variante existente, sua remoção deve exigir confirmação e tratamento explícito.

---

## 3. Variantes e SKU

`Product` continua representando o produto comercial principal.

Uma `ProductVariant` representa uma combinação específica das características desse produto.

Exemplo:

Produto: `Capinha Premium`

Variante:

- Cor: Preto
- Modelo: iPhone 15
- Material: Silicone

SKU: `CAP-IP15-PRETO-SIL`

Cada variante deve possuir:

- identificador próprio;
- SKU único;
- produto relacionado;
- conjunto de valores de características;
- status ativo/inativo;
- galeria própria de imagens;
- data de criação;
- data de atualização.

O SKU deve ser único em todo o sistema.

O sistema pode permitir geração automática do SKU e edição manual pelo administrador antes de salvar.

A geração automática deve produzir um identificador legível e suficientemente único.

---

## 4. Preço

O preço pertence ao `Product`.

Todas as variantes/SKUs do produto utilizam o mesmo preço.

Não existe:

- preço próprio por SKU;
- sobrescrita de preço;
- adicional por característica.

Regra: `Product.price` é a única fonte de preço para todas as variantes.

---

## 5. Imagens

As imagens exibidas na página do produto devem pertencer à variante selecionada.

Cada SKU possui sua própria galeria.

Regras:

- uma variante deve possuir ao menos uma imagem;
- máximo recomendado: 6 imagens por variante;
- a primeira imagem da variante é sua imagem principal;
- a troca da variante na página do produto deve atualizar a galeria exibida.

O produto não precisa possuir uma galeria geral independente das variantes.

---

## 6. Disponibilidade

Não haverá controle de estoque por quantidade.

Cada SKU terá apenas estado ativo/inativo.

Uma variante inativa:

- não pode ser adicionada ao carrinho;
- deve ser ocultada ou exibida como indisponível na página pública;
- continua preservada no banco para histórico e administração.

O próprio produto também continua podendo possuir status ativo/inativo.

Para uma variante estar disponível publicamente:

- o produto deve estar ativo;
- a variante deve estar ativa.

---

## 7. Cadastro de produto

Ao escolher a categoria durante o cadastro/edição de um produto, o sistema deve carregar as características configuradas para aquela categoria.

O administrador deve poder criar apenas as combinações desejadas.

Exemplo:

Categoria possui:

- Cor: Preto, Azul
- Tamanho: P, M

O administrador pode criar:

- Preto / P
- Preto / M
- Azul / P

Não é obrigatório gerar automaticamente o produto cartesiano completo.

Cada combinação criada corresponde a um SKU.

O sistema deve impedir duas variantes com exatamente a mesma combinação de características para o mesmo produto.

---

## 8. Página pública do produto

Rota: `/produtos/[slug]`

A página deve exibir:

- nome;
- descrição;
- especificação;
- preço;
- categoria;
- características disponíveis;
- galeria do SKU selecionado;
- botão de adicionar ao carrinho.

As características devem ser apresentadas como seletores.

Exemplo:

Cor: `[ Preto ] [ Azul ] [ Branco ]`

Tamanho: `[ P ] [ M ] [ G ]`

A combinação escolhida determina o SKU atual.

Ao alterar uma característica:

- o sistema deve identificar a variante correspondente;
- atualizar a galeria;
- atualizar disponibilidade;
- atualizar o SKU selecionado;
- preservar o mesmo preço do produto.

Combinações inexistentes devem ficar desabilitadas.

Antes de adicionar ao carrinho, o cliente deve ter selecionado uma variante válida.

---

## 9. Carrinho

O carrinho deixa de referenciar apenas `Product`.

Cada item deve referenciar:

- produto;
- variante/SKU;
- quantidade;
- preço do produto no momento da exibição;
- características selecionadas.

Exemplo de texto enviado ao WhatsApp:

`Capinha Premium — iPhone 15 / Preto / Silicone — SKU CAP-IP15-PRETO-SIL — 2 un. — R$ 49,90 cada`

As regras existentes de promoções continuam aplicáveis ao produto, salvo definição posterior em contrário.

---

## 10. Administração de características

Adicionar ao menu administrativo uma seção: `Características`.

O CRUD deve permitir:

- criar característica;
- editar nome;
- editar slug;
- ativar/inativar;
- cadastrar valores possíveis;
- ordenar valores;
- editar valores;
- ativar/inativar valores.

As características podem ser reutilizadas em múltiplas categorias.

---

## 11. Marketing Analytics

Adicionar ao Admin a seção: `Marketing`.

Sugestão de navegação:

- Visão Geral
- Pesquisas
- Produtos visualizados
- Campanhas
- Integrações / Marcadores

---

## 12. Eventos internos

O sistema deve registrar eventos first-party de navegação e interação.

Eventos mínimos:

- `PAGE_VIEW`
- `PRODUCT_VIEW`
- `SEARCH`
- `SEARCH_NO_RESULTS`
- `ADD_TO_CART`
- `REMOVE_FROM_CART`
- `WHATSAPP_CLICK`
- `ORDER_SENT_TO_WHATSAPP`

Também podem existir:

- `PROMOTION_VIEW`
- `CATEGORY_VIEW`

Cada evento deve registrar apenas dados necessários para análise.

Campos sugeridos:

- id;
- tipo;
- sessionId anônimo;
- productId opcional;
- productVariantId opcional;
- promotionId opcional;
- categoryId opcional;
- searchTerm opcional;
- resultsCount opcional;
- pagePath;
- UTM associada à sessão, quando houver;
- createdAt.

Não armazenar dados pessoais desnecessários para analytics.

---

## 13. Session ID anônimo

Clientes não autenticados devem receber um identificador anônimo de sessão/navegação.

Esse identificador serve para:

- evitar depender de IP;
- correlacionar eventos da mesma navegação;
- relacionar origem UTM com ações posteriores.

Não é necessário identificar pessoalmente o visitante.

---

## 14. Pesquisa

Toda pesquisa realizada no menu público deve gerar um evento `SEARCH`.

Registrar:

- termo pesquisado;
- quantidade de resultados;
- data/hora;
- sessionId;
- UTMs da sessão, quando existentes.

Quando não houver resultados, registrar também `SEARCH_NO_RESULTS`.

O dashboard deve permitir visualizar:

- termos mais pesquisados;
- termos sem resultado;
- quantidade de buscas;
- evolução das buscas ao longo do tempo.

A comparação deve ser case-insensitive para análise.

O sistema pode armazenar o termo original e uma versão normalizada para agregação.

---

## 15. Visualizações

Registrar visualizações da Home e páginas de produto.

Home: `PAGE_VIEW`

Produto: `PRODUCT_VIEW`

Para produto, registrar:

- productId;
- pagePath;
- sessionId;
- UTMs;
- createdAt.

O dashboard deve exibir, no mínimo:

- visitas à Home;
- visualizações totais de produtos;
- ranking de produtos mais visualizados;
- visualizações por período;
- comparação entre produtos;
- visualizações provenientes de campanhas identificadas por UTM.

---

## 16. Funil de marketing

O dashboard deve conseguir agregar:

`Sessões → Visualizações de produto → Adições ao carrinho → Cliques no WhatsApp → Pedidos enviados ao WhatsApp`

Métricas mínimas:

- sessões;
- product views;
- add to cart;
- remove from cart;
- WhatsApp clicks;
- pedidos enviados;
- taxa de avanço entre etapas.

O objetivo é um dashboard operacional simples, não uma plataforma de BI complexa.

---

## 17. UTM

O sistema deve detectar automaticamente parâmetros padrão de campanha presentes na URL.

Suportar:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_term`
- `utm_content`

Ao entrar no site com UTMs, elas devem ser associadas à sessão anônima.

Eventos posteriores da mesma sessão devem poder ser atribuídos à campanha.

---

## 18. Gerador de links de campanha

Adicionar em `Admin > Marketing > Campanhas` uma ferramenta simples para gerar links UTM.

Campos:

- URL destino;
- source;
- medium;
- campaign;
- term opcional;
- content opcional.

O CRUD de links não é obrigatório inicialmente.

Opcionalmente, o sistema pode salvar links/campanhas gerados para facilitar reutilização e análise.

---

## 19. Integrações externas / marcadores

Adicionar `Admin > Marketing > Integrações`.

O administrador deve poder configurar marcadores externos usados por plataformas de publicidade e analytics.

Suportar inicialmente configurações para:

- Google Tag Manager;
- Meta/Facebook Pixel;
- TikTok Pixel.

A arquitetura deve permitir adicionar outros provedores no futuro.

Cada integração deve possuir:

- provider;
- identificador/configuração;
- ativo/inativo;
- createdAt;
- updatedAt.

Exemplos de configuração:

- GTM container ID;
- Meta Pixel ID;
- TikTok Pixel ID.

O administrador não deve precisar alterar código ou variáveis de ambiente para trocar esses identificadores.

---

## 20. Segurança dos marcadores

Não permitir inserção arbitrária de JavaScript livre pelo painel administrativo.

O Admin deve cadastrar apenas identificadores/configurações estruturadas de provedores suportados.

A aplicação é responsável por montar/carregar o código correspondente.

---

## 21. Tracking centralizado

Além do registro interno, eventos relevantes devem poder ser encaminhados para integrações externas ativas.

Criar uma camada central de tracking, conceitualmente:

`trackEvent(eventName, payload)`

Essa função deve:

1. registrar o evento interno quando aplicável;
2. encaminhar o evento aos providers externos ativos;
3. evitar espalhar chamadas específicas de GTM/Meta/TikTok por componentes da aplicação.

Eventos mínimos para encaminhamento:

- visualização de produto;
- pesquisa;
- adicionar ao carrinho;
- remover do carrinho, quando aplicável;
- clique no WhatsApp;
- envio do pedido ao WhatsApp.

---

## 22. Dashboard administrativo

Criar `/admin/marketing`.

Cards mínimos:

- visitas à Home;
- visualizações de produtos;
- buscas;
- buscas sem resultado;
- adições ao carrinho;
- pedidos enviados ao WhatsApp.

Seções:

### Produtos mais vistos
Ranking por visualizações.

### Pesquisas mais realizadas
Ranking por termo normalizado.

### Pesquisas sem resultado
Ranking dos termos que não retornaram produtos.

### Funil
- sessões;
- product views;
- add to cart;
- WhatsApp click;
- order sent.

### Campanhas
Agrupar eventos por:

- utm_source;
- utm_medium;
- utm_campaign.

Permitir filtro por intervalo de datas.

---

## 23. Modelo de domínio sugerido

Entidades conceituais novas:

- `Characteristic`
- `CharacteristicOption`
- `CategoryCharacteristic`
- `ProductVariant`
- `ProductVariantValue`
- `ProductVariantImage`
- `AnalyticsEvent`
- `MarketingIntegration`

Possível entidade opcional:

- `MarketingCampaignLink`

Relacionamentos conceituais:

- `Characteristic 1:N CharacteristicOption`
- `Category N:N Characteristic`
- `Product 1:N ProductVariant`
- `ProductVariant N:N CharacteristicOption`
- `ProductVariant 1:N ProductVariantImage`

---

## 24. Restrições

Não implementar neste incremento:

- controle quantitativo de estoque;
- preço diferente por SKU;
- galeria geral de produto usada como fallback;
- identificação pessoal de visitantes;
- CRM;
- atribuição multi-touch avançada;
- BI complexo;
- execução de JavaScript arbitrário configurado pelo Admin.

---

## 25. Estratégia de implementação

### Fase A — Domínio e persistência
- criar modelos de características;
- relacionar características às categorias;
- criar variantes/SKUs;
- criar imagens por SKU;
- criar migration incremental.

### Fase B — Administração de características e variantes
- CRUD de características;
- valores das características;
- configuração por categoria;
- criação/edição de variantes no produto;
- status ativo/inativo;
- galeria por SKU.

### Fase C — Loja pública e carrinho
- seletores em `/produtos/[slug]`;
- resolução de combinação válida;
- troca da galeria;
- adicionar SKU ao carrinho;
- texto do WhatsApp contendo SKU/características.

### Fase D — Analytics interno
- sessionId anônimo;
- registro de eventos;
- pesquisa;
- visualizações;
- add/remove cart;
- WhatsApp;
- captura de UTM.

### Fase E — Dashboard
- cards;
- rankings;
- buscas sem resultado;
- produtos mais vistos;
- funil;
- filtros por data;
- visão por UTM/campanha.

### Fase F — Integrações externas
- configuração de GTM;
- configuração de Meta Pixel;
- configuração de TikTok Pixel;
- camada central de tracking;
- encaminhamento de eventos.

---

## 26. Critérios de aceite

O incremento estará concluído quando:

1. o administrador conseguir cadastrar características e opções;
2. uma categoria puder definir suas características;
3. produtos puderem possuir múltiplas variantes;
4. cada variante possuir SKU único;
5. cada variante possuir galeria própria;
6. todas as variantes utilizarem o preço do produto;
7. variantes puderem ser ativadas/inativadas;
8. `/produtos/[slug]` permitir selecionar características;
9. apenas combinações reais puderem ser adicionadas ao carrinho;
10. carrinho e WhatsApp identificarem corretamente o SKU;
11. pesquisas forem registradas;
12. buscas sem resultados forem identificadas;
13. visitas à Home e produtos forem registradas;
14. ações de carrinho e WhatsApp forem registradas;
15. UTMs forem capturadas e associadas à sessão;
16. o Admin exibir métricas de marketing;
17. o Admin permitir configurar GTM, Meta Pixel e TikTok Pixel;
18. não houver suporte a JavaScript arbitrário pelo painel.

---

## 27. Orientação para o Codex

Antes de implementar:

1. ler `AGENTS.md`;
2. ler este documento;
3. inspecionar o schema Prisma e funcionalidades existentes;
4. identificar impactos nas entidades atuais;
5. preservar funcionalidades já implementadas;
6. implementar uma fase por vez;
7. criar migrations incrementais, sem apagar ou recriar o banco;
8. não alterar regras já existentes sem necessidade;
9. executar lint, typecheck, testes e build ao final de cada fase;
10. atualizar o checklist conforme o progresso.

Este documento é incremental e não substitui as especificações originais do projeto.
