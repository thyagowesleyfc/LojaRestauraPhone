# 02 - Requisitos funcionais

## Area publica

### Home

A home deve exibir, nesta ordem:

1. menu superior;
2. hero com banners;
3. categorias e produtos;
4. promocoes;
5. rodape institucional.

### Menu

Deve conter:

- Promocoes;
- Categorias;
- Quem somos;
- alternancia entre tema claro e escuro.

### Banners

- exibir somente banners ativos;
- ordenar por prioridade e, em empate, pelo mais recente;
- permitir clique e redirecionamento;
- funcionar como carrossel horizontal.

### Categorias

- exibir categorias ativas;
- permitir ordenacao configuravel;
- exibir produtos ativos como cards;
- cada card deve mostrar imagem principal, descricao e preco;
- ao clicar, abrir a pagina do produto;
- permitir abrir a pagina da categoria com todos os produtos.

### Produto

A pagina de produto deve mostrar:

- galeria de imagens;
- descricao;
- especificacao;
- categoria;
- preco atual;
- promocao aplicavel, quando houver;
- botao para adicionar ao carrinho.

### Promocoes

A pagina de promocoes deve listar promocoes ativas.

Cada promocao deve mostrar:

- imagem;
- descricao;
- tipo;
- preco do combo ou percentual de desconto;
- produtos ou categoria envolvidos;
- botao de inclusao no carrinho, quando aplicavel.

### Carrinho

- armazenar dados no navegador;
- aceitar produtos, SKUs/variantes e combos;
- permitir aumentar, diminuir e remover itens;
- recalcular totais;
- confirmar inclusao, remocao e envio;
- revalidar precos e disponibilidade no servidor;
- criar pedido persistido com codigo unico antes do redirecionamento ao WhatsApp;
- limpar o carrinho apos confirmacao do envio.

### WhatsApp

- botao flutuante permanente;
- usar numero configurado pelo administrador;
- usar mensagem inicial configuravel no botao flutuante;
- no fechamento do carrinho, gerar mensagem curta contendo somente o codigo do pedido.

### Quem somos

Pagina editavel com historia e informacoes da empresa.

### Rodape

Exibir:

- nome fantasia;
- CNPJ;
- telefone;
- e-mail;
- endereco;
- mapa incorporado.

## Area administrativa

### Autenticacao

- login por e-mail e senha;
- logout;
- sessao protegida;
- nenhuma rota administrativa acessivel sem autenticacao.

### Cadastros

CRUD de:

- categorias;
- produtos;
- promocoes;
- banners;
- configuracoes da loja.

### Pedidos

- listar pedidos enviados pelo WhatsApp;
- permitir busca por codigo do pedido;
- permitir ordenacao por data do pedido;
- permitir visualizar os itens de cada pedido;
- manter pedidos como snapshot historico, sem edicao pelo administrador nesta fase.

### Configuracoes

Permitir editar:

- logo;
- conteudo de Quem somos;
- informacoes do rodape;
- numero e mensagem do WhatsApp;
- cores dos temas claro e escuro;
- mapa incorporado.