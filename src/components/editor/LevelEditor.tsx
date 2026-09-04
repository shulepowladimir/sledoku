import { useState } from 'react';
import { useEditorStore } from './editorStore';
import { GridStep } from './GridStep';
import { ItemsStep } from './ItemsStep';
import { PeopleStep } from './PeopleStep';
import { SolutionStep } from './SolutionStep';
import { ClueStep } from './ClueStep';
import { ExportStep } from './ExportStep';
import { SavedLevelsPanel } from './SavedLevelsPanel';
import { saveDraft, newDraftId } from './savedLevels';

const STEPS = [
  { id: 'grid', label: '1. Сетка и комнаты' },
  { id: 'items', label: '2. Предметы' },
  { id: 'people', label: '3. Персонажи' },
  { id: 'solution', label: '4. Решение' },
  { id: 'clues', label: '5. Подсказки' },
  { id: 'export', label: '6. Публикация' },
] as const;

type StepId = (typeof STEPS)[number]['id'];

export function LevelEditor() {
  const [step, setStep] = useState<StepId>('grid');
  const [savedPanelOpen, setSavedPanelOpen] = useState(false);
  const reset = useEditorStore((s) => s.reset);
  const getSnapshot = useEditorStore((s) => s.getSnapshot);
  const currentDraftId = useEditorStore((s) => s.currentDraftId);
  const setCurrentDraftId = useEditorStore((s) => s.setCurrentDraftId);
  const metaTitle = useEditorStore((s) => s.meta.title);

  const handleSave = () => {
    const defaultName = metaTitle.trim() || 'Без названия';
    const name = prompt('Название черновика (для себя, можно не совпадать с названием уровня):', defaultName);
    if (name === null) return; // отменено
    const id = currentDraftId ?? newDraftId();
    saveDraft(id, name.trim() || defaultName, getSnapshot());
    setCurrentDraftId(id);
    alert('Сохранено!');
  };

  return (
    <div className="level-editor">
      <header className="level-editor__header">
        <h1>Конструктор уровней (Этап 1)</h1>
        <div className="level-editor__header-actions">
          <button type="button" className="editor-tool-btn" onClick={handleSave}>
            💾 Сохранить
          </button>
          <button type="button" className="editor-tool-btn" onClick={() => setSavedPanelOpen(true)}>
            📂 Мои уровни
          </button>
          <button
            type="button"
            className="editor-tool-btn"
            onClick={() => {
              if (confirm('Точно очистить всё и начать заново? Несохранённые изменения пропадут.')) reset();
            }}
          >
            Начать заново
          </button>
        </div>
      </header>

      <nav className="level-editor__tabs">
        {STEPS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`level-editor__tab${step === s.id ? ' level-editor__tab--active' : ''}`}
            onClick={() => setStep(s.id)}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <main className="level-editor__body">
        {step === 'grid' && <GridStep />}
        {step === 'items' && <ItemsStep />}
        {step === 'people' && <PeopleStep />}
        {step === 'solution' && <SolutionStep />}
        {step === 'clues' && <ClueStep />}
        {step === 'export' && <ExportStep />}
      </main>

      <footer className="level-editor__footer">
        <p>
          Совет: добавляй подсказки постепенно и жми «Проверить решение» на шаге 5 — как только увидишь «Решение
          единственно», уровень готов к экспорту.
        </p>
      </footer>

      {savedPanelOpen && <SavedLevelsPanel onClose={() => setSavedPanelOpen(false)} />}
    </div>
  );
}
