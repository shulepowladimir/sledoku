import { useState } from 'react';
import type { ItemType } from '../../types/level';
import { ItemLibrary } from '../../../levels/itemLibrary';
import { useEditorStore } from './editorStore';
import { EditorBoard } from './EditorBoard';
import { ItemIcon } from '../board/ItemIcon';

const libraryEntries = Object.entries(ItemLibrary) as [string, (label?: string) => ItemType][];

export function ItemsStep() {
  const { size, rooms, roomByCell, items, tool } = useEditorStore();
  const setTool = useEditorStore((s) => s.setTool);
  const applyToolToCell = useEditorStore((s) => s.applyToolToCell);
  const [search, setSearch] = useState('');

  const itemTypesById = new Map<string, ItemType>(libraryEntries.map(([key, factory]) => [key, factory()]));

  const filtered = libraryEntries.filter(([, factory]) =>
    factory().label.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="editor-step">
      <div className="editor-step__panel">
        <h3>Библиотека предметов</h3>
        <input
          type="text"
          placeholder="Поиск..."
          className="editor-item-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="editor-item-grid">
          {filtered.map(([key, factory]) => {
            const itemType = factory();
            const active = tool?.kind === 'item' && tool.typeId === key;
            return (
              <button
                key={key}
                type="button"
                className={`editor-item-tile${active ? ' editor-item-tile--active' : ''}`}
                onClick={() => setTool({ kind: 'item', typeId: key })}
                title={itemType.label}
              >
                <ItemIcon itemType={itemType} size={28} />
                <span>{itemType.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className={`editor-tool-btn${tool?.kind === 'erase-item' ? ' editor-tool-btn--active' : ''}`}
          onClick={() => setTool({ kind: 'erase-item' })}
        >
          🧹 Убрать предмет с клетки
        </button>

        <p className="editor-hint">
          Выбери предмет из библиотеки, затем кликай по клеткам справа, чтобы поставить его туда (один предмет на клетку, Этап 1).
        </p>
      </div>

      <div className="editor-step__board">
        <EditorBoard
          size={size}
          rooms={rooms}
          roomByCell={roomByCell}
          items={items}
          itemTypesById={itemTypesById}
          onCellClick={(cell) => applyToolToCell(cell)}
        />
      </div>
    </div>
  );
}
