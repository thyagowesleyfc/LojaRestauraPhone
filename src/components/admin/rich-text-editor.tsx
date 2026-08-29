import { RichTextEditorControls } from "@/components/admin/rich-text-editor-controls";
import { sanitizeRichTextHtml } from "@/lib/privacy-content";

type RichTextEditorProps = {
  defaultValue: string;
  label: string;
  name: string;
};

export function RichTextEditor({
  defaultValue,
  label,
  name
}: RichTextEditorProps) {
  const editorId = `${name}-editor`;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor={editorId}>
        {label}
      </label>
      <div className="rounded-lg border border-border bg-card">
        <RichTextEditorControls editorId={editorId} />
        <textarea
          className="min-h-56 w-full resize-y rounded-b-lg bg-background px-3 py-2 text-sm leading-7 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          defaultValue={sanitizeRichTextHtml(defaultValue)}
          id={editorId}
          name={name}
        />
      </div>
      <p className="text-xs leading-5 text-muted-foreground">
        Use a barra para inserir negrito, itálico, alinhamento central, links e bullets. O conteúdo salvo será exibido em /pagina-privacidade.
      </p>
    </div>
  );
}