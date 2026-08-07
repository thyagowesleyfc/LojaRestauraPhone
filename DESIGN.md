---
name: RestauraPhone
description: Catalogo promocional responsivo para compra por WhatsApp.
colors:
  primary: "var(--primary)"
  primary-foreground: "var(--primary-foreground)"
  background: "var(--background)"
  foreground: "var(--foreground)"
  card: "var(--card)"
  card-foreground: "var(--card-foreground)"
  secondary: "var(--secondary)"
  muted: "var(--muted)"
  muted-foreground: "var(--muted-foreground)"
  accent: "var(--accent)"
  accent-foreground: "var(--accent-foreground)"
  destructive: "var(--destructive)"
  border: "var(--border)"
  input: "var(--input)"
  ring: "var(--ring)"
typography:
  display:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "3.75rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0"
  headline:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "0"
  title:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0"
  body:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "0"
  label:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.025em"
rounded:
  sm: "calc(var(--radius) - 4px)"
  md: "calc(var(--radius) - 2px)"
  lg: "var(--radius)"
  xl: "calc(var(--radius) + 4px)"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  section: "3.5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    height: "2.25rem"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    height: "2.25rem"
  card-product:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.lg}"
    padding: "1rem"
  input-field:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "0 0.75rem"
    height: "2.5rem"
---

# Design System: RestauraPhone

## Overview

**Creative North Star: "Vitrine Promocional"**

O sistema visual atual se comporta como uma vitrine de varejo direta: produtos, combos e chamadas de acao aparecem em superficies simples, com hierarquia clara e acento primario reservado para preco, estado ativo e conversao. A interface evita ornamento pesado; a energia promocional vem de imagens grandes, cards em grade, labels curtos em uppercase e botoes objetivos.

A identidade e pragmatica e comercial. O publico precisa entender rapido o que esta em oferta, abrir detalhes quando quiser comparar e chegar ao WhatsApp com pouco atrito. A area administrativa mantem o mesmo vocabulario de superficies, bordas e foco, mas com densidade mais operacional.

**Key Characteristics:**
- Mobile-first, com containers centrais de ate `max-w-6xl`.
- Cards de produto e promocao com borda fina, fundo `card` e raio de `rounded-lg`.
- Verde primario configuravel como acento de conversao e preco.
- Neutros calmos para leitura e operacao, com suporte claro/escuro.
- Imagens reais de produto, banner e promocao como principal sinal visual.

## Colors

A paleta e neutra com um acento promocional configuravel: o primario conduz preco, botoes e estado ativo; o ciano suave aparece como hover/accent secundario; os neutros sustentam contraste e temas.

### Primary
- **Promotional Green** (`var(--primary)`, fallback light `oklch(0.42 0.17 142)`, fallback dark `oklch(0.72 0.17 142)`): usado em botoes primarios, precos, links importantes, indicadores ativos e foco comercial.
- **Primary Ink Reverse** (`var(--primary-foreground)`, fallback light `oklch(0.985 0 0)`, fallback dark `oklch(0.145 0 0)`): texto sobre superficies primarias.

### Secondary
- **Offer Wash** (`var(--accent)`, fallback light `oklch(0.92 0.05 191)`, fallback dark `oklch(0.31 0.07 191)`): hover de navegacao e botoes ghost, fundo de estados leves e suporte visual sem competir com o primario.

### Neutral
- **Store Background** (`var(--background)`): fundo global, configuravel pelo administrador.
- **Store Foreground** (`var(--foreground)`): texto principal, configuravel pelo administrador.
- **Product Surface** (`var(--card)`): cards, paineis e superficies de item.
- **Soft Surface** (`var(--secondary)` / `var(--muted)`): placeholders, secoes discretas e estados de apoio.
- **Muted Text** (`var(--muted-foreground)`): descricoes, textos auxiliares, metadados e precos riscados.
- **Fine Border** (`var(--border)`): divisorias, contornos de cards, header, footer e paineis.
- **Destructive Red** (`var(--destructive)`): remocao, erro e acao negativa.

### Named Rules

**The Conversion Accent Rule.** Use `primary` for preco, compra, WhatsApp, foco ativo e links comerciais; nao espalhe esse acento em decoracao sem acao.

**The Admin-Configurable Rule.** Primary, background and foreground can be changed by store settings; new UI must remain readable when those values change.

## Typography

**Display Font:** Arial, Helvetica, sans-serif
**Body Font:** Arial, Helvetica, sans-serif
**Label/Mono Font:** Arial, Helvetica, sans-serif

**Character:** The type system is utilitarian and direct. Weight, size and spacing create hierarchy; there is no decorative type layer in the incumbent system.

### Hierarchy
- **Display** (600, `text-4xl` to `text-6xl`, tight line height): home hero and primary page titles.
- **Headline** (600, `text-3xl` to `text-4xl`): section titles and catalog page headings.
- **Title** (600, `text-xl`): card headings, promotion titles and subsection labels.
- **Body** (400, `text-sm` to `text-base`, `leading-6` / `leading-7`): descriptions, specifications and explanatory copy.
- **Label** (500, `text-xs` to `text-sm`, sometimes uppercase with `tracking-wide`): category badges, promotion type labels, form labels and metadata.

