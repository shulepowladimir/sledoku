import { useState } from 'react';

/** Кнопка-компас: роза ветров в модалке — помогает читать клю «севернее/западнее».
 *  Только игровой экран (в меню поля нет). Паттерн LegalModal: оверлей-клик закрывает. */
export function CompassButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="compass-button"
        data-testid="hud-compass"
        aria-label="Компас"
        title="Компас"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth={1.6} fill="none">
          <circle cx="12" cy="12" r="9.5" />
          <path d="M15.5 8.5 13.4 13.4 8.5 15.5 10.6 10.6 Z" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="0.7" fill="currentColor" stroke="none" />
        </svg>
      </button>

      {open && (
        <div className="compass-overlay" onClick={() => setOpen(false)}>
          <div
            className="compass-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Компас"
            data-testid="compass-modal"
          >
            <button
              type="button"
              className="compass-modal__close"
              onClick={() => setOpen(false)}
              aria-label="Закрыть"
              data-testid="compass-close"
            >
              ×
            </button>

            <div className="compass-rose-wrap">
              <span className="compass-dir compass-dir--north">Север</span>
              <span className="compass-dir compass-dir--west">Запад</span>
              <div className="compass-rose" aria-hidden>
                <svg viewBox="0 0 240 240" width="100%" height="100%">
                  {/* Корпус */}
                  <circle cx="120" cy="120" r="104" fill="#F5E9D0" stroke="#1A1A1A" strokeWidth="3" />
                  <circle cx="120" cy="120" r="96" fill="none" stroke="#B87F33" strokeWidth="1.6" />
                  {/* Блик слева-сверху */}
                  <path d="M42 70 Q64 40 100 30" fill="none" stroke="#D5DCE1" strokeWidth="3" strokeLinecap="round" />

                  {/* Север: льдинки */}
                  <g stroke="#4A7BA6" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M92 46 V32 M86 38 H98 M88.7 34.7 L95.3 41.3 M95.3 34.7 L88.7 41.3" />
                    <path d="M148 46 V32 M142 38 H154 M144.7 34.7 L151.3 41.3 M151.3 34.7 L144.7 41.3" />
                  </g>
                  <circle cx="120" cy="22" r="1.6" fill="#9CC3E0" />
                  <circle cx="74" cy="58" r="1.3" fill="#9CC3E0" />
                  <circle cx="166" cy="58" r="1.3" fill="#9CC3E0" />

                  {/* Юг: солнце над дюнами */}
                  <circle cx="120" cy="188" r="7" fill="#E8B95F" stroke="#1A1A1A" strokeWidth="1.4" />
                  <g stroke="#E8B95F" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M120 175 V170 M110.4 180.4 L106.9 176.9 M129.6 180.4 L133.1 176.9 M107 188 H102 M133 188 H138" />
                  </g>
                  <path d="M72 204 Q96 196 120 202 Q144 196 168 204 L168 210 L72 210 Z" fill="#C9A183" stroke="#1A1A1A" strokeWidth="1.4" strokeLinejoin="round" />

                  {/* Запад: закат — солнце за горизонтом */}
                  <path d="M36 126 A10 10 0 0 1 56 126" fill="#E0824A" stroke="#1A1A1A" strokeWidth="1.4" />
                  <path d="M28 126 H64" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
                  <path d="M46 112 V108" stroke="#E0824A" strokeWidth="1.6" strokeLinecap="round" />

                  {/* Восток: рассвет — восходящее солнце */}
                  <path d="M184 126 A10 10 0 0 1 204 126" fill="#E8B95F" stroke="#1A1A1A" strokeWidth="1.4" />
                  <path d="M194 112 V105 M182 115 L178 111 M206 115 L210 111" stroke="#E8B95F" strokeWidth="1.6" strokeLinecap="round" />
                  <path d="M176 126 H212" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />

                  {/* Лучи розы ветров: север красный (акцент), остальные тёмное дерево */}
                  <g stroke="#1A1A1A" strokeWidth="2" strokeLinejoin="round">
                    <path d="M120 52 L130 108 L120 120 L110 108 Z" fill="#C8102E" />
                    <path d="M120 188 L130 132 L120 120 L110 132 Z" fill="#B87F33" />
                    <path d="M52 120 L108 110 L120 120 L108 130 Z" fill="#E0A94A" />
                    <path d="M188 120 L132 110 L120 120 L132 130 Z" fill="#E0A94A" />
                  </g>
                  <circle cx="120" cy="120" r="6" fill="#F5E9D0" stroke="#1A1A1A" strokeWidth="2" />
                  <circle cx="120" cy="120" r="2" fill="#1A1A1A" />
                </svg>
              </div>
              <span className="compass-dir compass-dir--east">Восток</span>
              <span className="compass-dir compass-dir--south">Юг</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
