import { createPortal } from 'react-dom';

interface LabelPopupProps {
  text: string;
  /** Точка касания (viewport-координаты) — попап раскрывается над пальцем. */
  x: number;
  y: number;
  onClose: () => void;
}

// Оценочные размеры для клампа в вьюпорт (как TOOLTIP_W/H в TutorialOverlay):
// сам лейбл шире 240px не бывает, а высота — одна-две строки.
const POPUP_W = 240;
const POPUP_H = 48;
const MARGIN = 12;
const FINGER_OFFSET = 28;

/** Подпись предмета/фичи пола по долгому нажатию — мобильная замена hover-title.
 *  Порталится в body (как TutorialOverlay): внутри .board при масштабе ≠1
 *  transform создаёт containing block и ломает position: fixed. */
export function LabelPopup({ text, x, y, onClose }: LabelPopupProps) {
  const left = Math.min(Math.max(MARGIN, x - POPUP_W / 2), window.innerWidth - POPUP_W - MARGIN);
  const above = y - POPUP_H - FINGER_OFFSET;
  // Обычно попап над пальцем; у верхнего края экрана — под ним.
  const top =
    above >= MARGIN ? above : Math.min(y + FINGER_OFFSET, window.innerHeight - POPUP_H - MARGIN);

  return createPortal(
    <>
      {/* Полноэкранное затемнение без визуала: тап-закрытие не протекает в доску
          (иначе закрывающий тап поставил бы метку/крестик). */}
      <div className="label-popup__backdrop" data-testid="label-popup-backdrop" onClick={onClose} />
      <div className="label-popup" role="status" data-testid="label-popup" style={{ left, top }}>
        {text}
      </div>
    </>,
    document.body,
  );
}
