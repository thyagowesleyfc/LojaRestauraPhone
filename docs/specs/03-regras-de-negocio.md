# 03 — Regras de negócio

## Categorias

- cada produto pertence a exatamente uma categoria;
- categoria possui nome único;
- categoria pode ser ativada ou desativada;
- categoria possui posição de exibição configurável.

## Produtos

Campos obrigatórios:

- descrição curta;
- especificação;
- preço;
- categoria;
- entre 1 e 6 imagens.

Regras:

- preço deve ser maior que zero;
- a primeira imagem ordenada é a imagem principal;
- produto inativo não aparece na área pública;
- exclusão deve ser bloqueada quando comprometer promoções existentes; preferir desativação.

## Promoções

Tipos:

- `CATEGORY_PERCENTAGE`;
- `PRODUCT_COMBO`.

### Percentual por categoria

- referencia exatamente uma categoria;
- percentual deve ser maior que zero e menor que 100;
- aplica desconto individual aos produtos ativos da categoria;
- não é adicionado ao carrinho como item separado;
- o carrinho contém os produtos com preço promocional calculado.

### Combo

- referencia pelo menos dois produtos;
- pode conter produtos de categorias diferentes;
- possui preço fixo maior que zero;
- é adicionado ao carrinho como item próprio;
- seus produtos devem ser exibidos ao cliente.

### Regras gerais

- promoção possui período opcional de início e fim;
- promoção pode ser ativada ou desativada;
- promoções não são cumulativas;
- quando mais de uma promoção percentual se aplicar, usar o maior desconto;
- combo não recebe desconto adicional de categoria;
- preço exibido deve ser recalculado no servidor ao carregar dados públicos relevantes.

## Banners

- banner possui imagem, link e ordem;
- somente banners ativos aparecem;
- links externos devem abrir com segurança apropriada.

## Carrinho

- persistência em `localStorage`;
- carrinho não é salvo no banco;
- preços devem ser revalidados antes da geração da mensagem final;
- após confirmação do envio ao WhatsApp, limpar o carrinho;
- não existe reserva de estoque.

## Configurações

- deve existir apenas um registro de configurações da loja;
- cores devem aceitar valores hexadecimais válidos;
- número do WhatsApp deve ser armazenado em formato internacional, apenas dígitos;
- logo e imagens ficam em armazenamento externo.
