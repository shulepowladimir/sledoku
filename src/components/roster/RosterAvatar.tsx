import type { Person } from '../../types/level';
import { PersonFigureSvg } from '../board/PersonFigureSvg';

interface RosterAvatarProps {
  person: Person;
}

export function RosterAvatar({ person }: RosterAvatarProps) {
  const isFemale = person.gender === 'female';
  return (
    <span className={`roster-avatar ${isFemale ? 'roster-avatar--female' : 'roster-avatar--male'}`}>
      <PersonFigureSvg person={person} size={18} />
    </span>
  );
}
