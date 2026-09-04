import { create } from 'zustand';
import type { CellId, Gender } from '../../types/level';
import { cellId } from '../../types/level';
import { scaffoldPermutation } from '../../lib/scaffoldSolution';

export interface EditorRoom {
  id: string;
  name: string;
  floorTexture: string;
}

export interface EditorItem {
  id: string;
  typeId: string;
  cellId: CellId;
}

export interface EditorPerson {
  id: string;
  name: string;
  initialLetter: string;
  gender: Gender;
  color: string;
}

export type EditorTool =
  | { kind: 'room'; roomId: string }
  | { kind: 'erase-room' }
  | { kind: 'item'; typeId: string }
  | { kind: 'erase-item' };

export interface EditorSnapshot {
  size: number;
  rooms: EditorRoom[];
  roomByCell: Record<CellId, string>;
  items: EditorItem[];
  people: EditorPerson[];
  solution: Record<string, CellId> | null;
  victimRoomCandidateIds: [string, string] | null;
  victimId: string | null;
  murdererId: string | null;
  meta: { title: string; theme: string; difficulty: number };
}

interface EditorStore {
  size: number;
  rooms: EditorRoom[];
  roomByCell: Record<CellId, string>;
  items: EditorItem[];
  people: EditorPerson[];
  solution: Record<string, CellId> | null;
  /** Двое людей, оказавшихся в "комнате с двумя жильцами" после подбора решения — из них нужно выбрать жертву и убийцу. */
  victimRoomCandidateIds: [string, string] | null;
  victimId: string | null;
  murdererId: string | null;
  meta: { title: string; theme: string; difficulty: number };
  tool: EditorTool | null;
  /** id текущего сохранённого черновика (для повторного сохранения поверх того же слота). */
  currentDraftId: string | null;

  getSnapshot: () => EditorSnapshot;
  loadSnapshot: (snapshot: EditorSnapshot, draftId: string) => void;
  setCurrentDraftId: (id: string | null) => void;

  setSize: (size: number) => void;
  setTool: (tool: EditorTool | null) => void;
  applyToolToCell: (cell: CellId) => void;

  addRoom: (name: string, floorTexture: string) => void;
  removeRoom: (roomId: string) => void;
  renameRoom: (roomId: string, name: string) => void;

  addPerson: (person: Omit<EditorPerson, 'id'>) => void;
  updatePerson: (id: string, patch: Partial<EditorPerson>) => void;
  removePerson: (id: string) => void;

  generateSolution: () => boolean;
  setVictim: (id: string) => void;
  setMurderer: (id: string) => void;
  setMeta: (patch: Partial<EditorStore['meta']>) => void;
  reset: () => void;
}

let roomCounter = 0;
let itemCounter = 0;
let personCounter = 0;

const initialState = {
  size: 6,
  rooms: [] as EditorRoom[],
  roomByCell: {} as Record<CellId, string>,
  items: [] as EditorItem[],
  people: [] as EditorPerson[],
  solution: null as Record<string, CellId> | null,
  victimRoomCandidateIds: null as [string, string] | null,
  victimId: null as string | null,
  murdererId: null as string | null,
  meta: { title: '', theme: 'apartment', difficulty: 1 },
  tool: null as EditorTool | null,
  currentDraftId: null as string | null,
};

