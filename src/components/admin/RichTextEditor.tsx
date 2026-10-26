'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useState } from 'react';

const BTN: { label: string; title: string; cmd: (e: NonNullable<ReturnType<typeof useEditor>>) => void; active?: (e: NonNullable<ReturnType<typeof useEditor>>) => boolean }[] = [
  { label: 'N', title: 'Negrito', cmd: (e) => e.chain().focus().toggleBold().run(), active: (e) => e.isActive('bold') },
  { label: 'I', title: 'Itálico', cmd: (e) => e.chain().focus().toggleItalic().run(), active: (e) => e.isActive('italic') },
  { label: 'T2', title: 'Título', cmd: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(), active: (e) => e.isActive('heading', { level: 2 }) },
  { label: 'T3', title: 'Subtítulo', cmd: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(), active: (e) => e.isActive('heading', { level: 3 }) },
  { label: '• Lista', title: 'Lista com marcadores', cmd: (e) => e.chain().focus().toggleBulletList().run(), active: (e) => e.isActive('bulletList') },
  { label: '1. Lista', title: 'Lista numerada', cmd: (e) => e.chain().focus().toggleOrderedList().run(), active: (e) => e.isActive('orderedList') },
  { label: 'Citação', title: 'Citação', cmd: (e) => e.chain().focus().toggleBlockquote().run(), active: (e) => e.isActive('blockquote') },
];

export function RichTextEditor({ name, initial, id, invalid }: { name: string; initial: string; id: string; invalid?: boolean }) {
  const [html, setHtml] = useState(initial);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] }, link: false }), Link.configure({ openOnClick: false, autolink: true })],
    content: initial,
    editorProps: { attributes: { id, role: 'textbox', 'aria-multiline': 'true', 'aria-label': 'Conteúdo' } },
    onUpdate: ({ editor: e }) => setHtml(e.getHTML()),
  });
  const setLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Endereço do link (https://…). Deixe vazio para remover.', prev ?? 'https://');
    if (url === null) return;
    if (url === '') editor.chain().focus().extendMarkRange('link').unsetLink().run();
    else editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };
  return (
    <div className="su-editor" aria-invalid={invalid || undefined}>
      <input type="hidden" name={name} value={html} />
      <div className="su-editor__bar" role="toolbar" aria-label="Formatação do texto">
        {editor && BTN.map((b) => (
          <button key={b.label} type="button" className="su-editor__btn" title={b.title} aria-label={b.title} aria-pressed={b.active?.(editor) ?? false} onClick={() => b.cmd(editor)}>{b.label}</button>
        ))}
        <button type="button" className="su-editor__btn" title="Inserir link" aria-label="Inserir link" onClick={setLink} aria-pressed={editor?.isActive('link') ?? false}>Link</button>
      </div>
      <div className="su-editor__content"><EditorContent editor={editor} /></div>
    </div>
  );
}
