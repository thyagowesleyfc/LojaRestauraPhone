# 08 — Deploy, CI/CD e operação

## Hospedagem

- aplicação no Heroku;
- banco PostgreSQL persistente;
- imagens no Cloudinary.

## CI/CD simples

Fluxo recomendado:

1. desenvolvimento em branch;
2. pull request para `main`;
3. GitHub Actions executa lint, testes e build;
4. merge em `main`;
5. Heroku realiza deploy automático;
6. release executa `prisma migrate deploy`.

## Docker

Docker não é requisito do projeto.

Não criar `docker-compose.yml` na fase inicial, salvo decisão posterior.

## Variáveis de ambiente

No mínimo:

- `DATABASE_URL`;
- `ADMIN_EMAIL`;
- `ADMIN_PASSWORD`;
- `SESSION_SECRET`;
- `CLOUDINARY_CLOUD_NAME`;
- `CLOUDINARY_API_KEY`;
- `CLOUDINARY_API_SECRET`;
- `NEXT_PUBLIC_APP_URL`.

## Observabilidade mínima

- logs de inicialização e erros;
- health endpoint;
- tratamento de erro amigável;
- sem stack trace exposto ao cliente;
- revisão periódica de logs do Heroku.

## Backup

Usar recursos de backup do provedor PostgreSQL conforme plano disponível.
