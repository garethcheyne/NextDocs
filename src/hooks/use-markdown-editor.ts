import { useRef, useCallback } from 'react';

export function useMarkdownEditor(content: string, setContent: (content: string) => void) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInsert = useCallback(
    (before: string, after: string = '', placeholder: string = '') => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end);
      const textToInsert = selectedText || placeholder;

      const newContent =
        content.substring(0, start) +
        before +
        textToInsert +
        after +
        content.substring(end);

      setContent(newContent);

      // Set cursor position after the inserted text
      setTimeout(() => {
        const newCursorPos = start + before.length + textToInsert.length;
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    },
    [content, setContent]
  );

  return { textareaRef, handleInsert };
}
