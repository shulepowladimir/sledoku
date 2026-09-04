export type ClueTypeId =
  | 'position'
  | 'roomMembership'
  | 'adjacency'
  | 'sharedRoomGender'
  | 'itemTypeGender'
  | 'relativePosition'
  | 'corner'
  | 'sameRoomAs'
  | 'sameRoomAsItem'
  | 'occupiesItem'
  | 'wallSide'
  | 'roomSize'
  | 'parity'
  | 'betweenness'
  | 'roomOccupancy'
  | 'roomParity'
  | 'roomPopulation'
  | 'letterGroupRoom';

export type EditorClueData =
  | { type: 'position'; subjectId: string; axis: 'row' | 'col'; value: number }
  | { type: 'roomMembership'; subjectId: string; roomId: string; negated: boolean }
  | { type: 'adjacency'; subjectId: string; itemTypeId: string; negated: boolean }
  | { type: 'sharedRoomGender'; subjectId: string; otherGender: 'male' | 'female'; negated: boolean }
  | { type: 'itemTypeGender'; itemTypeId: string; gender: 'male' | 'female' }
  | {
      type: 'relativePosition';
      subjectId: string;
      otherPersonId: string;
      axis: 'row' | 'col';
      direction: 'before' | 'after';
      offset?: number;
    }
  | { type: 'corner'; subjectId: string; negated: boolean }
  | { type: 'sameRoomAs'; subjectId: string; otherPersonId: string; negated: boolean }
  | { type: 'sameRoomAsItem'; subjectId: string; itemTypeId: string; negated: boolean }
  | { type: 'occupiesItem'; subjectId: string; itemTypeId: string; negated: boolean }
  | { type: 'wallSide'; subjectId: string; wallDirection: 'north' | 'south' | 'east' | 'west'; negated: boolean }
  | { type: 'roomSize'; subjectId: string; comparison: 'largest' | 'smallest' }
  | { type: 'parity'; subjectId: string; axis: 'row' | 'col'; parity: 'even' | 'odd' }
  | { type: 'betweenness'; subjectId: string; otherPersonId1: string; otherPersonId2: string; axis: 'row' | 'col' }
  | { type: 'roomOccupancy' }
  | { type: 'roomParity'; parity: 'even' | 'odd' }
  | { type: 'roomPopulation'; roomId: string; comparison: 'most' | 'least' }
  | { type: 'letterGroupRoom'; letterClass: 'vowel' | 'consonant' };

export interface EditorClue {
  id: string;
  text: string;
  data: EditorClueData;
}

export type ClueField =
  | 'subject'
  | 'otherPerson'
  | 'otherPerson1'
  | 'otherPerson2'
  | 'room'
  | 'itemType'
  | 'axis'
  | 'value'
  | 'gender'
  | 'direction'
  | 'offset'
  | 'wallDirection'
  | 'comparisonSize'
  | 'comparisonPop'
  | 'parity'
  | 'letterClass'
  | 'negated';

export interface ClueTypeDef {
  id: ClueTypeId;
  label: string;
  category: 'Личная' | 'Про двух людей' | 'Общая (для всего уровня)';
  fields: ClueField[];
}

export const CLUE_TYPE_DEFS: ClueTypeDef[] = [
  { id: 'position', label: 'Находился в конкретном ряду/столбце', category: 'Личная', fields: ['subject', 'axis', 'value'] },
  { id: 'roomMembership', label: 'Находился(-ась) в комнате', category: 'Личная', fields: ['subject', 'room', 'negated'] },
  { id: 'adjacency', label: 'Был(а) рядом с предметом', category: 'Личная', fields: ['subject', 'itemType', 'negated'] },
  { id: 'sharedRoomGender', label: 'Делил(а) комнату с мужчиной/женщиной', category: 'Личная', fields: ['subject', 'gender', 'negated'] },
  { id: 'corner', label: 'Стоял(а) в углу комнаты', category: 'Личная', fields: ['subject', 'negated'] },
  { id: 'sameRoomAsItem', label: 'Был(а) в одной комнате с предметом (не обязательно рядом)', category: 'Личная', fields: ['subject', 'itemType', 'negated'] },
  { id: 'occupiesItem', label: 'Сидел(а)/стоял(а) прямо на предмете', category: 'Личная', fields: ['subject', 'itemType', 'negated'] },
  { id: 'wallSide', label: 'Стоял(а) у стены (сторона света)', category: 'Личная', fields: ['subject', 'wallDirection', 'negated'] },
  { id: 'roomSize', label: 'Был(а) в самой большой/маленькой комнате', category: 'Личная', fields: ['subject', 'comparisonSize'] },
  { id: 'parity', label: 'Ряд/столбец был чётным/нечётным', category: 'Личная', fields: ['subject', 'axis', 'parity'] },

  { id: 'relativePosition', label: 'Находился(-ась) севернее/южнее/западнее/восточнее другого', category: 'Про двух людей', fields: ['subject', 'otherPerson', 'axis', 'direction', 'offset'] },
  { id: 'sameRoomAs', label: 'Был(а) в одной комнате с другим человеком', category: 'Про двух людей', fields: ['subject', 'otherPerson', 'negated'] },
  { id: 'betweenness', label: 'Находился(-ась) между двумя другими людьми', category: 'Про двух людей', fields: ['subject', 'otherPerson1', 'otherPerson2', 'axis'] },

  { id: 'itemTypeGender', label: 'Все у предмета этого типа — мужчины/женщины', category: 'Общая (для всего уровня)', fields: ['itemType', 'gender'] },
  { id: 'roomOccupancy', label: 'Ни одна комната не осталась пустой', category: 'Общая (для всего уровня)', fields: [] },
  { id: 'roomParity', label: 'В каждой комнате чётное/нечётное число людей', category: 'Общая (для всего уровня)', fields: ['parity'] },
  { id: 'roomPopulation', label: 'В комнате больше/меньше всего людей', category: 'Общая (для всего уровня)', fields: ['room', 'comparisonPop'] },
  { id: 'letterGroupRoom', label: 'Все на гласную/согласную букву — в одной комнате', category: 'Общая (для всего уровня)', fields: ['letterClass'] },
];

export const CLUE_TYPE_BY_ID = new Map(CLUE_TYPE_DEFS.map((d) => [d.id, d]));
