# 04 - Modelo de dominio

## AdminUser

- id
- email unico
- passwordHash
- active
- createdAt
- updatedAt

## AdminSession

- id
- tokenHash unico
- adminUserId
- expiresAt
- createdAt

## Category

- id
- name unico
- slug unico
- displayOrder
- active
- createdAt
- updatedAt

## Product

- id
- categoryId
- description
- slug unico
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

## Characteristic

- id
- name unico
- slug unico
- displayOrder
- active
- createdAt
- updatedAt

## CharacteristicOption

- id
- characteristicId
- name
- slug
- displayOrder
- active
- createdAt
- updatedAt

## CategoryCharacteristic

- categoryId
- characteristicId
- displayOrder
- required
- createdAt

## ProductVariant

- id
- productId
- sku unico
- optionSignature
- active
- createdAt
- updatedAt

## ProductVariantValue

- productVariantId
- characteristicId
- characteristicOptionId
- createdAt

## ProductVariantImage

- id
- productVariantId
- url
- publicId
- altText opcional
- displayOrder
- createdAt

## Promotion

- id
- type
- description
- slug unico
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
- mobileImageUrl opcional
- mobileImagePublicId opcional
- redirectUrl
- altText opcional
- displayOrder
- active
- createdAt
- updatedAt

## StoreLink

- id
- title
- description
- redirectUrl
- imageUrl opcional
- imagePublicId opcional
- displayOrder
- active
- createdAt
- updatedAt

## CustomerOrder

- id
- code unico com 10 caracteres A-Z/0-9
- sessionId opcional
- totalInCents
- whatsappMessage
- createdAt

## CustomerOrderItem

- id
- orderId
- type
- sourceProductId opcional
- sourceProductVariantId opcional
- sourcePromotionId opcional
- description
- detail opcional
- sku opcional
- quantity
- unitPriceInCents
- subtotalInCents
- imageUrl opcional
- createdAt

## AnalyticsEvent

- id
- type
- sessionId
- dedupeKey opcional
- productId opcional
- productVariantId opcional
- promotionId opcional
- categoryId opcional
- linkId opcional
- searchTerm opcional
- searchTermNormalized opcional
- resultsCount opcional
- pagePath
- UTM opcional
- createdAt

## MarketingIntegration

- id
- provider unico
- identifier
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
- privacyPageContent
- whatsappNumber
- whatsappInitialMessage
- bannerTransitionSeconds
- offerCountdownHeadline
- offerCountdownLink
- offerCountdownDurationSeconds
- offerCountdownBackgroundColor
- logoUrl
- logoPublicId
- darkLogoUrl
- darkLogoPublicId
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

### MarketingIntegrationProvider

- GOOGLE_TAG_MANAGER
- META_PIXEL
- TIKTOK_PIXEL

### AnalyticsEventType

- PAGE_VIEW
- PRODUCT_VIEW
- SEARCH
- SEARCH_NO_RESULTS
- ADD_TO_CART
- REMOVE_FROM_CART
- WHATSAPP_CLICK
- ORDER_SENT_TO_WHATSAPP
- PROMOTION_VIEW
- CATEGORY_VIEW
- LINK_CLICK

### OrderItemType

- PRODUCT
- VARIANT
- COMBO

## Restricoes importantes

- valores monetarios em centavos;
- indices para slugs, ativos, ordenacao e relacionamentos;
- unicidade de categoria e slug;
- SKU unico por variante;
- codigo unico de pedido validado por formato A-Z/0-9 com 10 caracteres;
- singleton de StoreSettings;
- constraints de formato de promocao validadas no banco quando possivel e obrigatoriamente na aplicacao;
- quantidades e valores de itens de pedido validados por constraints de banco;
- limite de imagens validado na aplicacao e em transacao.