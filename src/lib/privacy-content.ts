export const DEFAULT_PRIVACY_PAGE_CONTENT = `
<p>A RestauraPhone utiliza cookies e tecnologias semelhantes para melhorar sua experiência, entender a navegação no site e manter recursos como carrinho e preferências de uso.</p>
<p>As informações podem incluir identificadores anônimos de sessão, páginas acessadas, termos pesquisados e interações com produtos, carrinho e WhatsApp.</p>
<ul>
  <li>Melhorar a navegação e o desempenho do catálogo.</li>
  <li>Medir visitas, buscas e interesse em produtos.</li>
  <li>Manter preferências e funcionalidades essenciais do site.</li>
</ul>
<p>Para solicitar mais informações, entre em contato pelos canais informados no site.</p>
`.trim();

const allowedTags = new Set([
  "a",
  "b",
  "br",
  "div",
  "em",
  "i",
  "li",
  "ol",
  "p",
  "strong",
  "ul"
]);

function escapeAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function isAllowedHref(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) {
    return true;
  }

  if (value.startsWith("#")) {
    return true;
  }

  try {
    const url = new URL(value);
    return ["http:", "https:", "mailto:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function getTextAlignAttribute(attributes: string) {
  const styleMatch = attributes.match(/text-align\s*:\s*(center|left|right|justify)/i);
  const alignMatch = attributes.match(/\salign\s*=\s*["']?(center|left|right|justify)["']?/i);
  const align = styleMatch?.[1] ?? alignMatch?.[1];

  return align ? ` style="text-align: ${align.toLowerCase()};"` : "";
}

function getHrefAttribute(attributes: string) {
  const hrefMatch = attributes.match(/\shref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
  const href = (hrefMatch?.[1] ?? hrefMatch?.[2] ?? hrefMatch?.[3] ?? "").trim();

  if (!href || !isAllowedHref(href)) {
    return "";
  }

  return ` href="${escapeAttribute(href)}" rel="noreferrer"`;
}

export function sanitizeRichTextHtml(value: string) {
  const withoutUnsafeBlocks = value
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|form|input|button)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|form|input|button)[^>]*\/?\s*>/gi, "");

  return withoutUnsafeBlocks
    .replace(/<\s*([a-z][a-z0-9]*)([^>]*)>/gi, (_match, tagName: string, attributes: string) => {
      const tag = tagName.toLowerCase();

      if (!allowedTags.has(tag)) {
        return "";
      }

      if (tag === "br") {
        return "<br>";
      }

      if (tag === "a") {
        return `<a${getHrefAttribute(attributes)}>`;
      }

      return `<${tag}${getTextAlignAttribute(attributes)}>`;
    })
    .replace(/<\s*\/\s*([a-z][a-z0-9]*)\s*>/gi, (_match, tagName: string) => {
      const tag = tagName.toLowerCase();

      return allowedTags.has(tag) && tag !== "br" ? `</${tag}>` : "";
    })
    .trim();
}

export function getPrivacyPageContent(value: string) {
  return sanitizeRichTextHtml(value);
}