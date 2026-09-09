# 01 - Visao e escopo

## Produto

A RestauraPhone vende acessorios para celulares e divulga servicos de manutencao de aparelhos telefonicos.

A primeira versao e uma aplicacao web com catalogo publico e painel administrativo. O cliente monta um carrinho e envia o pedido para o WhatsApp da loja. A conclusao da venda ocorre fora do sistema.

## Publico

### Administrador

Usuario autenticado que mantem categorias, produtos, promocoes, banners, identidade visual, informacoes institucionais e consulta pedidos enviados pelo WhatsApp.

### Cliente

Usuario publico sem cadastro ou login. Navega, adiciona itens ao carrinho e envia o pedido pelo WhatsApp.

## Escopo do MVP

- catalogo por categorias;
- produtos com ate seis imagens;
- promocoes por categoria ou combo;
- banners clicaveis;
- pagina institucional;
- carrinho no navegador;
- fechamento pelo WhatsApp;
- historico de pedidos enviados ao WhatsApp;
- painel administrativo;
- temas claro e escuro configuraveis;
- logo configuravel;
- layout responsivo.

## Fora do escopo

- pagamento online;
- controle de estoque;
- emissao fiscal;
- cadastro de clientes;
- acompanhamento de entrega;
- multiplos administradores com perfis diferentes;
- agendamento e ordem de servico de manutencao;
- marketplace;
- aplicativo mobile nativo.

## Volume esperado

A aplicacao deve atender confortavelmente entre 100 e 200 visitas por dia, sem arquitetura distribuida.