export const useEditorStore = create<EditorStore>((set, get) => ({
  ...initialState,

  setSize: (size) => {
    // При уменьшении сетки чистим то, что вышло за пределы.
    const { roomByCell, items } = get();
    const nextRoomByCell: Record<CellId, string> = {};
    for (const [cid, roomId] of Object.entries(roomByCell)) {
      const { row, col } = { row: Number(cid.split('-')[0]), col: Number(cid.split('-')[1]) };
      if (row < size && col < size) nextRoomByCell[cid as CellId] = roomId;
    }
    const nextItems = items.filter((it) => {
      const [row, col] = it.cellId.split('-').map(Number);
      return row < size && col < size;
    });
    set({ size, roomByCell: nextRoomByCell, items: nextItems, solution: null });
  },

  setTool: (tool) => set({ tool }),

  applyToolToCell: (cell) => {
    const { tool, roomByCell, items } = get();
    if (!tool) return;
    if (tool.kind === 'room') {
      set({ roomByCell: { ...roomByCell, [cell]: tool.roomId }, solution: null });
    } else if (tool.kind === 'erase-room') {
      const next = { ...roomByCell };
      delete next[cell];
      set({ roomByCell: next, solution: null });
    } else if (tool.kind === 'item') {
      const withoutExisting = items.filter((it) => it.cellId !== cell);
      itemCounter += 1;
      set({ items: [...withoutExisting, { id: `item-${tool.typeId}-${itemCounter}`, typeId: tool.typeId, cellId: cell }] });
    } else if (tool.kind === 'erase-item') {
      set({ items: items.filter((it) => it.cellId !== cell) });
    }
  },

  addRoom: (name, floorTexture) => {
    roomCounter += 1;
    const id = `room-${roomCounter}`;
    set({ rooms: [...get().rooms, { id, name, floorTexture }] });
  },

  removeRoom: (roomId) => {
    const { rooms, roomByCell } = get();
    const nextRoomByCell = Object.fromEntries(Object.entries(roomByCell).filter(([, r]) => r !== roomId));
    set({ rooms: rooms.filter((r) => r.id !== roomId), roomByCell: nextRoomByCell, solution: null });
  },

  renameRoom: (roomId, name) => {
    set({ rooms: get().rooms.map((r) => (r.id === roomId ? { ...r, name } : r)) });
  },

  addPerson: (person) => {
    personCounter += 1;
    const id = `person-${personCounter}`;
    set({ people: [...get().people, { ...person, id }] });
  },

  updatePerson: (id, patch) => {
    set({ people: get().people.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  },

  removePerson: (id) => {
    set({ people: get().people.filter((p) => p.id !== id) });
  },

  generateSolution: () => {
    const { size, people, roomByCell } = get();
    if (people.length !== size) return false;
    const roomForCell = (row: number, col: number): string | null => roomByCell[cellId(row, col)] ?? null;
    const result = scaffoldPermutation(size, roomForCell);
    if (!result) {
      set({ solution: null, victimRoomCandidateIds: null, victimId: null, murdererId: null });
      return false;
    }
    const solution: Record<string, CellId> = {};
    result.colByRow.forEach((col, row) => {
      const person = people[row];
      solution[person.id] = cellId(row, col);
    });
    const candidateRows = result.roomByRow
      .map((roomId, row) => ({ roomId, row }))
      .filter((entry) => entry.roomId === result.victimRoomId)
      .map((entry) => people[entry.row].id);
    const candidateIds: [string, string] | null =
      candidateRows.length === 2 ? [candidateRows[0], candidateRows[1]] : null;
    set({
      solution,
      victimRoomCandidateIds: candidateIds,
      victimId: candidateIds ? candidateIds[0] : null,
      murdererId: candidateIds ? candidateIds[1] : null,
    });
    return true;
  },

  setVictim: (id) => {
    const { victimRoomCandidateIds, murdererId } = get();
    if (!victimRoomCandidateIds?.includes(id)) return;
    const other = victimRoomCandidateIds.find((c) => c !== id)!;
    set({ victimId: id, murdererId: murdererId === id ? other : murdererId });
  },

  setMurderer: (id) => {
    const { victimRoomCandidateIds, victimId } = get();
    if (!victimRoomCandidateIds?.includes(id)) return;
    const other = victimRoomCandidateIds.find((c) => c !== id)!;
    set({ murdererId: id, victimId: victimId === id ? other : victimId });
  },

  setMeta: (patch) => set({ meta: { ...get().meta, ...patch } }),

  getSnapshot: () => {
    const { size, rooms, roomByCell, items, people, solution, victimRoomCandidateIds, victimId, murdererId, meta } =
      get();
    return { size, rooms, roomByCell, items, people, solution, victimRoomCandidateIds, victimId, murdererId, meta };
  },

  loadSnapshot: (snapshot, draftId) => {
    set({ ...snapshot, tool: null, currentDraftId: draftId });
  },

  setCurrentDraftId: (id) => set({ currentDraftId: id }),

  reset: () => set({ ...initialState, rooms: [], roomByCell: {}, items: [], people: [], solution: null, victimRoomCandidateIds: null, victimId: null, murdererId: null, currentDraftId: null }),
}));
