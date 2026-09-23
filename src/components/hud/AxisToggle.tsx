import { useAxisLabelsStore } from '../../state/axisLabelsStore';

/** Тумблер подписей координат: номера столбцов над картой, номера рядов — справа.
 *  Помогает сверять клю «в 6-м ряду / в 4-м столбце» с картой. Круглая кнопка
 *  паттерна compass-button; активная — инвертирована. */
export function AxisToggle() {
  const axisLabels = useAxisLabelsStore((s) => s.axisLabels);
  const toggle = useAxisLabelsStore((s) => s.toggle);

  return (
    <button
      type="button"
      className={`axis-toggle${axisLabels ? ' axis-toggle--active' : ''}`}
      data-testid="axis-toggle"
      aria-pressed={axisLabels}
      aria-label="Номера рядов и столбцов"
      title="Номера рядов и столбцов"
      onClick={toggle}
    >
      {/* Мини-сетка 2×2 с подписями координат: столбцы 1 2 сверху,
          ряды 1 2 справа — ровно так подписи выглядят на доске. */}
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" aria-hidden="true">
        {/* Сетка 2×2 */}
        <rect x="5" y="10.5" width="10" height="10" rx="1" strokeWidth={1.6} />
        <path d="M10 10.5v10M5 15.5h10" strokeWidth={1.3} />
        {/* Цифры: единица и двойка в каноническом боксе 4×5 */}
        <g strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round">
          <g transform="translate(5.5,1.8)"><path d="M0.9 1.7 2.1 0.9v4.2" /></g>
          <g transform="translate(10.5,1.8)"><path d="M0.4 1.4c0-1.3 3.2-1.3 3.2 0 0 1.1-1.8 1.7-3 3.2h3.2" /></g>
          <g transform="translate(16.8,10.8)"><path d="M0.9 1.7 2.1 0.9v4.2" /></g>
          <g transform="translate(16.8,15.8)"><path d="M0.4 1.4c0-1.3 3.2-1.3 3.2 0 0 1.1-1.8 1.7-3 3.2h3.2" /></g>
        </g>
      </svg>
    </button>
  );
}
