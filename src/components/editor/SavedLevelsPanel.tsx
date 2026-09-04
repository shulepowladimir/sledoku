import { useState } from 'react';
import { useEditorStore } from './editorStore';
import type { EditorSnapshot } from './editorStore';
import { listDrafts, loadDraft, deleteDraft, type SavedDraft } from './savedLevels';

interface Props {
  onClose: () => void;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function SavedLevelsPanel({ onClose }: Props) {
  const [drafts, setDrafts] = useState<SavedDraft[]>(() => listDrafts());
  const loadSnapshot = useEditorStore((s) => s.loadSnapshot);

  const handleLoad = (id: string) => {
    const draft = loadDraft(id);
    if (!draft) return;
    loadSnapshot(draft.state as EditorSnapshot, id);
    onClose();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Удалить этот сохранённый уровень? Это необратимо.')) return;
    deleteDraft(id);
    setDrafts(listDrafts());
  };

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal__header">
          <h2>Мои уровни</h2>
          <button type="button" className="profile-modal__close" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>

        {drafts.length === 0 && <p className="editor-hint">Пока нет сохранённых черновиков.</p>}

        <ul className="editor-draft-list">
          {drafts.map((draft) => (
            <li key={draft.id} className="editor-draft-list__item">
              <div className="editor-draft-list__info">
                <span className="editor-draft-list__name">{draft.name}</span>
                <span className="editor-draft-list__date">{formatDate(draft.savedAt)}</span>
              </div>
              <button type="button" className="menu-button" onClick={() => handleLoad(draft.id)}>
                Открыть
              </button>
              <button
                type="button"
                className="editor-room-list__remove"
                onClick={() => handleDelete(draft.id)}
                aria-label="Удалить"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
