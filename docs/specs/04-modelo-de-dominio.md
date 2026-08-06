# 04 — Modelo de domínio

## AdminUser

- id
- email único
- passwordHash
- active
- createdAt
- updatedAt

## AdminSession

- id
- tokenHash único
- adminUserId
- expiresAt
- createdAt

## Category

- id
- name único
- slug único
- displayOrder
- active
- createdAt
- updatedAt

## Product

- id
- categoryId
- description
- slug único
- specification
- priceInCents
- active
- createdAt
- updatedAt

## ProductImage

- id
- productId
- url
- publicId
- altText opcional
- displayOrder
- createdAt

## Promotion

- id
- type
- description
- slug único
- categoryId opcional
- percentage opcional
- comboPriceInCents opcional
- active
- startsAt opcional
- endsAt opcional
- createdAt
- updatedAt

## PromotionProduct

- promotionId
- productId
- displayOrder

Usado somente para combos.

## PromotionImage

- id
- promotionId
- url
- publicId
- altText opcional
- displayOrder
- createdAt

## Banner

- id
- imageUrl
- imagePublicId
- redirectUrl
- altText opcional
- displayOrder
- active
- createdAt
- updatedAt

## StoreSettings

Registro singleton.

- id
- tradeName
- cnpj
- phone
- email
- address
- mapEmbedUrl
- aboutText
- whatsappNumber
- whatsappInitialMessage
- logoUrl
- logoPublicId
- lightPrimaryColor
- lightBackgroundColor
- lightTextColor
- darkPrimaryColor
- darkBackgroundColor
- darkTextColor
- updatedAt

## Enums

### PromotionType

- CATEGORY_PERCENTAGE
- PRODUCT_COMBO

## Restrições importantes

- valores monetários em centavos;
- índices para slugs, ativos, ordenação e relacionamentos;
- unicidade de categoria e slug;
- singleton de StoreSettings;
- constraints de formato de promoção validadas no banco quando possível e obrigatoriamente na aplicação;
- limite de imagens validado na aplicação e em transação.
