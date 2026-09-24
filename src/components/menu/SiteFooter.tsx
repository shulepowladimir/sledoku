import { useState } from 'react';
import { levels } from '../../../levels';
import { CONTACT_TELEGRAM_URL, COPYRIGHT_NAME } from './legalTexts';
import { LegalModal, type LegalTab } from './LegalModal';

/** Русская плюрализация: 1 дело / 2–4 дела / 5–20 дел (и 21 дело, 22 дела…). */
function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export function SiteFooter() {
  const [legal, setLegal] = useState<LegalTab | null>(null);
  const year = new Date().getFullYear();
  const casesWord = plural(levels.length, 'дело', 'дела', 'дел');

  return (
    <footer className="site-footer" data-testid="site-footer">
      <div className="site-footer__brand">
        <span className="site-footer__name">Следоку</span>
        <span className="site-footer__tagline">В архиве {levels.length} {casesWord}</span>
      </div>
      <nav className="site-footer__links" aria-label="Дополнительно">
        <a
          className="site-footer__link"
          href={CONTACT_TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="footer-telegram"
        >
          Написать автору в Telegram
        </a>
        <button
          type="button"
          className="site-footer__link site-footer__link--button"
          onClick={() => setLegal('privacy')}
          data-testid="footer-documents"
        >
          Документы
        </button>
      </nav>
      <p className="site-footer__copyright">© {year} {COPYRIGHT_NAME}</p>
      {legal && <LegalModal initialTab={legal} onClose={() => setLegal(null)} />}
    </footer>
  );
}
