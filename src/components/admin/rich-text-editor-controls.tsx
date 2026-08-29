"use client";

import { Button } from "@/components/ui/button";

type RichTextEditorControlsProps = {
  editorId: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getEditor(editorId: string) {
  const editor = document.getElementById(editorId);

  return editor instanceof HTMLTextAreaElement ? editor : null;
}

function commitEditorValue(
  editor: HTMLTextAreaElement,
  nextValue: string,
  selectionStart: number,
  selectionEnd: number
) {
  editor.value = nextValue;
  editor.dispatchEvent(new Event("input", { bubbles: true }));
  editor.focus();
  editor.setSelectionRange(selectionStart, selectionEnd);
}

export function RichTextEditorControls({
  editorId
}: RichTextEditorControlsProps) {
  function replaceSelection(getReplacement: (selectedText: string) => string) {
    const editor = getEditor(editorId);

    if (!editor) {
      return;
    }

    const selectionStart = editor.selectionStart;
    const selectionEnd = editor.selectionEnd;
    const selectedText = editor.value.slice(selectionStart, selectionEnd);
    const replacement = getReplacement(selectedText);
    const nextValue =
      editor.value.slice(0, selectionStart) +
      replacement +
      editor.value.slice(selectionEnd);

    commitEditorValue(
      editor,
      nextValue,
      selectionStart,
      selectionStart + replacement.length
    );
  }

  function wrapSelection(prefix: string, suffix: string, placeholder: string) {
    replaceSelection((selectedText) =>
      `${prefix}${selectedText || placeholder}${suffix}`
    );
  }

  function addLink() {
    const href = window.prompt("Informe o link");

    if (!href?.trim()) {
      return;
    }

    wrapSelection(
      `<a href="${escapeHtml(href.trim())}">`,
      "</a>",
      "texto do link"
    );
  }

  function addCenteredParagraph() {
    wrapSelection(
      '<p style="text-align: center;">',
      "</p>",
      "Texto centralizado"
    );
  }

  function addBulletList() {
    replaceSelection((selectedText) => {
      const lines = (selectedText || "Item da lista")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      return `<ul>${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`;
    });
  }

  return (
    <div className="flex flex-wrap gap-2 border-b border-border p-2">
      <Button
        aria-label="Negrito"
        onClick={() => wrapSelection("<strong>", "</strong>", "texto")}
        size="sm"
        type="button"
        variant="outline"
      >
        B
      </Button>
      <Button
        aria-label="Itálico"
        onClick={() => wrapSelection("<em>", "</em>", "texto")}
        size="sm"
        type="button"
        variant="outline"
      >
        I
      </Button>
      <Button
        onClick={addCenteredParagraph}
        size="sm"
        type="button"
        variant="outline"
      >
        Centralizar
      </Button>
      <Button onClick={addLink} size="sm" type="button" variant="outline">
        Link
      </Button>
      <Button
        onClick={addBulletList}
        size="sm"
        type="button"
        variant="outline"
      >
        Lista
      </Button>
    </div>
  );
}