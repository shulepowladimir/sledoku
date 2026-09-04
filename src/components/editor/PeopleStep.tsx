import { useState } from 'react';
import type { Gender } from '../../types/level';
import { useEditorStore } from './editorStore';
import { transliterate } from '../../lib/transliterate';
import { NAME_LIBRARY_LETTERS, namesForLetter } from '../../lib/nameLibrary';

const PALETTE = [
  '#4d8dff',
  '#3cbf7c',
  '#e0824a',
  '#9b7ce0',
  '#c9536b',
  '#2bc4c4',
  '#d9a441',
  '#5fa8d3',
  '#b06ab3',
  '#8a5a3a',
  '#e0629b',
  '#7cc9e8',
  '#c98f38',
  '#e0a94a',
];

export function PeopleStep() {
  const { people, size } = useEditorStore();
  const addPerson = useEditorStore((s) => s.addPerson);
  const updatePerson = useEditorStore((s) => s.updatePerson);
  const removePerson = useEditorStore((s) => s.removePerson);

  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [nameMode, setNameMode] = useState<'library' | 'custom'>('library');
  const [letter, setLetter] = useState(NAME_LIBRARY_LETTERS[0] ?? 'А');
  const namesForCurrentLetter = namesForLetter(letter);
  const [libraryName, setLibraryName] = useState(namesForCurrentLetter[0]?.name ?? '');

  const usedColors = new Set(people.map((p) => p.color));
  const nextColor = PALETTE.find((c) => !usedColors.has(c)) ?? PALETTE[people.length % PALETTE.length];

  const handleLetterChange = (nextLetter: string) => {
    setLetter(nextLetter);
    const first = namesForLetter(nextLetter)[0];
    if (first) {
      setLibraryName(first.name);
      setGender(first.gender);
    }
  };

  const handleLibraryNameChange = (nextName: string) => {
    setLibraryName(nextName);
    const found = namesForCurrentLetter.find((n) => n.name === nextName);
    if (found) setGender(found.gender);
  };

  const handleAdd = () => {
    const trimmed = (nameMode === 'library' ? libraryName : name).trim();
    if (!trimmed) return;
    const firstLetter = trimmed[0].toUpperCase();
    addPerson({ name: trimmed, initialLetter: firstLetter, gender, color: nextColor });
    setName('');
  };

  return (
    <div className="editor-step editor-step--single">
      <div className="editor-step__panel editor-step__panel--wide">
        <p className="editor-hint">
          Нужно ровно столько персонажей, сколько размер сетки: сейчас {size}×{size} → нужно {size} человек. Сейчас
          добавлено: {people.length}.
        </p>

        <div className="editor-name-mode-toggle">
          <button
            type="button"
            className={`editor-tool-btn${nameMode === 'library' ? ' editor-tool-btn--active' : ''}`}
            onClick={() => setNameMode('library')}
          >
            Из библиотеки
          </button>
          <button
            type="button"
            className={`editor-tool-btn${nameMode === 'custom' ? ' editor-tool-btn--active' : ''}`}
            onClick={() => setNameMode('custom')}
          >
            Своё имя
          </button>
        </div>

        <div className="editor-add-person">
          {nameMode === 'library' ? (
            <>
              <select value={letter} onChange={(e) => handleLetterChange(e.target.value)}>
                {NAME_LIBRARY_LETTERS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              <select value={libraryName} onChange={(e) => handleLibraryNameChange(e.target.value)}>
                {namesForCurrentLetter.map((n) => (
                  <option key={n.name} value={n.name}>
                    {n.name}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <input
              type="text"
              placeholder="Имя персонажа"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
          )}
          <select value={gender} onChange={(e) => setGender(e.target.value as Gender)}>
            <option value="male">Мужчина</option>
            <option value="female">Женщина</option>
          </select>
          <span className="editor-color-preview" style={{ backgroundColor: nextColor }} />
          <button type="button" className="menu-button" onClick={handleAdd}>
            Добавить
          </button>
        </div>

        <ul className="editor-person-list">
          {people.map((person) => (
            <li key={person.id} className="editor-person-list__item">
              <span className="editor-person-list__avatar" style={{ backgroundColor: person.color }}>
                {person.initialLetter}
              </span>
              <input
                className="editor-person-list__name"
                value={person.name}
                onChange={(e) =>
                  updatePerson(person.id, { name: e.target.value, initialLetter: e.target.value[0]?.toUpperCase() ?? '' })
                }
              />
              <select
                value={person.gender}
                onChange={(e) => updatePerson(person.id, { gender: e.target.value as Gender })}
              >
                <option value="male">Муж.</option>
                <option value="female">Жен.</option>
              </select>
              <input
                type="color"
                value={person.color}
                onChange={(e) => updatePerson(person.id, { color: e.target.value })}
              />
              <span className="editor-person-list__id">id: {transliterate(person.name) || '—'}</span>
              <button
                type="button"
                className="editor-room-list__remove"
                onClick={() => removePerson(person.id)}
                aria-label="Удалить персонажа"
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
