import type { CellId, ItemType } from '../../types/level';
import { useEditorStore } from './editorStore';
import { EditorBoard } from './EditorBoard';

export function SolutionStep() {
  const { size, rooms, roomByCell, items, people, solution, victimRoomCandidateIds, victimId, murdererId } =
    useEditorStore();
  const generateSolution = useEditorStore((s) => s.generateSolution);
  const setVictim = useEditorStore((s) => s.setVictim);
  const setMurderer = useEditorStore((s) => s.setMurderer);

  const itemTypesById = new Map<string, ItemType>();
  const peopleAtCell = new Map<CellId, (typeof people)[number]>();
  if (solution) {
    for (const person of people) {
      const cell = solution[person.id];
      if (cell) peopleAtCell.set(cell, person);
    }
  }

  const sizeMismatch = people.length !== size;
  const candidatePeople = victimRoomCandidateIds
    ? people.filter((p) => victimRoomCandidateIds.includes(p.id))
    : [];

  return (
    <div className="editor-step">
      <div className="editor-step__panel">
        <h3>Автоматический подбор</h3>
        {sizeMismatch && (
          <p className="editor-hint editor-hint--warning">
            Число персонажей ({people.length}) должно совпадать с размером сетки ({size}). Вернись на шаг
            «Персонажи» и поправь.
          </p>
        )}
        <button
          type="button"
          className="menu-button"
          disabled={sizeMismatch}
          onClick={() => generateSolution()}
        >
          {solution ? 'Подобрать заново' : 'Подобрать решение'}
        </button>

        {solution && !victimRoomCandidateIds && (
          <p className="editor-hint editor-hint--warning">
            Не получилось найти комнату ровно с двумя людьми — добавь/измени комнаты и попробуй снова.
          </p>
        )}

        {solution && candidatePeople.length === 2 && (
          <div className="editor-victim-picker">
            <p className="editor-hint">
              В одной комнате оказались {candidatePeople[0].name} и {candidatePeople[1].name}. Выбери, кто из них
              жертва, а кто убийца:
            </p>
            {candidatePeople.map((person) => (
              <div key={person.id} className="editor-victim-picker__row">
                <span className="editor-color-preview" style={{ backgroundColor: person.color }} />
                <span className="editor-victim-picker__name">{person.name}</span>
                <label>
                  <input
                    type="radio"
                    name="victim"
                    checked={victimId === person.id}
                    onChange={() => setVictim(person.id)}
                  />
                  Жертва
                </label>
                <label>
                  <input
                    type="radio"
                    name="murderer"
                    checked={murdererId === person.id}
                    onChange={() => setMurderer(person.id)}
                  />
                  Убийца
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="editor-step__board">
        <EditorBoard
          size={size}
          rooms={rooms}
          roomByCell={roomByCell}
          items={items}
          itemTypesById={itemTypesById}
          peopleAtCell={peopleAtCell}
          interactive={false}
        />
      </div>
    </div>
  );
}
