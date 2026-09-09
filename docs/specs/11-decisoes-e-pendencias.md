# 11 - Decisoes e pendencias

## Decisoes adotadas

- aplicacao unica em Next.js;
- PostgreSQL desde o inicio;
- sem Docker obrigatorio;
- Heroku como hospedagem prevista;
- Cloudinary para imagens;
- carrinho em localStorage;
- pedidos enviados ao WhatsApp persistidos como snapshot historico;
- valores monetarios em centavos;
- sessao administrativa persistida em banco;
- uma unica funcao administrativa;
- promocoes nao cumulativas;
- combo como item proprio do carrinho;
- promocao percentual aplicada aos produtos;
- exclusao logica preferencial para registros publicos.

## Pendencias que nao bloqueiam o inicio

- dominio definitivo da loja;
- credenciais do Cloudinary;
- plano especifico do Heroku;
- conteudo final de Quem somos;
- dados reais do rodape;
- cores finais dos temas;
- logo oficial;
- texto inicial do WhatsApp;
- URL final do mapa.

## Decisao futura

O modulo de manutencao de aparelhos nao faz parte deste MVP. Ele devera ser especificado separadamente, incluindo orcamento, aparelho, defeito, servico, status e comunicacao com o cliente.

## Decisao operacional de frontend

- Ao implementar ou revisar frontend, usar a skill impeccable quando ela estiver disponivel no ambiente Codex.
- Se a skill impeccable nao estiver instalada/disponivel, registrar a indisponibilidade e seguir as diretrizes de frontend deste projeto sem bloquear a fase.