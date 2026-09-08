import { useState } from 'react';
import {
  LEGAL_REVISION_NOTE,
  PRIVACY_POLICY,
  PRIVACY_POLICY_TITLE,
  TERMS_OF_USE,
  TERMS_OF_USE_TITLE,
  type LegalSection,
} from './legalTexts';

export type LegalTab = 'privacy' | 'terms';

interface Props {
  initialTab: LegalTab;
  onClose: () => void;
}

function LegalSections({ sections }: { sections: LegalSection[] }) {
  return (
    <>
      {sections.map((section) => (
        <section key={section.heading} className="legal-modal__section">
          <h3>{section.heading}</h3>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {section.list && (
            <ul>
              {section.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </>
  );
}

export function LegalModal({ initialTab, onClose }: Props) {
  const [tab, setTab] = useState<LegalTab>(initialTab);
  const isPrivacy = tab === 'privacy';
  const title = isPrivacy ? PRIVACY_POLICY_TITLE : TERMS_OF_USE_TITLE;

  return (
    <div className="legal-overlay" onClick={onClose}>
      <div className="legal-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title} data-testid="legal-modal">
        <div className="legal-modal__header">
          <h2>{title}</h2>
          <button type="button" className="legal-modal__close" onClick={onClose} aria-label="Закрыть" data-testid="legal-modal-close">
            ×
          </button>
        </div>
        <div className="legal-modal__tabs">
          <button
            type="button"
            className={`legal-modal__tab${isPrivacy ? ' legal-modal__tab--active' : ''}`}
            onClick={() => setTab('privacy')}
            data-testid="legal-tab-privacy"
          >
            Политика
          </button>
          <button
            type="button"
            className={`legal-modal__tab${!isPrivacy ? ' legal-modal__tab--active' : ''}`}
            onClick={() => setTab('terms')}
            data-testid="legal-tab-terms"
          >
            Соглашение
          </button>
        </div>
        <div className="legal-modal__body">
          {isPrivacy ? <LegalSections sections={PRIVACY_POLICY} /> : <LegalSections sections={TERMS_OF_USE} />}
          <p className="legal-modal__revision">{LEGAL_REVISION_NOTE}</p>
        </div>
      </div>
    </div>
  );
}
