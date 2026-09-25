import { useEffect, useMemo, useState } from 'react';
import type { ItemType, CellId } from '../../types/level';
import { useEditorStore } from './editorStore';
import { CLUE_TYPE_DEFS, CLUE_TYPE_BY_ID, type ClueTypeId, type EditorClueData, type ClueField } from './editorClueTypes';
import { computeClueFacts } from './clueFacts';
import { buildLevelObject } from './buildLevelObject';
import { EditorBoard } from './EditorBoard';
import { ItemLibrary } from '../../../levels/itemLibrary';
import { lintLevel } from '../../../tools/solver/lint';
import { checkPuzzleQuality } from '../../../tools/solver/puzzleQuality';
import { solveLevel, findRedundantClues } from '../../../tools/solver/solve';

const CATEGORIES = ['Личная', 'Про двух людей', 'Общая (для всего уровня)'] as const;
const WALL_LABELS: Record<string, string> = { north: 'Север', south: 'Юг', east: 'Восток', west: 'Запад' };
const VOWELS = 'АЕЁИОУЫЭЮЯ';

export function ClueStep() {
  const { people, rooms, items, clues, roomByCell, solution, size } = useEditorStore();
  const addClue = useEditorStore((s) => s.addClue);
  const removeClue = useEditorStore((s) => s.removeClue);
  const updateClueText = useEditorStore((s) => s.updateClueText);
  const getSnapshot = useEditorStore((s) => s.getSnapshot);

  const facts = useMemo(
    () => computeClueFacts(rooms, roomByCell, items, people, solution),
    [rooms, roomByCell, items, people, solution],
  );

  const [type, setType] = useState<ClueTypeId>('position');
  const [text, setText] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [otherPersonId, setOtherPersonId] = useState('');
  const [otherPersonId1, setOtherPersonId1] = useState('');
  const [otherPersonId2, setOtherPersonId2] = useState('');
  const [roomId, setRoomId] = useState('');
  const [itemTypeId, setItemTypeId] = useState('');
  const [axis, setAxis] = useState<'row' | 'col'>('row');
  const [value, setValue] = useState(0);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [direction, setDirection] = useState<'before' | 'after'>('before');
  const [offset, setOffset] = useState<string>('');
  const [wallDirection, setWallDirection] = useState<'north' | 'south' | 'east' | 'west'>('north');
  const [comparisonSize, setComparisonSize] = useState<'largest' | 'smallest'>('largest');
  const [comparisonPop, setComparisonPop] = useState<'most' | 'least'>('most');
  const [parity, setParity] = useState<'even' | 'odd'>('even');
  const [letterClass, setLetterClass] = useState<'vowel' | 'consonant'>('vowel');
  const [negated, setNegated] = useState(false);
  const [autoNote, setAutoNote] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [checkReport, setCheckReport] = useState<string[] | null>(null);
  const [checking, setChecking] = useState(false);

  const usedItemTypeIds = useMemo(() => [...new Set(items.map((i) => i.typeId))], [items]);
  const def = CLUE_TYPE_BY_ID.get(type)!;
  const needs = (f: ClueField) => def.fields.includes(f);
  const itemLabel = (typeId: string) => (ItemLibrary as Record<string, () => { label: string }>)[typeId]?.().label ?? typeId;

  // --- Автоподстановка правдивых значений на основе реальной расстановки ---
  useEffect(() => {
    setAutoNote(null);
    if (!solution) return;

    switch (type) {
      case 'position': {
        if (!subjectId) return;
        const rc = facts.rowColOf(subjectId);
        if (!rc) return;
        setValue(axis === 'row' ? rc.row : rc.col);
        setAutoNote(`Подставлено настоящее значение: ${axis === 'row' ? 'ряд' : 'столбец'} ${axis === 'row' ? rc.row : rc.col}.`);
        break;
      }
      case 'roomMembership': {
        if (!subjectId) return;
        const r = facts.roomIdOf(subjectId);
        if (r) {
          setRoomId(r);
          setNegated(false);
          setAutoNote(`Подставлена настоящая комната: «${rooms.find((x) => x.id === r)?.name}».`);
        }
        break;
      }
      case 'adjacency': {
        if (!subjectId) return;
        const t = facts.adjacentItemTypeId(subjectId);
        if (t) {
          setItemTypeId(t);
          setNegated(false);
          setAutoNote(`Рядом действительно есть: «${itemLabel(t)}».`);
        } else {
          setAutoNote('Рядом нет предметов — если хочешь подсказку, выбери «НЕ» и любой предмет.');
        }
        break;
      }
      case 'sameRoomAsItem': {
        if (!subjectId) return;
        const t = facts.sameRoomItemTypeId(subjectId);
        if (t) {
          setItemTypeId(t);
          setNegated(false);
          setAutoNote(`В той же комнате действительно есть: «${itemLabel(t)}».`);
        } else {
          setAutoNote('В этой комнате нет предметов — если хочешь подсказку, выбери «НЕ».');
        }
        break;
      }
      case 'occupiesItem': {
        if (!subjectId) return;
        const t = facts.ownCellItemTypeId(subjectId);
        if (t) {
          setItemTypeId(t);
          setNegated(false);
          setAutoNote(`На клетке действительно есть: «${itemLabel(t)}».`);
        } else {
          setAutoNote('На этой клетке нет предмета — если хочешь подсказку, выбери «НЕ».');
        }
        break;
      }
      case 'sharedRoomGender': {
        if (!subjectId) return;
        const genders = facts.otherOccupantGenders(subjectId);
        if (genders.length === 1) {
          setGender(genders[0]);
          setNegated(false);
          setAutoNote(`В комнате действительно есть ${genders[0] === 'male' ? 'мужчина' : 'женщина'}.`);
        } else if (genders.length === 0) {
          setNegated(true);
          setAutoNote('В комнате больше никого нет — можно использовать только «НЕ».');
        } else {
          setAutoNote('В комнате есть и мужчина, и женщина — обе подсказки без «НЕ» подойдут.');
        }
        break;
      }
      case 'corner': {
        if (!subjectId) return;
        const inCorner = facts.isCorner(subjectId);
        setNegated(!inCorner);
        setAutoNote(inCorner ? 'Персонаж действительно стоит в углу.' : 'Персонаж НЕ в углу — подставлено «НЕ».');
        break;
      }
      case 'wallSide': {
        if (!subjectId) return;
        const sides = facts.trueWallSides(subjectId);
        if (sides.length > 0) {
          setWallDirection(sides[0]);
          setNegated(false);
          setAutoNote(`Персонаж действительно стоит у стены: ${WALL_LABELS[sides[0]]}${sides.length > 1 ? ` (и ещё: ${sides.slice(1).map((s) => WALL_LABELS[s]).join(', ')})` : ''}.`);
        } else {
          setNegated(true);
          setAutoNote('Персонаж не стоит ни у одной стены — подставлено «НЕ».');
        }
        break;
      }
      case 'roomSize': {
        if (!subjectId) return;
        const cmp = facts.roomSizeComparison(subjectId);
        if (cmp) {
          setComparisonSize(cmp);
          setAutoNote(`Комната персонажа действительно ${cmp === 'largest' ? 'самая большая' : 'самая маленькая'}.`);
        } else {
          setAutoNote('Комната персонажа не самая большая и не самая маленькая — эта подсказка не подойдёт.');
        }
        break;
      }
      case 'parity': {
        if (!subjectId) return;
        const rc = facts.rowColOf(subjectId);
        if (!rc) return;
        const n = axis === 'row' ? rc.row : rc.col;
        setParity(n % 2 === 0 ? 'even' : 'odd');
        setAutoNote(`Настоящая чётность: ${n % 2 === 0 ? 'чётный' : 'нечётный'} (${n}).`);
        break;
      }
      case 'relativePosition': {
        if (!subjectId || !otherPersonId || subjectId === otherPersonId) return;
        const a = facts.rowColOf(subjectId);
        const b = facts.rowColOf(otherPersonId);
        if (!a || !b) return;
        const diff = axis === 'row' ? a.row - b.row : a.col - b.col;
        if (diff === 0) {
          setAutoNote('У обоих одинаковое значение по этой оси — попробуй другую ось.');
          return;
        }
        setDirection(diff < 0 ? 'before' : 'after');
        setOffset(String(Math.abs(diff)));
        setAutoNote(`Настоящая разница: ${Math.abs(diff)}.`);
        break;
      }
      case 'betweenness': {
        if (!subjectId || !otherPersonId1 || !otherPersonId2) return;
        const s = facts.rowColOf(subjectId);
        const o1 = facts.rowColOf(otherPersonId1);
        const o2 = facts.rowColOf(otherPersonId2);
        if (!s || !o1 || !o2) return;
        const between = (v: number, a: number, b: number) => (v > Math.min(a, b) && v < Math.max(a, b));
        if (between(s.row, o1.row, o2.row)) {
          setAxis('row');
          setAutoNote('Верно для ряда.');
        } else if (between(s.col, o1.col, o2.col)) {
          setAxis('col');
          setAutoNote('Верно для столбца.');
        } else {
          setAutoNote('Персонаж не находится между этими двумя ни по ряду, ни по столбцу.');
        }
        break;
      }
      case 'roomParity': {
        const p = facts.allRoomsParity();
        if (p) {
          setParity(p);
          setAutoNote(`Сейчас во всех комнатах ${p === 'even' ? 'чётное' : 'нечётное'} число людей.`);
        } else {
          setAutoNote('Сейчас в комнатах разная чётность — эту подсказку нельзя использовать.');
        }
        break;
      }
      case 'roomPopulation': {
        if (!roomId) return;
        if (facts.mostPopulatedRoomIds().includes(roomId)) {
          setComparisonPop('most');
          setAutoNote('В этой комнате действительно больше всего людей.');
        } else if (facts.leastPopulatedRoomIds().includes(roomId)) {
          setComparisonPop('least');
          setAutoNote('В этой комнате действительно меньше всего людей.');
        } else {
          setAutoNote('Эта комната не самая населённая и не самая пустая — подсказка не подойдёт.');
        }
        break;
      }
      case 'letterGroupRoom': {
        const vowelIds = people.filter((p) => VOWELS.includes(p.initialLetter.toUpperCase())).map((p) => p.id);
        const consonantIds = people.filter((p) => !VOWELS.includes(p.initialLetter.toUpperCase())).map((p) => p.id);
        if (facts.allSameRoom(vowelIds)) {
          setLetterClass('vowel');
          setAutoNote('Все на гласную букву действительно в одной комнате.');
        } else if (facts.allSameRoom(consonantIds)) {
          setLetterClass('consonant');
          setAutoNote('Все на согласную букву действительно в одной комнате.');
        } else {
          setAutoNote('Сейчас ни гласная, ни согласная группа не собрана в одной комнате.');
        }
        break;
      }
      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, subjectId, otherPersonId, otherPersonId1, otherPersonId2, axis, roomId, solution]);

  const peopleAtCell = useMemo(() => {
    const map = new Map<CellId, (typeof people)[number]>();
    if (solution) {
      for (const p of people) {
        const cell = solution[p.id];
        if (cell) map.set(cell as CellId, p);
      }
    }
    return map;
  }, [people, solution]);

  const itemTypesById = useMemo(
    () => new Map<string, ItemType>(usedItemTypeIds.map((key) => [key, (ItemLibrary as Record<string, () => ItemType>)[key]()])),
    [usedItemTypeIds],
  );

  const handleAdd = () => {
    setFormError(null);
    if (needs('subject') && !subjectId) return setFormError('Выбери, о ком подсказка');
    if (needs('otherPerson') && !otherPersonId) return setFormError('Выбери второго человека');
    if (needs('otherPerson1') && !otherPersonId1) return setFormError('Выбери первого из двух людей');
    if (needs('otherPerson2') && !otherPersonId2) return setFormError('Выбери второго из двух людей');
    if (needs('room') && !roomId) return setFormError('Выбери комнату');
    if (needs('itemType') && !itemTypeId) return setFormError('Выбери предмет');
    if (!text.trim()) return setFormError('Напиши текст подсказки для игрока');

    let data: EditorClueData;
    switch (type) {
      case 'position':
        data = { type, subjectId, axis, value };
        break;
      case 'roomMembership':
        data = { type, subjectId, roomId, negated };
        break;
      case 'adjacency':
        data = { type, subjectId, itemTypeId, negated };
        break;
      case 'sharedRoomGender':
        data = { type, subjectId, otherGender: gender, negated };
        break;
      case 'itemTypeGender':
        data = { type, itemTypeId, gender };
        break;
      case 'relativePosition':
        data = { type, subjectId, otherPersonId, axis, direction, offset: offset ? Number(offset) : undefined };
        break;
      case 'corner':
        data = { type, subjectId, negated };
        break;
      case 'sameRoomAs':
        data = { type, subjectId, otherPersonId, negated };
        break;
      case 'aloneInRoom':
        data = { type, subjectId };
        break;
      case 'sameRoomAsItem':
        data = { type, subjectId, itemTypeId, negated };
        break;
      case 'occupiesItem':
        data = { type, subjectId, itemTypeId, negated };
        break;
      case 'wallSide':
        data = { type, subjectId, wallDirection, negated };
        break;
      case 'roomSize':
        data = { type, subjectId, comparison: comparisonSize };
        break;
      case 'parity':
        data = { type, subjectId, axis, parity };
        break;
      case 'betweenness':
        data = { type, subjectId, otherPersonId1, otherPersonId2, axis };
        break;
      case 'roomOccupancy':
        data = { type };
        break;
      case 'roomParity':
        data = { type, parity };
        break;
      case 'roomPopulation':
        data = { type, roomId, comparison: comparisonPop };
        break;
      case 'letterGroupRoom':
        data = { type, letterClass };
        break;
    }

    addClue({ text: text.trim(), data });
    setText('');
    setCheckReport(null);
  };

  const handleCheck = () => {
    setChecking(true);
    setCheckReport(null);
    const result = buildLevelObject(getSnapshot());
    if ('error' in result) {
      setCheckReport([`❌ ${result.error}`]);
      setChecking(false);
      return;
    }
    const { level } = result;
    const report: string[] = [];

    const lintIssues = lintLevel(level);
    if (lintIssues.length > 0) {
      report.push('ЛИНТ — найдены нарушения:');
      lintIssues.forEach((issue) => report.push(`  ⚠️ ${issue}`));
      setCheckReport(report);
      setChecking(false);
      return;
    }
    report.push('✅ Линт: чисто.');

    const quality = checkPuzzleQuality(level);
    if (quality.violations.length > 0) {
      report.push('КАЧЕСТВО ПОДСКАЗОК — найдены нарушения:');
      quality.violations.forEach((v) => report.push(`  ⚠️ ${v}`));
      setCheckReport(report);
      setChecking(false);
      return;
    }
    report.push(`✅ Качество подсказок: чисто (полностью определены: ${quality.fullyPinnedCount}/${quality.budget}).`);

    const solved = solveLevel(level);
    switch (solved.status) {
      case 'PROVEN_UNIQUE': {
        report.push('🎉 РЕШЕНИЕ ЕДИНСТВЕННО — уровень готов!');
        const redundant = findRedundantClues(level);
        if (redundant.length > 0) {
          report.push('💡 Совет: эти подсказки можно убрать без потери однозначности:');
          redundant.forEach((id) => {
            const clueText = level.clues.find((c) => c.id === id)?.text;
            report.push(`  - ${clueText ?? id}`);
          });
        } else {
          report.push('✅ Ни одну подсказку нельзя убрать — все нужны.');
        }
        break;
      }
      case 'NO_SOLUTION':
        report.push('❌ NO_SOLUTION — решение, подобранное на шаге 4, противоречит подсказкам:');
        solved.violated.forEach((v) => report.push(`  - ${v.text}`));
        break;
      case 'WRONG_SOLUTION':
        report.push('❌ WRONG_SOLUTION — есть ровно одно решение, но это не то, что подобрано на шаге 4.');
        break;
      case 'MULTIPLE':
        report.push(
          `❌ MULTIPLE — решений больше одного (${solved.matchesAuthored ? 'подобранное решение среди них' : 'подобранное решение вообще не подходит'}). Добавь ещё подсказок.`,
        );
        break;
      case 'INCONCLUSIVE':
        report.push(`⚠️ Не удалось проверить: ${solved.reason}`);
        break;
    }

    setCheckReport(report);
    setChecking(false);
  };

  return (
    <div className="editor-step">
      <div className="editor-step__panel editor-step__panel--wide">
        <h3>Добавить подсказку</h3>

        <label className="editor-field">
          <span>Тип подсказки</span>
          <select value={type} onChange={(e) => setType(e.target.value as ClueTypeId)}>
            {CATEGORIES.map((cat) => (
              <optgroup key={cat} label={cat}>
                {CLUE_TYPE_DEFS.filter((d) => d.category === cat).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        <div className="editor-clue-fields">
          {needs('subject') && (
            <label className="editor-field">
              <span>Кто</span>
              <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                <option value="">— выбери —</option>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {needs('otherPerson') && (
            <label className="editor-field">
              <span>Второй человек</span>
              <select value={otherPersonId} onChange={(e) => setOtherPersonId(e.target.value)}>
                <option value="">— выбери —</option>
                {people.filter((p) => p.id !== subjectId).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {needs('otherPerson1') && (
            <label className="editor-field">
              <span>Первый из двух</span>
              <select value={otherPersonId1} onChange={(e) => setOtherPersonId1(e.target.value)}>
                <option value="">— выбери —</option>
                {people.filter((p) => p.id !== subjectId).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {needs('otherPerson2') && (
            <label className="editor-field">
              <span>Второй из двух</span>
              <select value={otherPersonId2} onChange={(e) => setOtherPersonId2(e.target.value)}>
                <option value="">— выбери —</option>
                {people.filter((p) => p.id !== subjectId && p.id !== otherPersonId1).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {needs('room') && (
            <label className="editor-field">
              <span>Комната</span>
              <select value={roomId} onChange={(e) => setRoomId(e.target.value)}>
                <option value="">— выбери —</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {needs('itemType') && (
            <label className="editor-field">
              <span>Предмет</span>
              <select value={itemTypeId} onChange={(e) => setItemTypeId(e.target.value)}>
                <option value="">— выбери —</option>
                {usedItemTypeIds.map((id) => (
                  <option key={id} value={id}>
                    {itemLabel(id)}
                  </option>
                ))}
              </select>
              {usedItemTypeIds.length === 0 && (
                <span className="editor-hint editor-hint--warning">На карте пока нет предметов (шаг 2).</span>
              )}
            </label>
          )}
          {needs('axis') && (
            <label className="editor-field">
              <span>Ряд или столбец</span>
              <select value={axis} onChange={(e) => setAxis(e.target.value as 'row' | 'col')}>
                <option value="row">Ряд</option>
                <option value="col">Столбец</option>
              </select>
            </label>
          )}
          {needs('value') && (
            <label className="editor-field">
              <span>Номер (0 = первый)</span>
              <input type="number" min={0} value={value} onChange={(e) => setValue(Number(e.target.value))} />
            </label>
          )}
          {needs('gender') && (
            <label className="editor-field">
              <span>Пол</span>
              <select value={gender} onChange={(e) => setGender(e.target.value as 'male' | 'female')}>
                <option value="male">Мужчина</option>
                <option value="female">Женщина</option>
              </select>
            </label>
          )}
          {needs('direction') && (
            <label className="editor-field">
              <span>Направление</span>
              <select value={direction} onChange={(e) => setDirection(e.target.value as 'before' | 'after')}>
                <option value="before">Раньше (меньше номер)</option>
                <option value="after">Позже (больше номер)</option>
              </select>
            </label>
          )}
          {needs('offset') && (
            <label className="editor-field">
              <span>Ровно на сколько (необязательно)</span>
              <input type="number" min={1} value={offset} onChange={(e) => setOffset(e.target.value)} placeholder="любое расстояние" />
            </label>
          )}
          {needs('wallDirection') && (
            <label className="editor-field">
              <span>Сторона света</span>
              <select value={wallDirection} onChange={(e) => setWallDirection(e.target.value as typeof wallDirection)}>
                {Object.entries(WALL_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
          )}
          {needs('comparisonSize') && (
            <label className="editor-field">
              <span>Какая комната</span>
              <select value={comparisonSize} onChange={(e) => setComparisonSize(e.target.value as 'largest' | 'smallest')}>
                <option value="largest">Самая большая</option>
                <option value="smallest">Самая маленькая</option>
              </select>
            </label>
          )}
          {needs('comparisonPop') && (
            <label className="editor-field">
              <span>Больше или меньше всего людей</span>
              <select value={comparisonPop} onChange={(e) => setComparisonPop(e.target.value as 'most' | 'least')}>
                <option value="most">Больше всего</option>
                <option value="least">Меньше всего</option>
              </select>
            </label>
          )}
          {needs('parity') && (
            <label className="editor-field">
              <span>Чётность</span>
              <select value={parity} onChange={(e) => setParity(e.target.value as 'even' | 'odd')}>
                <option value="even">Чётный</option>
                <option value="odd">Нечётный</option>
              </select>
            </label>
          )}
          {needs('letterClass') && (
            <label className="editor-field">
              <span>Буква имени</span>
              <select value={letterClass} onChange={(e) => setLetterClass(e.target.value as 'vowel' | 'consonant')}>
                <option value="vowel">Гласная</option>
                <option value="consonant">Согласная</option>
              </select>
            </label>
          )}
          {needs('negated') && (
            <label className="editor-checkbox">
              <input type="checkbox" checked={negated} onChange={(e) => setNegated(e.target.checked)} />
              <span>НЕ (отрицание — подсказка исключает, а не подтверждает)</span>
            </label>
          )}
        </div>

        {autoNote && <p className="editor-auto-note">✨ {autoNote}</p>}

        <label className="editor-field">
          <span>Текст подсказки (как увидит игрок)</span>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Например: Андрей был в комнате с окном"
          />
        </label>

        {formError && <p className="editor-hint editor-hint--warning">{formError}</p>}

        <button type="button" className="menu-button" onClick={handleAdd}>
          Добавить подсказку
        </button>
      </div>

      <div className="editor-step__board">
        <EditorBoard
          size={size}
          rooms={rooms}
          roomByCell={roomByCell}
          items={items}
          itemTypesById={itemTypesById}
          peopleAtCell={peopleAtCell}
          interactive={false}
        />
      </div>

      <div className="editor-step__panel editor-step__panel--wide">
        <h3>Добавленные подсказки ({clues.length})</h3>
        <ul className="editor-clue-list">
          {clues.map((c) => (
            <li key={c.id} className="editor-clue-list__item">
              <span className="editor-clue-list__type">{CLUE_TYPE_BY_ID.get(c.data.type)?.label}</span>
              <input
                className="editor-clue-list__text"
                value={c.text}
                onChange={(e) => updateClueText(c.id, e.target.value)}
              />
              <button type="button" className="editor-room-list__remove" onClick={() => removeClue(c.id)} aria-label="Удалить">
                ×
              </button>
            </li>
          ))}
          {clues.length === 0 && <p className="editor-hint">Пока нет ни одной подсказки.</p>}
        </ul>

        <button type="button" className="menu-button" onClick={handleCheck} disabled={checking}>
          {checking ? 'Проверяю...' : '🔍 Проверить решение'}
        </button>

        {checkReport && (
          <div className="editor-check-report">
            {checkReport.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
