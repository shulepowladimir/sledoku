import { useEffect, useState } from 'react';
import type { Clue } from '../../types/clue';
import type { Person } from '../../types/level';
import { personStatus } from '../../engine/selectors';
import { useGameStore } from '../../state/gameStore';
import { useTutorialStore } from '../../state/tutorialStore';
import { useIsMobile } from '../../hooks/useIsMobile';
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

  // Мобильный аккордеон: раскрытая карточка человека (тап = выбор + раскрытие клю)
  // и свёрнутый блок общих подсказок. Десктопная ветка ниже не меняется.
  const isMobile = useIsMobile();
  const [expandedPersonId, setExpandedPersonId] = useState<string | null>(null);
  const [generalOpen, setGeneralOpen] = useState(false);

  // Tutorial on mobile: clues live inside the collapsed accordion — whenever the active step
  // targets a roster row (target or alsoSelectors), that person's clues must be expanded.
  const tutorialActive = useTutorialStore((s) => s.active);
  const tutorialStepIndex = useTutorialStore((s) => s.stepIndex);
  const tutorialSteps = useTutorialStore((s) => s.steps);
  useEffect(() => {
    if (!isMobile || !tutorialActive) return;
    const step = tutorialSteps[tutorialStepIndex];
    if (!step) return;
    const selectors = [
      ...(step.target.kind === 'selector' ? [step.target.selector] : []),
      ...(step.alsoSelectors ?? []),
    ];
    for (const selector of selectors) {
      const match = selector.match(/roster-person-(.+)$/);
      if (match) {
        setExpandedPersonId(match[1]);
        return;
      }
    }
  }, [isMobile, tutorialActive, tutorialStepIndex, tutorialSteps]);

  const placedCellByPerson = new Map(Object.entries(player.placements));
  // General section: clues without a subject (level-wide rules) plus role-subject clues — their
  // owner is the hidden role holder, unknown to the player, so they cannot hang on a person's row.
  const generalClues = level.clues.filter((clue) => !('subject' in clue) || clue.subject.type === 'role');
  const columnCount = level.people.length >= 9 ? 3 : level.people.length >= 7 ? 2 : 1;
  const panelColsClass = columnCount > 1 ? ` roster-panel--cols-${columnCount}` : '';
  const listColsClass = columnCount > 1 ? ` roster-list--cols-${columnCount}` : '';

  const handleMobilePersonTap = (personId: string) => {
    if (expandedPersonId === personId && selectedPersonId === personId) {
      setExpandedPersonId(null);
      return;
    }
    setExpandedPersonId(personId);
    selectPerson(personId);
  };

  const headerFor = (person: Person) => {
    const isPlaced = placedCellByPerson.has(person.id);
    const status = isPlaced ? personStatus(player, person.id) : undefined;
    const statusClass = status === 'correct' ? 'roster-entry--correct' : status === 'incorrect' ? 'roster-entry--incorrect' : '';
    const selectedClass = selectedPersonId === person.id ? 'roster-entry--selected' : '';
    const isFemale = person.gender === 'female';
    const placedStatusText = isFemale ? 'размещена' : 'размещён';
    const unplacedStatusText = isFemale ? 'не размещена' : 'не размещён';
    return { isPlaced, statusClass, selectedClass, placedStatusText, unplacedStatusText };
  };

  if (isMobile) {
    return (
      <aside className="roster-panel roster-panel--mobile">
        <h2 className="roster-panel__title">{level.meta.title}</h2>

        {generalClues.length > 0 && (
          <section className="roster-panel__section" data-testid="roster-general">
            <button
              type="button"
              className="roster-mobile__general-toggle"
              onClick={() => setGeneralOpen((v) => !v)}
              aria-expanded={generalOpen}
            >
              Общие подсказки <span className="roster-mobile__general-count">{generalClues.length}</span>
              <span className="roster-mobile__chevron" aria-hidden>{generalOpen ? '▲' : '▼'}</span>
            </button>
            {generalOpen && (
              <ol className="clue-list roster-mobile__general-list">
                {generalClues.map((clue) => (
                  <li key={clue.id} className="clue-item">{clue.text}</li>
                ))}
              </ol>
            )}
          </section>
        )}

        <section className="roster-panel__section">
          <ul className="roster-list roster-mobile__list">
            {level.people.map((person) => {
              const { isPlaced, statusClass, selectedClass, placedStatusText, unplacedStatusText } = headerFor(person);
              const personalClues = person.isVictim ? [] : personalCluesFor(level.clues, person.id);
              const expanded = expandedPersonId === person.id;
              return (
                <li key={person.id} className={`roster-entry ${statusClass} ${selectedClass} roster-mobile__entry${expanded ? ' roster-mobile__entry--open' : ''}`}>
                  <button
                    type="button"
                    className="roster-entry__header roster-mobile__header"
                    data-testid={`roster-person-${person.id}`}
                    aria-expanded={expanded}
                    onClick={() => handleMobilePersonTap(person.id)}
                  >
                    <RosterAvatar person={person} />
                    <span className="roster-entry__name" style={{ color: person.color }}>{person.name}</span>
                    <span className="roster-entry__status">{isPlaced ? placedStatusText : unplacedStatusText}</span>
                    <span className="roster-mobile__chevron" aria-hidden>{expanded ? '▲' : '▼'}</span>
                  </button>
                  {expanded && (
                    <ul className="roster-entry__clues roster-mobile__clues">
                      {person.isVictim ? (
                        <li className="roster-entry__clue">{VICTIM_LINE}</li>
                      ) : (
                        personalClues.map((clue) => (
                          <li key={clue.id} className="roster-entry__clue">{clue.text}</li>
                        ))
                      )}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </aside>
    );
  }

  return (
    <aside className={`roster-panel${panelColsClass}`}>
      <h2 className="roster-panel__title">{level.meta.title}</h2>

      <section className="roster-panel__section">
        <h3>Действующие лица</h3>
        <ul className={`roster-list${listColsClass}`}>
          {level.people.map((person) => {
            const { isPlaced, statusClass, selectedClass, placedStatusText, unplacedStatusText } = headerFor(person);
            const personalClues = person.isVictim ? [] : personalCluesFor(level.clues, person.id);
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
        <section className="roster-panel__section" data-testid="roster-general">
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
