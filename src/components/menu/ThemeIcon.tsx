import type { ReactNode } from 'react';
import type { ItemType } from '../../types/level';
import { themeIconRegistry } from '../../assets/iconRegistry';
import { ItemIcon } from '../board/ItemIcon';

interface ThemeIconProps {
  theme: string;
  size?: number;
}

const THEME_ITEM_ICONS: Record<string, ItemType> = {
  airport: { id: 'theme-airport', label: 'Самолёт', kind: 'decorative', icon: 'plane' },
  zoo: { id: 'theme-zoo', label: 'Пингвин', kind: 'decorative', icon: 'penguin' },
};

function renderIconShape(theme: string): ReactNode {
  switch (theme) {
    case 'apartment':
      return (
        <>
          <path d="M4 11 L12 4 L20 11 V20 H4 Z" fill="#e8c9a0" />
          <path d="M3 12 L12 4.5 L21 12" stroke="currentColor" strokeWidth="1.3" fill="none" />
          <rect x="10.2" y="13.5" width="3.6" height="6.5" fill="#8a5a3a" />
          <rect x="6" y="13" width="3" height="3" fill="#d7e6f5" />
        </>
      );
    case 'shop':
      return (
        <>
          <rect x="4" y="9" width="16" height="11" fill="#efe9df" />
          <path d="M3.2 9 L5 4.5 H19 L20.8 9 Z" fill="#c9536b" />
          <path d="M3.2 9 H20.8" stroke="currentColor" strokeWidth="1.1" />
          <rect x="9.5" y="13.5" width="5" height="6.5" fill="#8a5a3a" />
          <circle cx="12.7" cy="16.5" r="0.5" fill="#efe9df" />
        </>
      );
    case 'museum':
      return (
        <>
          <path d="M3.5 10 L12 4 L20.5 10 Z" fill="#c9a06b" />
          <rect x="4" y="10" width="16" height="1.6" fill="#e8c9a0" />
          <rect x="5.5" y="12.5" width="2" height="6.5" fill="#efe9df" />
          <rect x="11" y="12.5" width="2" height="6.5" fill="#efe9df" />
          <rect x="16.5" y="12.5" width="2" height="6.5" fill="#efe9df" />
          <rect x="4" y="19.5" width="16" height="1.6" fill="#c9a06b" />
        </>
      );
    case 'park':
      return (
        <>
          <path d="M8 3.5 L11 9 H5 Z" fill="#7a9d6f" />
          <path d="M8 6 L11.5 12 H4.5 Z" fill="#4f6b45" />
          <rect x="7.2" y="12" width="1.6" height="3" fill="#8a5a3a" />
          <rect x="13" y="15" width="8" height="1.6" fill="#c9a06b" />
          <rect x="14" y="16.6" width="1.2" height="3.4" fill="#8a5a3a" />
          <rect x="19" y="16.6" width="1.2" height="3.4" fill="#8a5a3a" />
        </>
      );
    case 'wildwest':
      return (
        <>
          <ellipse cx="12" cy="15.5" rx="9.5" ry="2.2" fill="#a9764f" />
          <path d="M7 15 C7 9.5 9.5 6 12 6 C14.5 6 17 9.5 17 15 Z" fill="#c9a06b" />
          <rect x="6.5" y="14" width="11" height="1.6" fill="#8a5a3a" />
        </>
      );
    case 'wizardschool':
      return (
        <>
          <ellipse cx="12" cy="18.5" rx="8.5" ry="1.8" fill="#9b7ce0" />
          <path d="M12 3 L16.5 17 H7.5 Z" fill="#7c5ec9" />
          <rect x="7" y="15.5" width="10" height="1.6" fill="#e0a94a" />
          <path d="M17.5 4.5 L18.1 5.9 L19.5 6.1 L18.5 7 L18.8 8.4 L17.5 7.7 L16.2 8.4 L16.5 7 L15.5 6.1 L16.9 5.9 Z" fill="#ffcf4d" />
        </>
      );
    case 'office':
      return (
        <>
          <rect x="9.5" y="4.5" width="5" height="3" rx="0.8" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <rect x="3.5" y="8" width="17" height="11" rx="1.5" fill="#7cc9e8" />
          <rect x="3.5" y="8" width="17" height="4" fill="#5aa8c9" />
          <rect x="11" y="11.5" width="2" height="2.2" fill="#2a2a2a" />
        </>
      );
    case 'mall':
      return (
        <>
          <path d="M6 9 L7 5 H17 L18 9 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <rect x="4.5" y="9" width="15" height="11" rx="1.2" fill="#e0629b" />
          <path d="M9 9 V7 C9 5 10.3 3.8 12 3.8 C13.7 3.8 15 5 15 7 V9" stroke="currentColor" strokeWidth="1.1" fill="none" />
        </>
      );
    case 'forest':
      return (
        <>
          <path d="M6.5 4 L10 11 H3 Z" fill="#4f6b45" />
          <path d="M6.5 7.5 L11 15 H2 Z" fill="#7a9d6f" />
          <rect x="5.8" y="15" width="1.4" height="4.5" fill="#8a5a3a" />
          <path d="M15.5 2.5 L19.5 10.5 H11.5 Z" fill="#4f6b45" />
          <path d="M15.5 6.5 L20.5 15.5 H10.5 Z" fill="#7a9d6f" />
          <rect x="14.6" y="15.5" width="1.8" height="4.5" fill="#8a5a3a" />
        </>
      );
    case 'station':
      return (
        <>
          <rect x="3" y="10" width="18" height="9" fill="#e8e4de" />
          <path d="M3 10 L12 4 L21 10" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <rect x="9" y="13" width="6" height="6" fill="#5a8fc9" />
          <circle cx="12" cy="7.5" r="1.4" fill="#e0a94a" />
        </>
      );
    case 'egypt':
      return (
        <>
          <rect x="3" y="19" width="18" height="1.6" fill="#8a7454" />
          <path d="M12 4 L20 19 H4 Z" fill="#e0c25a" />
          <path d="M12 4 L16 19 H8 Z" fill="#c9a06b" />
          <circle cx="18.3" cy="5.3" r="1.6" fill="#f0d878" />
        </>
      );
    case 'space':
      return (
        <>
          <circle cx="12" cy="13" r="6" fill="#5a8fc9" />
          <ellipse cx="12" cy="13" rx="10" ry="2.4" fill="none" stroke="#e0c25a" strokeWidth="1.6" />
          <circle cx="5" cy="5" r="0.9" fill="#f0d878" />
          <circle cx="19" cy="4.5" r="0.7" fill="#f0d878" />
          <circle cx="20" cy="9" r="0.5" fill="#f0d878" />
        </>
      );
    case 'hospital':
      return (
        <>
          <rect x="6" y="6" width="12" height="12" rx="2" fill="#cccccc" />
          <rect x="10.5" y="8.5" width="3" height="7" fill="#d9524a" />
          <rect x="8.5" y="10.5" width="7" height="3" fill="#d9524a" />
        </>
      );
    case 'wildwest2':
      return (
        <>
          <path
            d="M12 3.5 L14.2 8.6 L19.7 9.2 L15.6 13 L16.7 18.4 L12 15.8 L7.3 18.4 L8.4 13 L4.3 9.2 L9.8 8.6 Z"
            fill="#e0a94a"
            stroke="#8a5a3a"
            strokeWidth="0.9"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="2.1" fill="#8a5a3a" />
          <circle cx="12" cy="5.6" r="0.55" fill="#8a5a3a" />
          <circle cx="16.9" cy="13.4" r="0.55" fill="#8a5a3a" />
          <circle cx="15" cy="17.5" r="0.55" fill="#8a5a3a" />
          <circle cx="9" cy="17.5" r="0.55" fill="#8a5a3a" />
          <circle cx="7.1" cy="13.4" r="0.55" fill="#8a5a3a" />
        </>
      );
    case 'stadium':
      return (
        <>
          <circle cx="12" cy="12" r="8.5" fill="#f4f2ec" stroke="#2a2a2a" strokeWidth="1.1" />
          <path d="M12 9 L15 11.2 L13.9 14.5 L10.1 14.5 L9 11.2 Z" fill="#2f2f2f" />
          <path d="M12 9 L12 4.3 M15 11.2 L19.4 9.8 M13.9 14.5 L16.5 17.6 M10.1 14.5 L7.5 17.6 M9 11.2 L4.6 9.8" stroke="#2f2f2f" strokeWidth="1" />
        </>
      );
    case 'prison':
      return (
        <>
          <rect x="5" y="4" width="14" height="16" rx="1.5" fill="#8a857c" />
          <path d="M8 4 V20 M12 4 V20 M16 4 V20 M5 8.5 H19 M5 15.5 H19" stroke="#2a2a2a" strokeWidth="1.6" />
        </>
      );
    case 'hotel':
      return (
        <>
          <path d="M12 3.5 C13.2 5 13.2 7 12 8.5 C10.8 7 10.8 5 12 3.5 Z" fill="#e0a94a" />
          <path d="M6.5 8.5 H17.5 L19 19 H5 Z" fill="#4d8dff" opacity="0.25" />
          <path d="M6.5 8.5 H17.5 L19 19 H5 Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          <circle cx="12" cy="13.5" r="2.6" fill="none" stroke="#e0a94a" strokeWidth="1.4" />
          <circle cx="12" cy="13.5" r="1" fill="#e0a94a" />
        </>
      );
    case 'island':
      return (
        <>
          <path d="M13 21 C12.5 16 12 12 10.5 8.5" stroke="#8a6642" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M10.5 8.5 C8.5 6.5 6 6.3 4 7.5 C6.3 7.8 8 8.6 9.3 10" fill="#5fa85a" />
          <path d="M10.5 8.5 C12.3 6.2 15.1 5.8 17.3 7 C14.9 7.4 13.1 8.4 11.7 10" fill="#5fa85a" />
          <path d="M10.5 8.5 C10.1 5.9 11.5 3.8 13.9 3 C12.7 5 12.3 6.7 12.5 8.6" fill="#6fbb63" />
          <path d="M4 19.5 C6 17.8 8 17 10 17 C12.5 14.5 15.5 14.5 18 17 C19.5 17.5 20.5 18.3 21 19.5 Z" fill="#e3c98a" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M12.5 16.2 C13.5 15 15 14.8 16 15.6" stroke="#4d8dff" strokeWidth="1.1" fill="none" strokeLinecap="round" />
        </>
      );
    case 'lighthouse':
      return (
        <>
          <path d="M9.5 8.5 H14.5 L15.5 21 H8.5 Z" fill="#e8e4de" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M9.8 12 H14.2 M9.6 15.5 H14.4" stroke="#c9536b" strokeWidth="1.4" />
          <path d="M12 8.5 V5.5" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="12" cy="4.5" r="1.8" fill="#e8c970" stroke="#c9a53f" strokeWidth="1" />
          <path d="M8.5 6.5 L5 5 M15.5 6.5 L19 5" stroke="#e8c970" strokeWidth="1.1" strokeLinecap="round" />
          <path d="M6 21 H18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M4 8 C3 8.6 2.5 9.3 2.5 10.2 M20 8 C21 8.6 21.5 9.3 21.5 10.2" stroke="#4d8dff" strokeWidth="0.9" fill="none" strokeLinecap="round" />
        </>
      );
    case 'train':
      return (
        <>
          <rect x="3.5" y="13" width="11" height="6" rx="1.2" fill="#4d8dff" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M14.5 14 H19 C20 14 20.5 15 20.5 16 V19 H14.5 Z" fill="#e0a94a" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
          <path d="M9 13 V8.5 H13.5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round" />
          <rect x="9.5" y="5.5" width="3" height="3" fill="#2a2a2a" />
          <rect x="5.5" y="15" width="2.6" height="2.4" rx="0.5" fill="#d7e6f5" />
          <rect x="10.5" y="15" width="2.6" height="2.4" rx="0.5" fill="#d7e6f5" />
          <path d="M16 15.5 H18.5" stroke="#8a5a3a" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="6.5" cy="20.6" r="1.3" fill="#2a2a2a" />
          <circle cx="11.5" cy="20.6" r="1.3" fill="#2a2a2a" />
          <circle cx="17.5" cy="20.6" r="1.3" fill="#2a2a2a" />
          <path d="M2 20.6 H21" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </>
      );
    case 'medieval':
      return (
        <>
          <path d="M4 20 V9 L4 6 H6.5 L8 8 H16 L17.5 6 H20 V9 V20" fill="#8a857c" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M4 6 L6.5 6 L8 8 M20 6 L17.5 6 L16 8" stroke="currentColor" strokeWidth="1.1" fill="none" />
          <rect x="10" y="10" width="4" height="10" rx="0.6" fill="#5a3d24" stroke="#3f2f22" strokeWidth="0.8" />
          <path d="M8 14 H10 M14 14 H16" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          <path d="M2 20 H22" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M12 2 V4 M12 4 L13.2 5.2 M12 4 L10.8 5.2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          <path d="M6.8 3.4 C7.6 3 8.4 3 9 3.6 C8.2 4 7.4 4 6.8 3.4 Z" fill="#4d8dff" />
          <path d="M15 3.4 C15.8 3 16.6 3 17.2 3.6 C16.4 4 15.6 4 15 3.4 Z" fill="#c9536b" />
        </>
      );
    case 'amusementpark':
      return (
        <>
          <path d="M12 2.5 V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M12 5 V19 M5 12 H19 M7 7 L17 17 M17 7 L7 17" stroke="currentColor" strokeWidth="0.9" />
          <path d="M12 5 L9.5 7.5 L12 10 L14.5 7.5 Z" fill="#c9536b" />
          <path d="M12 10 L9.5 12.5 L12 15 L14.5 12.5 Z" fill="#4d8dff" />
          <path d="M12 15 L9.5 17.5 L12 20 L14.5 17.5 Z" fill="#e0a94a" />
          <circle cx="12" cy="12" r="1.3" fill="#f5e4a8" stroke="currentColor" strokeWidth="0.8" />
          <path d="M3 21 H21" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M5.5 21 V18.5 M18.5 21 V18.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </>
      );
    case 'agency':
      return (
        <>
          <circle cx="10" cy="10" r="6" fill="#d7e6f5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M14.5 14.5 L20 20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M7.5 10 C7.5 8 9 6.8 10.8 6.9" stroke="#ffffff" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <circle cx="10" cy="10" r="2.4" fill="#e0a94a" opacity="0.6" />
        </>
      );
    default:
      return <rect x="6" y="6" width="12" height="12" rx="2" fill="#cccccc" />;
  }
}

export function ThemeIcon({ theme, size = 40 }: ThemeIconProps) {
  // Designer theme art (src/assets/icons/themes/<theme>.svg) wins; then themes that map to
  // an item icon (airport -> plane, zoo -> penguin); then the built-in switch above.
  const Custom = themeIconRegistry[theme];
  if (Custom) {
    return <Custom className="theme-icon" width={size} height={size} />;
  }
  const itemIcon = THEME_ITEM_ICONS[theme];
  if (itemIcon) return <ItemIcon itemType={itemIcon} size={size} />;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className="theme-icon"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {renderIconShape(theme)}
    </svg>
  );
}
