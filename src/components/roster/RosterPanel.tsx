import type { Clue } from '../../types/clue';
import { personStatus } from '../../engine/selectors';
import { useGameStore } from '../../state/gameStore';
import { RosterAvatar } from './RosterAvatar';

const VICTIM_LINE = 'Жертва находилась наедине с убийцей';

function personalCluesFor(clues: Clue[], personId: string): Clue[] {
  return clues.filter((clue) => 'subject' in clue && clue.subject.type === 'person' && clue.subject.id === personId);
}

export function RosterPanel() {
  const level = useGameStore((s) => s.level);
  const player = useGameStore((s) => s.player);
  const selectedPersonId = useGameStore((s) => s.selectedPersonId);
  const selectPerson = useGameStore((s) => s.selectPerson);

  const placedCellByPerson = new Map(Object.entries(player.placements));
  // General section: clues without a subject (level-wide rules) plus role-subject clues — their
  // owner is the hidden role holder, unknown to the player, so they cannot hang on a person's row.
  const generalClues = level.clues.filter((clue) => !('subject' in clue) || clue.subject.type === 'role');
  const columnCount = level.people.length >= 9 ? 3 : level.people.length >= 7 ? 2 : 1;
  const panelColsClass = columnCount > 1 ? ` roster-panel--cols-${columnCount}` : '';
  const listColsClass = columnCount > 1 ? ` roster-list--cols-${columnCount}` : '';

  return (
    <aside className={`roster-panel${panelColsClass}`}>
      <h2 className="roster-panel__title">{level.meta.title}</h2>

      <section className="roster-panel__section">
        <h3>Действующие лица</h3>
        <ul className={`roster-list${listColsClass}`}>
          {level.people.map((person) => {
            const isPlaced = placedCellByPerson.has(person.id);
            const status = isPlaced ? personStatus(player, person.id) : undefined;
            const statusClass = status === 'correct' ? 'roster-entry--correct' : status === 'incorrect' ? 'roster-entry--incorrect' : '';
            const selectedClass = selectedPersonId === person.id ? 'roster-entry--selected' : '';
            const personalClues = person.isVictim ? [] : personalCluesFor(level.clues, person.id);
            const isFemale = person.gender === 'female';
            const placedStatusText = isFemale ? 'размещена' : 'размещён';
            const unplacedStatusText = isFemale ? 'не размещена' : 'не размещён';
            return (
              <li key={person.id} className={`roster-entry ${statusClass} ${selectedClass}`}>
                <button
                  type="button"
                  className="roster-entry__header"
                  data-testid={`roster-person-${person.id}`}
                  onClick={() => selectPerson(person.id)}
                >
                  <RosterAvatar person={person} />
                  <span className="roster-entry__name" style={{ color: person.color }}>{person.name}</span>
                  <span className="roster-entry__status">{isPlaced ? placedStatusText : unplacedStatusText}</span>
                </button>
                <ul className="roster-entry__clues">
                  {person.isVictim ? (
                    <li className="roster-entry__clue">{VICTIM_LINE}</li>
                  ) : (
                    personalClues.map((clue) => (
                      <li key={clue.id} className="roster-entry__clue">
                        {clue.text}
                      </li>
                    ))
                  )}
                </ul>
              </li>
            );
          })}
        </ul>
      </section>

      {generalClues.length > 0 && (
        <section className="roster-panel__section">
          <h3>Общие подсказки</h3>
          <ol className="clue-list">
            {generalClues.map((clue) => (
              <li key={clue.id} className="clue-item">
                {clue.text}
              </li>
            ))}
          </ol>
        </section>
      )}
    </aside>
  );
}
