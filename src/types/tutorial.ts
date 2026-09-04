import type { CellId, PersonId } from './level';

/** Where the spotlight hole is cut and the tooltip points. */
export type TutorialTarget =
  | { kind: 'none' } // modal, no highlight (act 0 greetings / final recap)
  | { kind: 'selector'; selector: string } // CSS/data-testid selector of a HUD/roster/menu element
  | { kind: 'cell'; cellId: CellId }
  | { kind: 'cells'; cellIds: CellId[] }; // several cells at once (e.g. a whole room strip)

/** How the step advances. */
export type TutorialAdvance =
  | { kind: 'next' } // "Далее" button — pure info step
  | { kind: 'place'; personId: PersonId; cellId: CellId } // wait until the person is placed here
  | { kind: 'remove'; personId: PersonId } // wait until the person is picked up from the board
  | { kind: 'pencil'; personId: PersonId; cellIds: CellId[] } // wait until ALL listed cells carry this person's pencil mark
  | { kind: 'unpencil'; personId: PersonId; cellIds: CellId[] } // wait until NONE of the listed cells carries the mark
  | { kind: 'cross'; cellIds: CellId[] } // wait until ALL listed cells carry a manual cross
  | { kind: 'selectPerson'; personId: PersonId } // wait until the person is selected in the roster
  | { kind: 'mode'; mode: 'person' | 'cross' | 'erase' } // wait until the interaction mode matches
  | { kind: 'undoCount'; count: number } // wait until undoStack length reaches count
  | { kind: 'undo' } // wait until the undo stack shrank relative to the step's start (baseline)
  | { kind: 'boardEmpty' } // wait until placements and marks are all cleared
  | { kind: 'placements'; personIds: PersonId[] } // wait until every listed person is placed anywhere (re-place after «Очистить»)
  | { kind: 'solved' } // wait until the level is solved (check passed with all correct)
  | { kind: 'menu' }; // wait until the player is back on the menu screen

/** Which side of the spotlight the tooltip sticks to. */
export type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

export interface TutorialStep {
  id: string;
  title: string;
  /** Paragraphs; rendered as separate <p>. */
  text: string[];
  target: TutorialTarget;
  advance: TutorialAdvance;
  /** Extra clickable elements highlighted alongside the target (e.g. the mode button needed
   *  to perform this step's action, or a roster row to select before placing on the target cell). */
  alsoSelectors?: string[];
  /** Extra cells visually accentuated in addition to the spotlight (e.g. intersection cells of lesson B). */
  highlightCells?: CellId[];
  tooltipSide?: TooltipSide;
}
