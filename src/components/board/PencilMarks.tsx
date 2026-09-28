import type { CSSProperties } from 'react';

export interface PencilMarkEntry {
  personId: string;
  letter: string;
  color: string;
  isSelected: boolean;
}

interface PencilMarksProps {
  marks: PencilMarkEntry[];
}

export function PencilMarks({ marks }: PencilMarksProps) {
  if (marks.length === 0) return null;
  return (
    <div className="pencil-marks">
      {marks.map((mark) => (
        <span
          key={mark.personId}
          className={`pencil-chip${mark.isSelected ? ' pencil-chip--selected' : ''}`}
          data-person-id={mark.personId}
          style={{ '--pencil-mark-color': mark.color } as CSSProperties}
        >
          {mark.letter}
        </span>
      ))}
    </div>
  );
}
