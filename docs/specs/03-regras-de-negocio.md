# 03 - Regras de negocio

## Categorias

- cada produto pertence a exatamente uma categoria;
- categoria possui nome unico;
- categoria pode ser ativada ou desativada;
- categoria possui posicao de exibicao configuravel.

## Produtos

Campos obrigatorios:

- descricao curta;
- especificacao;
- preco;
- categoria;
- entre 1 e 6 imagens.

Regras:

- preco deve ser maior que zero;
- a primeira imagem ordenada e a imagem principal;
- produto inativo nao aparece na area publica;
- exclusao deve ser bloqueada quando comprometer promocoes existentes; preferir desativacao.

## Promocoes

Tipos:

- `CATEGORY_PERCENTAGE`;
- `PRODUCT_COMBO`.

### Percentual por categoria

- referencia exatamente uma categoria;
- percentual deve ser maior que zero e menor que 100;
- aplica desconto individual aos produtos ativos da categoria;
- nao e adicionado ao carrinho como item separado;
- o carrinho contem os produtos com preco promocional calculado.

### Combo

- referencia pelo menos dois produtos;
- pode conter produtos de categorias diferentes;
- possui preco fixo maior que zero;
- e adicionado ao carrinho como item proprio;
- seus produtos devem ser exibidos ao cliente.

### Regras gerais

- promocao possui periodo opcional de inicio e fim;
- promocao pode ser ativada ou desativada;
- promocoes nao sao cumulativas;
- quando mais de uma promocao percentual se aplicar, usar o maior desconto;
- combo nao recebe desconto adicional de categoria;
- preco exibido deve ser recalculado no servidor ao carregar dados publicos relevantes.

## Banners

- banner possui imagem, link e ordem;
- somente banners ativos aparecem;
- links externos devem abrir com seguranca apropriada.

## Links

- link possui título, URL de redirecionamento, ordem, descrição, status e imagem opcional;
- somente links ativos aparecem na página pública `/links`;
- URL de redirecionamento deve ser caminho interno iniciado por `/` ou URL `http(s)`;
- clique em link público deve gerar evento `LINK_CLICK` com referência ao link cadastrado;
- imagens ficam em armazenamento externo e devem ser removidas quando o link for excluído.

## Carrinho

- persistencia em `localStorage`;
- carrinho continua em `localStorage` e nao e salvo como carrinho no banco;
- precos devem ser revalidados antes da criacao do pedido final;
- apos confirmacao do envio ao WhatsApp, limpar o carrinho;
- nao existe reserva de estoque.

## Pedidos

- pedido e criado somente no fechamento do carrinho para WhatsApp;
- cada pedido possui codigo unico de 10 caracteres entre A-Z e 0-9;
- mensagem enviada ao WhatsApp deve conter apenas o codigo do pedido;
- itens do pedido devem ser persistidos como snapshot historico;
- snapshot deve preservar tipo do item, descricao, detalhe, SKU interno quando houver, quantidade, preco unitario, subtotal e total do pedido;
- alteracoes futuras em produtos, SKUs ou promocoes nao devem alterar pedidos ja gerados;
- pedidos nao possuem pagamento, status de entrega, cliente cadastrado ou controle de estoque nesta fase;
- administrador pode listar, buscar, ordenar e visualizar pedidos, sem edicao ou exclusao nesta fase.

## Configuracoes

- deve existir apenas um registro de configuracoes da loja;
- cores devem aceitar valores hexadecimais validos;
- numero do WhatsApp deve ser armazenado em formato internacional, apenas digitos;
- logo e imagens ficam em armazenamento externo.