### Named Rules

**The Practical Type Rule.** Do not introduce decorative font pairings unless a future redesign explicitly replaces the current utilitarian identity.

## Layout

Public screens use a centered content rail (`max-w-6xl`) with `px-6`, generous vertical rhythm and responsive grids. The home starts with a two-column hero on large screens and collapses to a single column on mobile. Catalog sections use `sm:grid-cols-2` and `lg:grid-cols-4` for product density; promotions commonly use `md:grid-cols-2` and `lg:grid-cols-3`.

The admin area and cart are task-oriented: forms use `space-y-6` or `space-y-8`, paired fields use `lg:grid-cols-2`, and summary panels use a right rail only on large screens. Repeated items should keep stable image aspect ratios: square for products and cart thumbnails, video ratio for promotions and banners.

## Elevation & Depth

The system is flat by default. Depth is conveyed through tonal layers, borders, sticky chrome, hover border changes and occasional shadow on floating WhatsApp. Cards are not heavy raised objects; they are bordered commercial tiles.

### Shadow Vocabulary
- **Floating Action Shadow** (`shadow-lg`): used by the fixed WhatsApp shortcut so it remains discoverable over page content.
- **Sticky Blur Layer** (`bg-background/95 backdrop-blur`): used by the public header to separate navigation from scrolling content without a heavy drop shadow.

### Named Rules

**The Bordered Tile Rule.** Product, promotion and cart surfaces should use border plus background before shadow.

## Shapes

The shape language is moderately rounded and consistent: controls use `rounded-md`, cards use `rounded-lg`, and hero/banner frames can use `rounded-xl`. The base radius is `0.5rem`; anything larger should be reserved for high-level media containers, not dense controls.

Images are clipped to their container radius and should keep predictable aspect ratios. Form fields and buttons share the same corner language so the admin UI feels related to the public storefront.

## Components

### Buttons
- **Shape:** compact rounded rectangle (`rounded-md`, height `2.25rem` by default).
- **Primary:** `bg-primary text-primary-foreground`, used for conversion and save actions.
- **Hover / Focus:** color transition on hover; focus uses `focus-visible:ring-[3px] focus-visible:ring-ring/50`.
- **Outline:** `border-border bg-background`, used for secondary navigation and less dominant actions.
- **Ghost:** hover-only accent treatment for navigation items.
- **Destructive:** red fill for removal and negative actions.

### Cards / Containers
- **Corner Style:** softly rounded commercial tiles (`rounded-lg`).
- **Background:** `bg-card` for item cards and summary panels; `bg-muted` for placeholders.
- **Shadow Strategy:** flat at rest; product card hover shifts border to `primary`.
- **Border:** `border border-border` is the default frame.
- **Internal Padding:** most card content uses `p-4`; summary panels use `p-5` or `p-6`.

### Inputs / Fields
- **Style:** `h-10`, full width, `rounded-md`, `border-input`, `bg-background`, `px-3`, `text-sm`.
- **Focus:** border switches to `ring` and adds a 3px translucent focus ring.
- **Files:** file inputs use a secondary pill-like file button inside the field.
- **Error / Disabled:** errors use destructive color; disabled controls reduce opacity and remove pointer events.

### Navigation
- **Public Header:** sticky top bar with translucent background, blur and bottom border.
- **Desktop:** horizontal ghost buttons, active route gets `bg-accent`.
- **Mobile:** compact theme/menu buttons plus a stacked dropdown of text links.
- **Footer:** muted band with institutional info and compact links.

### Product Card

Square image first, then short title, price and optional discount metadata. The card is a link; hover is subtle border and image scale, not a full decorative transformation.

### Promotion Card

Video-ratio image, uppercase type label, title, offer detail and outline CTA. Combo descriptions can wrap into body text; the CTA remains secondary because the detail page owns the cart action.

### Cart Summary

Cart rows combine thumbnail, item type label, title, detail text, quantity controls and subtotal. The summary panel isolates total and WhatsApp action in a right rail on desktop.

## Do's and Don'ts

### Do:
- **Do** keep product and promotion imagery prominent and uncropped enough to sell the item.
- **Do** use `primary` for price, add-to-cart, WhatsApp and active commercial states.
- **Do** preserve the bordered-card vocabulary for catalog, promotion and cart surfaces.
- **Do** keep admin screens denser and quieter than public selling screens.
- **Do** verify contrast when store-configured theme colors change.

### Don't:
- **Don't** turn every section into a floating card; page sections should remain open layouts.
- **Don't** add decorative gradients or large visual effects that compete with real product images.
- **Don't** introduce online-payment, stock or account-management UI into this MVP visual system.
- **Don't** rely on shadows as the primary separation mechanism.
- **Don't** fabricate social proof, ratings, customer logos or claims absent from `PRODUCT.md`.
