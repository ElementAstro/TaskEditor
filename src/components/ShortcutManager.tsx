import { useEffect } from 'react';
import useEditorStore from '@/store/editorStore';

const defaultShortcuts = [
  {
    id: 'undo',
    name: '撤销',
    keys: ['Control', 'z'],
    action: () => useEditorStore.getState().undo(),
  },
  {
    id: 'redo',
    name: '重做',
    keys: ['Control', 'Shift', 'z'],
    action: () => useEditorStore.getState().redo(),
  },
  // ...more shortcuts
];

export default function ShortcutManager() {
  const { setShortcuts } = useEditorStore();

  useEffect(() => {
    setShortcuts(defaultShortcuts);

    const handleKeyDown = (e: KeyboardEvent) => {
      const shortcuts = useEditorStore.getState().shortcuts;
      shortcuts.forEach(shortcut => {
        const isMatch = shortcut.keys.every(key => {
          if (key === 'Control') return e.ctrlKey;
          if (key === 'Shift') return e.shiftKey;
          if (key === 'Alt') return e.altKey;
          return e.key.toLowerCase() === key.toLowerCase();
        });

        if (isMatch) {
          e.preventDefault();
          shortcut.action();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setShortcuts]);

  return null;
}
