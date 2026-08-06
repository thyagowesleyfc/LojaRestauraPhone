# 02 — Requisitos funcionais

## Área pública

### Home

A home deve exibir, nesta ordem:

1. menu superior;
2. hero com banners;
3. categorias e produtos;
4. promoções;
5. rodapé institucional.

### Menu

Deve conter:

- Promoções;
- Categorias;
- Quem somos;
- alternância entre tema claro e escuro.

### Banners

- exibir somente banners ativos;
- ordenar por prioridade e, em empate, pelo mais recente;
- permitir clique e redirecionamento;
- funcionar como carrossel horizontal.

### Categorias

- exibir categorias ativas;
- permitir ordenação configurável;
- exibir produtos ativos como cards;
- cada card deve mostrar imagem principal, descrição e preço;
- ao clicar, abrir a página do produto;
- permitir abrir a página da categoria com todos os produtos.

### Produto

A página de produto deve mostrar:

- galeria de imagens;
- descrição;
- especificação;
- categoria;
- preço atual;
- promoção aplicável, quando houver;
- botão para adicionar ao carrinho.

### Promoções

A página de promoções deve listar promoções ativas.

Cada promoção deve mostrar:

- imagem;
- descrição;
- tipo;
- preço do combo ou percentual de desconto;
- produtos ou categoria envolvidos;
- botão de inclusão no carrinho, quando aplicável.

### Carrinho

- armazenar dados no navegador;
- aceitar produtos e combos;
- permitir aumentar, diminuir e remover itens;
- recalcular totais;
- confirmar inclusão, remoção e envio;
- montar texto organizado para WhatsApp;
- limpar o carrinho após confirmação do envio.

### WhatsApp

- botão flutuante permanente;
- usar número configurado pelo administrador;
- usar mensagem inicial configurável;
- no fechamento, gerar mensagem com itens, quantidades, preços e total.

### Quem somos

Página editável com história e informações da empresa.

### Rodapé

Exibir:

- nome fantasia;
- CNPJ;
- telefone;
- e-mail;
- endereço;
- mapa incorporado.

## Área administrativa

### Autenticação

- login por e-mail e senha;
- logout;
- sessão protegida;
- nenhuma rota administrativa acessível sem autenticação.

### Cadastros

CRUD de:

- categorias;
- produtos;
- promoções;
- banners;
- configurações da loja.

### Configurações

Permitir editar:

- logo;
- conteúdo de Quem somos;
- informações do rodapé;
- número e mensagem do WhatsApp;
- cores dos temas claro e escuro;
- mapa incorporado.
