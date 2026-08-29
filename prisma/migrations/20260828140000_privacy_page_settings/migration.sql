ALTER TABLE "StoreSettings"
  ADD COLUMN "privacyPageContent" TEXT NOT NULL DEFAULT '';

UPDATE "StoreSettings"
SET "privacyPageContent" = '<p>A RestauraPhone utiliza cookies e tecnologias semelhantes para melhorar sua experiencia, entender a navegacao no site e manter recursos como carrinho e preferencias de uso.</p>
<p>As informacoes podem incluir identificadores anonimos de sessao, paginas acessadas, termos pesquisados e interacoes com produtos, carrinho e WhatsApp.</p>
<ul><li>Melhorar a navegacao e o desempenho do catalogo.</li><li>Medir visitas, buscas e interesse em produtos.</li><li>Manter preferencias e funcionalidades essenciais do site.</li></ul>
<p>Para solicitar mais informacoes, entre em contato pelos canais informados no site.</p>'
WHERE "privacyPageContent" = '';