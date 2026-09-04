import { useState } from 'react';
import type { ItemType } from '../../types/level';
import { useEditorStore } from './editorStore';
import { EditorBoard } from './EditorBoard';
import { FLOOR_TEXTURE_KEYS } from '../../styles/floorTextureKeys';

const FLOOR_TEXTURE_LABELS: Record<string, string> = {
  tile: 'Плитка',
  carpet: 'Ковёр',
  wood: 'Дерево',
  marble: 'Мрамор',
  linoleum: 'Линолеум',
  rug: 'Коврик',
  grass: 'Трава',
  dirt: 'Земля',
  stone: 'Камень',
  water: 'Вода',
  sand: 'Песок',
  metal: 'Металл',
  concrete: 'Бетон',
  rubber: 'Резина',
  stairs: 'Лестница',
  cliff: 'Утёс',
  cobble: 'Брусчатка',
  asphalt: 'Асфальт',
  snow: 'Снег',
  ice: 'Лёд',
};

export function GridStep() {
  const { size, rooms, roomByCell, tool, items } = useEditorStore();
  const setSize = useEditorStore((s) => s.setSize);
  const setTool = useEditorStore((s) => s.setTool);
  const applyToolToCell = useEditorStore((s) => s.applyToolToCell);
  const addRoom = useEditorStore((s) => s.addRoom);
  const removeRoom = useEditorStore((s) => s.removeRoom);
  const renameRoom = useEditorStore((s) => s.renameRoom);

  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomTexture, setNewRoomTexture] = useState('tile');
  const [isPainting, setIsPainting] = useState(false);

  const itemTypesById = new Map<string, ItemType>(); // на этом шаге предметы не показываем детально

  const handleAddRoom = () => {
    if (!newRoomName.trim()) return;
    addRoom(newRoomName.trim(), newRoomTexture);
    setNewRoomName('');
  };

  return (
    <div className="editor-step">
      <div className="editor-step__panel">
        <label className="editor-field">
          <span>Размер сетки (N×N)</span>
          <input
            type="number"
            min={5}
            max={12}
            value={size}
            onChange={(e) => setSize(Math.max(5, Math.min(12, Number(e.target.value) || 5)))}
          />
        </label>

        <h3>Комнаты</h3>
        <ul className="editor-room-list">
          {rooms.map((room) => (
            <li key={room.id} className="editor-room-list__item">
              <button
                type="button"
                className={`editor-room-swatch${tool?.kind === 'room' && tool.roomId === room.id ? ' editor-room-swatch--active' : ''}`}
                onClick={() => setTool({ kind: 'room', roomId: room.id })}
                title="Выбрать инструмент рисования этой комнаты"
              >
                🖌
              </button>
              <input
                className="editor-room-list__name"
                value={room.name}
                onChange={(e) => renameRoom(room.id, e.target.value)}
              />
              <span className="editor-room-list__texture">{FLOOR_TEXTURE_LABELS[room.floorTexture] ?? room.floorTexture}</span>
              <button type="button" className="editor-room-list__remove" onClick={() => removeRoom(room.id)} aria-label="Удалить комнату">
                ×
              </button>
            </li>
          ))}
        </ul>

        <div className="editor-add-room">
          <input
            type="text"
            placeholder="Название комнаты"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
          />
          <select value={newRoomTexture} onChange={(e) => setNewRoomTexture(e.target.value)}>
            {FLOOR_TEXTURE_KEYS.map((key) => (
              <option key={key} value={key}>
                {FLOOR_TEXTURE_LABELS[key] ?? key}
              </option>
            ))}
          </select>
          <button type="button" className="menu-button" onClick={handleAddRoom}>
            Добавить комнату
          </button>
        </div>

        <button
          type="button"
          className={`editor-tool-btn${tool?.kind === 'erase-room' ? ' editor-tool-btn--active' : ''}`}
          onClick={() => setTool({ kind: 'erase-room' })}
        >
          🧹 Ластик (вырезать клетку)
        </button>

        <p className="editor-hint">
          Выбери инструмент (кисть комнаты или ластик), затем зажми и веди мышкой по сетке справа, чтобы закрасить клетки.
          Незакрашенные клетки не войдут в игровое поле (например, для скруглённых углов карты).
        </p>
      </div>

      <div
        className="editor-step__board"
        onMouseDown={() => setIsPainting(true)}
        onMouseUp={() => setIsPainting(false)}
        onMouseLeave={() => setIsPainting(false)}
      >
        <EditorBoard
          size={size}
          rooms={rooms}
          roomByCell={roomByCell}
          items={items}
          itemTypesById={itemTypesById}
          onCellClick={(cell) => applyToolToCell(cell)}
          onCellEnter={(cell) => isPainting && applyToolToCell(cell)}
        />
      </div>
    </div>
  );
}
