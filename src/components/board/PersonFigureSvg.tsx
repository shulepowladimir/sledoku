import type { CSSProperties } from 'react';
import type { Person } from '../../types/level';
import { personArchetypeFor } from '../../assets/iconRegistry';

interface PersonFigureSvgProps {
  person: Person;
  size?: number;
}

const SKIN_TONES = ['#f2c9a0', '#e3b48a', '#c98b5e', '#8f5a3a'];
const HAIR_COLORS = ['#5a4636', '#3a3238', '#a9743a', '#7a4a2a', '#c9a24a'];

function hashString(id: string, seed: number): number {
  let hash = seed;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return hash;
}

function skinToneFor(id: string): string {
  return SKIN_TONES[hashString(id, 7) % SKIN_TONES.length];
}

function hairColorFor(id: string): string {
  return HAIR_COLORS[hashString(id, 101) % HAIR_COLORS.length];
}

export function PersonFigureSvg({ person, size = 40 }: PersonFigureSvgProps) {
  const isFemale = person.gender === 'female';

  // Designer archetype (src/assets/icons/persons/person-<m|f>-<nn>.svg) — clothing must be
  // painted with fill="var(--person-clothing)"; the game feeds the gameplay color in.
  const Archetype = personArchetypeFor(isFemale ? 'female' : 'male', person.id);
  if (Archetype) {
    return (
      <Archetype
        className="person-figure"
        width={size}
        height={size}
        style={{ '--person-clothing': person.color } as CSSProperties}
      />
    );
  }

  const skin = skinToneFor(person.id);
  const hair = hairColorFor(person.id);
  const clothing = person.color;

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className="person-figure">
      {isFemale ? (
        <path
          d="M6.2 23 L7.6 14.2 Q12 12.2 16.4 14.2 L17.8 23 Z"
          fill={clothing}
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M7.2 23 L7.2 14.6 Q12 12.4 16.8 14.6 L16.8 23 Z"
          fill={clothing}
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      )}
      {!isFemale && (
        <path d="M9.8 14.5 L12 17.2 L14.2 14.5" fill="none" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" />
      )}
      {isFemale && (
        <path d="M10 14.3 L12 16 L14 14.3" fill="none" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" />
      )}

      <rect x="10.3" y="10.6" width="3.4" height="2.8" rx="1" fill={skin} />

      <circle cx="12" cy="8" r="4.2" fill={skin} stroke="currentColor" strokeWidth="1.1" />

      {isFemale ? (
        <path
          d="M7.5 8.4 Q6.7 3.2 12 3 Q17.3 3.2 16.5 8.4 Q16.9 13 15.1 10.6 Q15.7 7.6 12 7.6 Q8.3 7.6 8.9 10.6 Q7.1 13 7.5 8.4 Z"
          fill={hair}
          stroke="currentColor"
          strokeWidth="0.7"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M7.6 7.9 Q7.1 3.4 12 3.1 Q16.9 3.4 16.4 7.9 Q16.7 6 12 6 Q7.3 6 7.6 7.9 Z"
          fill={hair}
          stroke="currentColor"
          strokeWidth="0.7"
          strokeLinejoin="round"
        />
      )}

      <circle cx="10.4" cy="8.2" r="0.5" fill="#2a2a2a" />
      <circle cx="13.6" cy="8.2" r="0.5" fill="#2a2a2a" />
      <path d="M10.6 9.9 Q12 10.7 13.4 9.9" fill="none" stroke="#2a2a2a" strokeWidth="0.55" strokeLinecap="round" />
      <circle cx="9.3" cy="9" r="0.45" fill="#e0879f" opacity="0.5" />
      <circle cx="14.7" cy="9" r="0.45" fill="#e0879f" opacity="0.5" />
    </svg>
  );
}
