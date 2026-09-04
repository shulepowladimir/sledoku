import { useState } from 'react';
import { useEditorStore } from './editorStore';
import { exportLevel } from './exportLevel';

const THEME_KEYS = [
  'airport',
  'amusementpark',
  'apartment',
  'egypt',
  'forest',
  'hospital',
  'hotel',
  'island',
  'lighthouse',
  'mall',
  'medieval',
  'museum',
  'office',
  'park',
  'prison',
  'shop',
  'space',
  'stadium',
  'station',
  'train',
  'wildwest',
  'wildwest2',
  'wizardschool',
  'zoo',
];

export function ExportStep() {
  const state = useEditorStore();
  const setMeta = useEditorStore((s) => s.setMeta);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ fileName: string; fileContent: string } | null>(null);

  const handleExport = () => {
    const result = exportLevel({
      size: state.size,
      rooms: state.rooms,
      roomByCell: state.roomByCell,
      items: state.items,
      people: state.people,
      solution: state.solution,
      victimId: state.victimId,
      murdererId: state.murdererId,
      clues: state.clues,
      meta: state.meta,
    });
    if ('error' in result) {
      setError(result.error);
      setPreview(null);
      return;
    }
    setError(null);
    setPreview(result);

    const blob = new Blob([result.fileContent], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="editor-step editor-step--single">
      <div className="editor-step__panel editor-step__panel--wide">
        <label className="editor-field">
          <span>Название уровня</span>
          <input
            type="text"
            value={state.meta.title}
            onChange={(e) => setMeta({ title: e.target.value })}
            placeholder="Например: Тайна старой библиотеки"
          />
        </label>

        <label className="editor-field">
          <span>Тема (используется для иконки в меню)</span>
          <select value={state.meta.theme} onChange={(e) => setMeta({ theme: e.target.value })}>
            {THEME_KEYS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </label>

        <label className="editor-field">
          <span>Сложность (1-10)</span>
          <input
            type="number"
            min={1}
            max={10}
            value={state.meta.difficulty}
            onChange={(e) => setMeta({ difficulty: Math.max(1, Math.min(10, Number(e.target.value) || 1)) })}
          />
        </label>

        {error && <p className="editor-hint editor-hint--warning">{error}</p>}

        <button type="button" className="menu-button" onClick={handleExport}>
          Экспортировать .ts файл
        </button>

        {preview && (
          <div className="editor-export-success">
            <p>
              Файл <code>{preview.fileName}</code> скачался. Как добавить его в игру — смотри инструкцию под конструктором.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
