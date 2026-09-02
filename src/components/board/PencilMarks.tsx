export interface PencilMarkEntry {
  letter: string;
  color: string;
}

interface PencilMarksProps {
  marks: PencilMarkEntry[];
}

export function PencilMarks({ marks }: PencilMarksProps) {
  if (marks.length === 0) return null;
  return (
    <div className="pencil-marks">
      {marks.map((mark, i) => (
        <span
          key={`${mark.letter}-${i}`}
          className="pencil-chip"
          style={{ color: mark.color, borderColor: mark.color }}
        >
          {mark.letter}
        </span>
      ))}
    </div>
  );
}
