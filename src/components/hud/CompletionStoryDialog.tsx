import { useEffect, useRef } from 'react';
import type { CompletionStory } from '../../content/completionStories';

interface Props {
  ending: string;
  levelTitle: string;
  story: CompletionStory;
  onClose: () => void;
  onMenu: () => void;
}

export function CompletionStoryDialog({ ending, levelTitle, story, onClose, onMenu }: Props) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  return (
    <div
      className="completion-story__overlay"
      data-testid="completion-story-overlay"
      onClick={onClose}
    >
      <section
        ref={dialogRef}
        className="completion-story__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="completion-story-title"
        aria-describedby="completion-story-text completion-story-ending"
        data-testid="completion-story-dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="completion-story__close"
          aria-label="Закрыть историю"
          data-testid="completion-story-close"
          onClick={onClose}
        >
          ×
        </button>
        <p className="completion-story__eyebrow">Дело раскрыто</p>
        <h2 id="completion-story-title" className="completion-story__title">{levelTitle}</h2>
        <p id="completion-story-text" className="completion-story__text">{story.text}</p>
        <p id="completion-story-ending" className="completion-story__ending">{ending}</p>
        <div className="completion-story__actions">
          <button type="button" className="completion-story__dismiss" onClick={onClose}>
            Закрыть
          </button>
          <button
            type="button"
            className="completion-story__menu"
            data-testid="completion-story-menu"
            onClick={onMenu}
          >
            К уровням
          </button>
        </div>
      </section>
    </div>
  );
}
