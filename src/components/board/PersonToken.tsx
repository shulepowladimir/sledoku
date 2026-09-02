import type { Person } from '../../types/level';
import type { PersonCheckStatus } from '../../types/game';
import { contrastTextColor } from '../../utils/color';
import { PersonFigureSvg } from './PersonFigureSvg';

interface PersonTokenProps {
  person: Person;
  status?: PersonCheckStatus;
}

export function PersonToken({ person, status }: PersonTokenProps) {
  const isFemale = person.gender === 'female';
  const ringClass = status === 'correct' ? 'person-token--correct' : status === 'incorrect' ? 'person-token--incorrect' : '';

  return (
    <div className={`person-token ${isFemale ? 'person-token--female' : 'person-token--male'} ${ringClass}`}>
      <PersonFigureSvg person={person} size={40} />
      <span
        className="person-initial"
        style={{ backgroundColor: person.color, color: contrastTextColor(person.color) }}
      >
        {person.initialLetter}
      </span>
    </div>
  );
}
