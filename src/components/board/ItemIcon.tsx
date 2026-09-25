import type { ReactNode } from 'react';
import type { ItemType } from '../../types/level';
import { itemIconRegistry } from '../../assets/itemIconRegistry';

interface ItemIconProps {
  itemType: ItemType;
  size?: number;
}

function renderIconShape(icon: string): ReactNode {
  switch (icon) {
    case 'stove':
      return (
        <>
          <rect x="3.5" y="4" width="17" height="17" rx="1.5" fill="#d9d4cc" />
          <rect x="3.5" y="4" width="17" height="4.5" fill="#c3beb5" />
          <circle cx="6.5" cy="6.2" r="0.6" fill="#8a857c" />
          <circle cx="9" cy="6.2" r="0.6" fill="#8a857c" />
          <circle cx="11.5" cy="6.2" r="0.6" fill="#8a857c" />
          <circle cx="7.7" cy="13" r="3" fill="#efe9df" />
          <circle cx="15.5" cy="13" r="3" fill="#efe9df" />
          <circle cx="7.7" cy="13" r="1.4" fill="none" stroke="currentColor" strokeWidth="0.8" />
          <circle cx="15.5" cy="13" r="1.4" fill="none" stroke="currentColor" strokeWidth="0.8" />
          <rect x="4.5" y="17.2" width="15" height="2.6" rx="1" fill="#efe9df" />
        </>
      );
    case 'fridge':
      return (
        <>
          <rect x="5" y="2" width="14" height="20" rx="2" fill="#dcefe9" />
          <line x1="5" y1="8.5" x2="19" y2="8.5" stroke="currentColor" strokeWidth="1.2" />
          <rect x="16.3" y="4" width="1.4" height="3" rx="0.7" fill="#8fa89f" />
          <rect x="16.3" y="10.5" width="1.4" height="4" rx="0.7" fill="#8fa89f" />
        </>
      );
    case 'chair':
      return (
        <>
          <rect x="7" y="3" width="10" height="8" rx="2" fill="#e8c9a0" />
          <rect x="6" y="10.5" width="12" height="5.5" rx="1.5" fill="#dcb489" />
          <path d="M7 16 L6 21" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M17 16 L18 21" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M8.5 16 L8 21" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M15.5 16 L16 21" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </>
      );
    case 'sofa':
      return (
        <>
          <rect x="3" y="9" width="18" height="8.5" rx="2.5" fill="#e3c3d4" />
          <rect x="2.5" y="6.5" width="4" height="9" rx="2" fill="#d9aec4" />
          <rect x="17.5" y="6.5" width="4" height="9" rx="2" fill="#d9aec4" />
          <rect x="6.5" y="7" width="5.2" height="5" rx="1.6" fill="#f0dde8" />
          <rect x="12.3" y="7" width="5.2" height="5" rx="1.6" fill="#f0dde8" />
          <path d="M5 17.5 L5 20" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M19 17.5 L19 20" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </>
      );
    case 'bed':
      return (
        <>
          <rect x="3" y="10" width="18" height="10" rx="1.5" fill="#cfe0f0" />
          <rect x="3" y="6" width="4.5" height="14" rx="1.2" fill="#b8cfe6" />
          <rect x="4.2" y="7.2" width="4.8" height="4.5" rx="1.4" fill="#f5f2eb" />
          <path d="M9.5 13.5 L21 13.5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          <rect x="9.5" y="13.5" width="11" height="6.5" rx="1" fill="#dcb8c4" />
        </>
      );
    case 'wardrobe':
      return (
        <>
          <rect x="4" y="2.5" width="16" height="19" rx="1.2" fill="#c9b79a" />
          <line x1="12" y1="4" x2="12" y2="20.5" stroke="currentColor" strokeWidth="1" />
          <circle cx="10.6" cy="12" r="0.7" fill="#5a4636" />
          <circle cx="13.4" cy="12" r="0.7" fill="#5a4636" />
          <rect x="4" y="2.5" width="16" height="2.2" fill="#b09d7e" />
        </>
      );
    case 'bookshelf':
      return (
        <>
          <rect x="4" y="2.5" width="16" height="19" rx="1" fill="#a9764f" />
          <rect x="5.2" y="3.7" width="13.6" height="4.6" fill="#f4ede2" />
          <rect x="5.2" y="9.4" width="13.6" height="4.6" fill="#f4ede2" />
          <rect x="5.2" y="15.1" width="13.6" height="4.6" fill="#f4ede2" />
          <rect x="6" y="4.2" width="1.4" height="3.6" fill="#c9647a" />
          <rect x="7.7" y="4.2" width="1.4" height="3.6" fill="#5a8fc9" />
          <rect x="9.4" y="4.2" width="1.4" height="3.6" fill="#e0a94a" />
          <rect x="11.1" y="4.2" width="1.4" height="3.6" fill="#6bb88a" />
          <rect x="6" y="9.9" width="1.4" height="3.6" fill="#8a6bc9" />
          <rect x="7.7" y="9.9" width="1.4" height="3.6" fill="#e0a94a" />
          <rect x="9.4" y="9.9" width="1.4" height="3.6" fill="#c9647a" />
          <rect x="11.6" y="9.9" width="1.4" height="3.6" fill="#5a8fc9" />
          <rect x="6" y="15.6" width="1.4" height="3.6" fill="#6bb88a" />
          <rect x="7.7" y="15.6" width="1.4" height="3.6" fill="#c9647a" />
          <rect x="9.4" y="15.6" width="1.4" height="3.6" fill="#8a6bc9" />
        </>
      );
    case 'kassa':
      return (
        <>
          <rect x="2" y="13.5" width="20" height="7" rx="1.2" fill="#c9a876" />
          <rect x="6" y="5.5" width="9" height="7.5" rx="1.2" fill="#e8e4da" />
          <rect x="7.2" y="6.8" width="6.6" height="3" rx="0.6" fill="#7cc9e8" />
          <rect x="7.5" y="10.3" width="1.6" height="1.6" fill="#9b9284" />
          <rect x="9.6" y="10.3" width="1.6" height="1.6" fill="#9b9284" />
          <rect x="11.7" y="10.3" width="1.6" height="1.6" fill="#9b9284" />
          <rect x="16.5" y="9" width="4" height="4.5" rx="0.6" fill="#b09d7e" />
        </>
      );
    case 'veggieCounter':
      return (
        <>
          <rect x="2" y="14" width="20" height="7" rx="1.2" fill="#c9a876" />
          <circle cx="7" cy="10.5" r="2.6" fill="#d9524a" />
          <path d="M6.4 8.3 L7.6 7.2" stroke="#3a7d3f" strokeWidth="1" strokeLinecap="round" />
          <ellipse cx="13" cy="11" rx="3.1" ry="2.6" fill="#6bb84f" />
          <path d="M17.5 13 L15.7 8.5 L19.3 8.5 Z" fill="#e8924a" />
        </>
      );
    case 'cart':
      return (
        <>
          <path
            d="M4 5 H6.5 L8.7 15.5 H18.5 L20.3 8.5 H7.6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="8.2" y="8.5" width="11.5" height="7" fill="#cfe0f0" opacity="0.7" />
          <circle cx="10.5" cy="19" r="1.6" fill="#5a5a5a" />
          <circle cx="16.5" cy="19" r="1.6" fill="#5a5a5a" />
        </>
      );
    case 'plant':
      return (
        <>
          <path d="M8 15 L16 15 L14.8 22 H9.2 Z" fill="#c9a876" />
          <path
            d="M12 15 C12 10 8 9 7 5 C10 6 12 9 12 12 C12 9 14 6 17 5 C16 9 12 10 12 15 Z"
            fill="#4f9a5c"
          />
        </>
      );
    case 'rack':
      return (
        <>
          <line x1="3" y1="4" x2="3" y2="21" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="21" y1="4" x2="21" y2="21" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="3" y1="4" x2="21" y2="4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M6.5 5 L6.5 6.5 L5 8.5 H9 L7.5 6.5 L7.5 5" fill="#e0629b" />
          <path d="M12 5 L12 6.5 L10.5 8.5 H14.5 L13 6.5 L13 5" fill="#5a8fc9" />
          <path d="M17.5 5 L17.5 6.5 L16 8.5 H20 L18.5 6.5 L18.5 5" fill="#e0a94a" />
        </>
      );
    case 'box':
      return (
        <>
          <rect x="3.5" y="6" width="17" height="14" rx="1" fill="#c9a876" />
          <path d="M3.5 6 L12 11 L20.5 6" fill="none" stroke="#8a7454" strokeWidth="1" />
          <line x1="12" y1="11" x2="12" y2="20" stroke="#8a7454" strokeWidth="1" />
          <line x1="8" y1="6" x2="8" y2="20" stroke="#a9906e" strokeWidth="0.8" opacity="0.6" />
        </>
      );
    case 'stool':
      return (
        <>
          <ellipse cx="12" cy="7" rx="7" ry="3" fill="#dcb489" />
          <path d="M6.5 8 L5 20" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M17.5 8 L19 20" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M12 9 L11.5 20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
        </>
      );
    case 'paintingStand':
      return (
        <>
          <rect x="4" y="3" width="14" height="11" rx="0.8" fill="#f4ede2" stroke="currentColor" strokeWidth="1" />
          <path d="M6 11 L9.5 6.5 L12.5 9.5 L15 6 L16.5 11 Z" fill="#8fbf9f" />
          <path d="M2 21 L11 14 M20 21 L11 14" stroke="#a9906e" strokeWidth="1.3" strokeLinecap="round" />
        </>
      );
    case 'sculpture':
      return (
        <>
          <rect x="5" y="15" width="14" height="6" rx="0.6" fill="#cfc7ba" />
          <path
            d="M9 15 C9 9 10.5 8 12 8 C13.5 8 15 9 15 15 Z"
            fill="#e8e4da"
            stroke="currentColor"
            strokeWidth="0.8"
          />
          <circle cx="12" cy="6.5" r="2" fill="#e8e4da" stroke="currentColor" strokeWidth="0.8" />
        </>
      );
    case 'souvenirRack':
      return (
        <>
          <rect x="3.5" y="2.5" width="17" height="19" rx="1" fill="#a9764f" />
          <rect x="4.7" y="4" width="14.6" height="4.6" fill="#f4ede2" />
          <rect x="4.7" y="10" width="14.6" height="4.6" fill="#f4ede2" />
          <rect x="4.7" y="16" width="14.6" height="4.6" fill="#f4ede2" />
          <circle cx="7.5" cy="6.3" r="1.1" fill="#e0629b" />
          <circle cx="11" cy="6.3" r="1.1" fill="#5a8fc9" />
          <path d="M8 15.6 L10.5 12.4 L13 15.6 Z" fill="#e0a94a" />
          <rect x="7" y="17.5" width="2.5" height="2.2" fill="#6bb88a" />
        </>
      );
    case 'ladder':
      return (
        <>
          <path d="M6 21 L10 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M18 21 L14 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="7.5" y1="16" x2="16.5" y2="16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="8.3" y1="12" x2="15.7" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="9.1" y1="8" x2="14.9" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </>
      );
    case 'bench':
      return (
        <>
          <rect x="3" y="9" width="18" height="2.4" rx="0.8" fill="#c9a06b" />
          <rect x="3" y="14" width="18" height="2.4" rx="0.8" fill="#c9a06b" />
          <path d="M4.5 11.4 L4.5 20" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M19.5 11.4 L19.5 20" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M4.5 5 L4.5 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M19.5 5 L19.5 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <rect x="3" y="4" width="18" height="1.8" rx="0.8" fill="#dcb489" />
        </>
      );
    case 'fountain':
      return (
        <>
          <ellipse cx="12" cy="18.5" rx="9.5" ry="3" fill="#8fbfd6" />
          <ellipse cx="12" cy="18.5" rx="9.5" ry="3" fill="none" stroke="currentColor" strokeWidth="1" />
          <ellipse cx="12" cy="13" rx="5.5" ry="2" fill="#a9d4e6" />
          <rect x="11.1" y="6" width="1.8" height="8" fill="#b0aca2" />
          <path d="M12 6 C9 8 8.5 11 9.5 13" stroke="#a9d4e6" strokeWidth="1.1" fill="none" strokeLinecap="round" />
          <path d="M12 6 C15 8 15.5 11 14.5 13" stroke="#a9d4e6" strokeWidth="1.1" fill="none" strokeLinecap="round" />
        </>
      );
    case 'swing':
      return (
        <>
          <path d="M4 3 L8 20" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M20 3 L16 20" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="4" y1="3" x2="20" y2="3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M9 5 L8.7 15" stroke="#8a7454" strokeWidth="1" strokeLinecap="round" />
          <path d="M15 5 L15.3 15" stroke="#8a7454" strokeWidth="1" strokeLinecap="round" />
          <rect x="7.5" y="15" width="9" height="2" rx="0.8" fill="#dcb489" />
        </>
      );
    case 'lamppost':
      return (
        <>
          <rect x="11.2" y="9" width="1.6" height="12" fill="#8a8578" />
          <path d="M6 21 L18 21" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M9 9 L12 4 L15 9 Z" fill="#f0d878" stroke="currentColor" strokeWidth="0.8" />
          <circle cx="12" cy="4" r="1" fill="#f0d878" />
        </>
      );
    case 'trashcan':
      return (
        <>
          <path d="M6.5 8 L7.5 21 H16.5 L17.5 8 Z" fill="#a9b8a0" />
          <rect x="5.5" y="6" width="13" height="2.2" rx="0.8" fill="#8a9880" />
          <rect x="9.5" y="3.5" width="5" height="2.2" rx="0.8" fill="#8a9880" />
          <line x1="10.5" y1="10.5" x2="11" y2="18.5" stroke="#7a8870" strokeWidth="0.8" />
          <line x1="13.5" y1="10.5" x2="13" y2="18.5" stroke="#7a8870" strokeWidth="0.8" />
        </>
      );
    case 'flowerbed':
      return (
        <>
          <rect x="3" y="14" width="18" height="6" rx="1.2" fill="#8a7454" />
          <rect x="3" y="14" width="18" height="2" fill="#a9906e" />
          <circle cx="7.5" cy="10" r="2" fill="#e0629b" />
          <circle cx="12" cy="8.5" r="2" fill="#e0a94a" />
          <circle cx="16.5" cy="10" r="2" fill="#c9536b" />
          <circle cx="7.5" cy="10" r="0.7" fill="#f4ede2" />
          <circle cx="12" cy="8.5" r="0.7" fill="#f4ede2" />
          <circle cx="16.5" cy="10" r="0.7" fill="#f4ede2" />
        </>
      );
    case 'kiosk':
      return (
        <>
          <rect x="4" y="9" width="16" height="10" rx="1" fill="#e8c9a0" />
          <path d="M3 9 L12 4 L21 9 Z" fill="#c9536b" />
          <rect x="9.5" y="12.5" width="5" height="6.5" fill="#a9764f" />
          <rect x="5.2" y="10.5" width="4" height="3.5" fill="#7cc9e8" />
          <rect x="14.8" y="10.5" width="4" height="3.5" fill="#7cc9e8" />
        </>
      );
    case 'barCounter':
      return (
        <>
          <rect x="2" y="12" width="20" height="3" rx="0.6" fill="#a9764f" />
          <rect x="2" y="15" width="20" height="6" fill="#8a5a3a" />
          <rect x="3.5" y="16.2" width="3.4" height="3.4" fill="#6b4429" />
          <rect x="8.3" y="16.2" width="3.4" height="3.4" fill="#6b4429" />
          <rect x="13.1" y="16.2" width="3.4" height="3.4" fill="#6b4429" />
          <rect x="17.9" y="16.2" width="3.4" height="3.4" fill="#6b4429" />
          <rect x="5" y="4" width="3" height="8" rx="1" fill="#7cc9e8" opacity="0.8" />
          <rect x="10" y="3" width="3" height="9" rx="1" fill="#e0a94a" opacity="0.8" />
          <rect x="15" y="4.5" width="3" height="7.5" rx="1" fill="#c9536b" opacity="0.8" />
        </>
      );
    case 'piano':
      return (
        <>
          <path d="M4 5 H16 V13 H11 L4 17 Z" fill="#5a4636" />
          <rect x="4" y="13" width="12" height="3" fill="#3f2f22" />
          <rect x="16" y="5" width="4" height="8" fill="#6b5440" />
          <rect x="5" y="6.2" width="10" height="3.2" fill="#f4ede2" />
          <rect x="5.6" y="6.2" width="0.9" height="3.2" fill="#2a2018" />
          <rect x="7.4" y="6.2" width="0.9" height="3.2" fill="#2a2018" />
          <rect x="9.2" y="6.2" width="0.9" height="3.2" fill="#2a2018" />
          <rect x="11" y="6.2" width="0.9" height="3.2" fill="#2a2018" />
          <rect x="12.8" y="6.2" width="0.9" height="3.2" fill="#2a2018" />
          <path d="M6 17 L5 21 M13 17 L14 21" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </>
      );
    case 'billiardTable':
      return (
        <>
          <rect x="2.5" y="6" width="19" height="12" rx="1" fill="#3a7d3f" stroke="#5a4636" strokeWidth="1.6" />
          <circle cx="3.5" cy="7" r="1" fill="#1e1e1e" />
          <circle cx="20.5" cy="7" r="1" fill="#1e1e1e" />
          <circle cx="3.5" cy="17" r="1" fill="#1e1e1e" />
          <circle cx="20.5" cy="17" r="1" fill="#1e1e1e" />
          <circle cx="12" cy="7" r="0.9" fill="#1e1e1e" />
          <circle cx="12" cy="17" r="0.9" fill="#1e1e1e" />
          <circle cx="9" cy="12" r="1.4" fill="#f4ede2" />
          <circle cx="14.5" cy="10.5" r="1.4" fill="#c9536b" />
          <circle cx="15.5" cy="13.5" r="1.4" fill="#e0a94a" />
          <path d="M5 21 L11 12" stroke="#c9a06b" strokeWidth="1" strokeLinecap="round" />
        </>
      );
    case 'barStool':
      return (
        <>
          <ellipse cx="12" cy="8" rx="6.5" ry="2.6" fill="#c9536b" />
          <path d="M8 10 L7 20" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M16 10 L17 20" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M9 17 L15 17" stroke="#8a5a3a" strokeWidth="1.2" strokeLinecap="round" />
        </>
      );
    case 'barrel':
      return (
        <>
          <path d="M6 4 H18 L17 20 H7 Z" fill="#a9764f" />
          <path d="M5.6 7 H18.4" stroke="#5a3d24" strokeWidth="1.3" />
          <path d="M5.3 12 H18.7" stroke="#5a3d24" strokeWidth="1.3" />
          <path d="M5.6 17 H18.4" stroke="#5a3d24" strokeWidth="1.3" />
          <path d="M6 4 C9 6 15 6 18 4" fill="none" stroke="#5a3d24" strokeWidth="1" />
          <path d="M7 20 C10 18 14 18 17 20" fill="none" stroke="#5a3d24" strokeWidth="1" />
        </>
      );
    case 'hitchingPost':
      return (
        <>
          <rect x="3.2" y="3" width="1.6" height="18" fill="#8a5a3a" />
          <rect x="19.2" y="3" width="1.6" height="18" fill="#8a5a3a" />
          <path d="M3 8 L21 8" stroke="#5a3d24" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M8 8 C8 12 10 12 10 16" stroke="#3f2f22" strokeWidth="1" fill="none" />
          <path d="M15 8 C15 12 13 12 13 16" stroke="#3f2f22" strokeWidth="1" fill="none" />
        </>
      );
    case 'haystack':
      return (
        <>
          <path
            d="M12 3 C17 5 19 10 17.5 15 C19 16 19 19 17 20.5 H7 C5 19 5 16 6.5 15 C5 10 7 5 12 3 Z"
            fill="#e0c25a"
          />
          <path d="M8 10 L16 10 M7 14 L17 14 M7.5 18 L16.5 18" stroke="#c9a06b" strokeWidth="1" strokeLinecap="round" />
        </>
      );
    case 'safe':
      return (
        <>
          <rect x="4" y="3" width="16" height="18" rx="1.2" fill="#6b7280" />
          <rect x="6" y="5" width="12" height="14" rx="0.8" fill="#4b5160" />
          <circle cx="12" cy="12" r="3.2" fill="#8a8f9c" stroke="#2f333d" strokeWidth="0.8" />
          <circle cx="12" cy="12" r="0.9" fill="#2f333d" />
          <rect x="15.6" y="9.5" width="1.4" height="1.4" fill="#2f333d" />
          <rect x="15.6" y="13.5" width="1.4" height="1.4" fill="#2f333d" />
        </>
      );
    case 'cauldron':
      return (
        <>
          <path d="M4 10 C4 16 7 20 12 20 C17 20 20 16 20 10 Z" fill="#3f4650" />
          <ellipse cx="12" cy="10" rx="8" ry="2.2" fill="#565f6b" />
          <path d="M3 8.5 L6 10 M21 8.5 L18 10" stroke="#3f4650" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M9 6 C10 3.5 8 3 8.5 5 M13 6 C13.5 3 15.5 3.5 14.5 5.5" stroke="#6bb88a" strokeWidth="1.1" fill="none" strokeLinecap="round" />
        </>
      );
    case 'workbench':
      return (
        <>
          <rect x="2.5" y="12.5" width="19" height="3" rx="0.6" fill="#a9764f" />
          <path d="M4 15.5 L4 20.5 M20 15.5 L20 20.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <rect x="6" y="6" width="5" height="6.5" rx="0.6" fill="#8a6bc9" />
          <circle cx="15" cy="9" r="2.6" fill="#d9524a" />
          <rect x="7" y="7.2" width="3" height="1.3" fill="#f4ede2" />
        </>
      );
    case 'spellbookStand':
      return (
        <>
          <path d="M4 20 L12 17 L20 20 L12 22 Z" fill="#8a7454" />
          <path d="M12 17 L12 5" stroke="#8a7454" strokeWidth="1.4" />
          <path d="M12 8 C9 5.5 5 6 4 8 C5 11 9 11.5 12 9.5 Z" fill="#c9536b" />
          <path d="M12 8 C15 5.5 19 6 20 8 C19 11 15 11.5 12 9.5 Z" fill="#5a8fc9" />
          <path d="M12 5 L12 9.5" stroke="#3f2f22" strokeWidth="0.8" />
        </>
      );
    case 'globe':
      return (
        <>
          <path d="M8 20 L16 20 M12 18 L12 20" stroke="#8a7454" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M7 18 C7 18 6 15 12 15 C18 15 17 18 17 18" stroke="#8a7454" strokeWidth="1.2" fill="none" />
          <circle cx="12" cy="9" r="7" fill="#7cc9e8" />
          <path d="M12 2 C9 5 9 13 12 16 C15 13 15 5 12 2 Z" fill="none" stroke="#3f7d8a" strokeWidth="0.9" />
          <path d="M5.5 9 H18.5" stroke="#3f7d8a" strokeWidth="0.9" />
          <path d="M9 5 C11 6.5 13 6.5 15.5 5.5 M8.5 13 C11 12 13.5 12 15.5 12.8" fill="#6bb88a" stroke="#3f7d8a" strokeWidth="0.5" />
        </>
      );
    case 'artifactChest':
      return (
        <>
          <rect x="2.5" y="11" width="19" height="9" rx="1" fill="#a9764f" />
          <path d="M2.5 11 C2.5 7 6 5 12 5 C18 5 21.5 7 21.5 11 Z" fill="#8a5a3a" />
          <rect x="10.6" y="10.5" width="2.8" height="4" rx="0.6" fill="#e0a94a" />
          <path d="M2.5 11 H21.5" stroke="#5a3d24" strokeWidth="1" />
          <circle cx="12" cy="12.2" r="1" fill="#5a3d24" />
        </>
      );
    case 'armchair':
      return (
        <>
          <rect x="4" y="8" width="16" height="8" rx="2" fill="#9b7ce0" />
          <rect x="3" y="4.5" width="4.5" height="12" rx="2" fill="#8a6bc9" />
          <rect x="16.5" y="4.5" width="4.5" height="12" rx="2" fill="#8a6bc9" />
          <rect x="4.5" y="15" width="15" height="4.5" rx="1.6" fill="#8a6bc9" />
          <path d="M5.5 19 L5 21.5 M18.5 19 L19 21.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </>
      );
    case 'portrait':
      return (
        <>
          <rect x="4" y="2.5" width="16" height="19" rx="1" fill="#a9764f" />
          <rect x="5.6" y="4" width="12.8" height="16" fill="#f4ede2" />
          <circle cx="12" cy="10" r="3.2" fill="#e8c9a0" />
          <path d="M12 13.5 C8.5 13.5 7 16.5 7 19 H17 C17 16.5 15.5 13.5 12 13.5 Z" fill="#5a8fc9" />
        </>
      );
    case 'telescope':
      return (
        <>
          <path d="M4 20 L9 15 M20 20 L9 15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <rect x="7.5" y="14" width="1.5" height="3.5" fill="#8a8578" />
          <path d="M6 15 L18 6" stroke="#5a8fc9" strokeWidth="3" strokeLinecap="round" />
          <path d="M6 15 L18 6" stroke="#b0aca2" strokeWidth="1" strokeLinecap="round" />
          <circle cx="18" cy="6" r="1.6" fill="#2f333d" />
        </>
      );
    case 'broomRack':
      return (
        <>
          <rect x="3" y="4" width="1.6" height="17" fill="#8a5a3a" />
          <rect x="19.4" y="4" width="1.6" height="17" fill="#8a5a3a" />
          <path d="M3 8 H21" stroke="#8a5a3a" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M3 16 H21" stroke="#8a5a3a" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M7 8 L7 3" stroke="#a9764f" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M7 3 L4.5 6 M7 3 L9.5 6" stroke="#e0c25a" strokeWidth="1" strokeLinecap="round" />
          <path d="M13 16 L13 21" stroke="#a9764f" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M13 21 L10.5 18 M13 21 L15.5 18" stroke="#e0c25a" strokeWidth="1" strokeLinecap="round" />
          <path d="M17 8 L17 3" stroke="#a9764f" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M17 3 L14.5 6 M17 3 L19.5 6" stroke="#e0c25a" strokeWidth="1" strokeLinecap="round" />
        </>
      );
    case 'computer':
      return (
        <>
          <rect x="3" y="4" width="18" height="12" rx="1.2" fill="#3a3f4a" />
          <rect x="4.5" y="5.5" width="15" height="9" fill="#7cc9e8" />
          <rect x="10" y="16" width="4" height="2.5" fill="#5a5f6b" />
          <rect x="6" y="18.5" width="12" height="2" rx="0.8" fill="#3a3f4a" />
          <rect x="5" y="21" width="14" height="1.6" rx="0.6" fill="#8a8578" />
        </>
      );
    case 'watercooler':
      return (
        <>
          <rect x="7" y="2.5" width="10" height="9" rx="4" fill="#7cc9e8" opacity="0.85" />
          <rect x="6" y="11" width="12" height="10" rx="1.2" fill="#e8e4de" />
          <rect x="8.5" y="13" width="2.4" height="2.4" rx="0.5" fill="#5a8fc9" />
          <rect x="13.1" y="13" width="2.4" height="2.4" rx="0.5" fill="#d9524a" />
          <rect x="9" y="18" width="6" height="1.6" rx="0.5" fill="#b0aca2" />
          <path d="M8 21 L8 22.5 M16 21 L16 22.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </>
      );
    case 'mannequin':
      return (
        <>
          <circle cx="12" cy="4.2" r="2.2" fill="#e8dfd0" />
          <path d="M12 6.4 L12 9" stroke="#b0a68f" strokeWidth="1" strokeLinecap="round" />
          <path d="M7 9 Q12 7 17 9 L16 16 Q12 17.5 8 16 Z" fill="#c9536b" />
          <path d="M12 9 L12 16.5" stroke="#a83f56" strokeWidth="0.8" />
          <rect x="11.2" y="16.5" width="1.6" height="4" fill="#8a8578" />
          <ellipse cx="12" cy="21" rx="4" ry="1.2" fill="#5a5f6b" />
        </>
      );
    case 'tent':
      return (
        <>
          <path d="M4 20 L12 5 L20 20 Z" fill="#7a9d6f" />
          <path d="M12 5 L12 20" stroke="#4f6b45" strokeWidth="1" />
          <path d="M9 20 L12 12 L15 20 Z" fill="#4f6b45" />
          <path d="M4 20 L20 20" stroke="#3f5637" strokeWidth="1.2" strokeLinecap="round" />
        </>
      );
    case 'campfire':
      return (
        <>
          <path d="M5 20 L11 9 M19 20 L13 9" stroke="#8a5a3a" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M12 19 C9 16 9.5 12.5 12 8 C12.8 11 15 12 14.5 15 C16 14 16.3 12 15.8 10.5 C18 13.5 17 18 12 19 Z" fill="#e0a94a" />
          <path d="M12 17.5 C10.5 15.5 11 13.5 12 11 C12.6 13 13.7 13.3 13.4 15.3 C14.7 13.8 12 17.5 12 17.5 Z" fill="#c9536b" />
        </>
      );
    case 'tree':
      return (
        <>
          <rect x="11.1" y="18" width="1.8" height="3" fill="#8a5a3a" />
          <path d="M12 3 L15.5 9 H8.5 Z" fill="#7a9d6f" />
          <path d="M12 6.5 L16.5 13 H7.5 Z" fill="#4f6b45" />
          <path d="M12 10.5 L18 18 H6 Z" fill="#7a9d6f" />
          <path d="M12 3 L12 18" stroke="#3f5637" strokeWidth="0.9" opacity="0.5" />
        </>
      );
    case 'stump':
      return (
        <>
          <path d="M5.2 12.5 L6 21 H18 L18.8 12.5 Z" fill="#8a5a3a" />
          <path
            d="M5.2 12.5 C5.2 10 8.2 8.7 12 8.7 C15.8 8.7 18.8 10 18.8 12.5 C18.8 15 15.8 16.3 12 16.3 C8.2 16.3 5.2 15 5.2 12.5 Z"
            fill="#c9a06b"
          />
          <ellipse cx="12" cy="12.5" rx="4.2" ry="2.4" fill="none" stroke="#a9764f" strokeWidth="0.8" />
          <ellipse cx="12" cy="12.5" rx="1.8" ry="1" fill="none" stroke="#a9764f" strokeWidth="0.8" />
        </>
      );
    case 'suitcase':
      return (
        <>
          <rect x="4" y="8" width="16" height="12" rx="1.5" fill="#a9764f" />
          <rect x="9" y="4.5" width="6" height="4" rx="1" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <rect x="4" y="8" width="16" height="2.4" fill="#8a5a3a" />
          <rect x="7" y="12.5" width="2" height="2" fill="#e0c25a" />
          <rect x="15" y="12.5" width="2" height="2" fill="#e0c25a" />
        </>
      );
    case 'departureBoard':
      return (
        <>
          <rect x="2.5" y="4" width="19" height="15" rx="1" fill="#1e1e1e" />
          <rect x="2.5" y="4" width="19" height="3.2" fill="#3a3a3a" />
          <rect x="4.5" y="9" width="9" height="1.6" fill="#e0a94a" />
          <rect x="4.5" y="12" width="12" height="1.6" fill="#e0a94a" />
          <rect x="4.5" y="15" width="7" height="1.6" fill="#e0a94a" />
          <rect x="8" y="19" width="8" height="2" rx="0.6" fill="#8a8578" />
        </>
      );
    case 'turnstile':
      return (
        <>
          <rect x="2.5" y="3" width="1.8" height="18" fill="#6b7280" />
          <rect x="19.7" y="3" width="1.8" height="18" fill="#6b7280" />
          <circle cx="12" cy="12" r="1.6" fill="#4b5160" />
          <path d="M12 12 L12 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M12 12 L17 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M12 12 L7 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </>
      );
    case 'clock':
      return (
        <>
          <circle cx="12" cy="12" r="8.5" fill="#f4ede2" stroke="currentColor" strokeWidth="1.3" />
          <path d="M12 12 L12 7" stroke="#2a2a2a" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M12 12 L15.5 13.5" stroke="#2a2a2a" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="12" cy="12" r="1" fill="#2a2a2a" />
        </>
      );
    case 'sarcophagus':
      return (
        <>
          <rect x="4" y="5" width="16" height="16" rx="3" fill="#c9a06b" stroke="#8a5a3a" strokeWidth="1" />
          <ellipse cx="12" cy="9.5" rx="4.3" ry="3.4" fill="#e8c9a0" />
          <path d="M8.2 9 C8.2 7 9.6 6 12 6 C14.4 6 15.8 7 15.8 9" stroke="#3f2f22" strokeWidth="0.9" fill="none" />
          <rect x="6" y="14" width="12" height="1.4" fill="#e0a94a" />
          <rect x="6" y="18" width="12" height="1.4" fill="#e0a94a" />
        </>
      );
    case 'canopicJar':
      return (
        <>
          <path d="M8 9 C8 7 9.5 6 12 6 C14.5 6 16 7 16 9 L15 20 H9 Z" fill="#e8dfd0" />
          <ellipse cx="12" cy="6" rx="3" ry="2" fill="#c9a06b" />
          <rect x="9.5" y="11" width="5" height="1.3" fill="#5a8fc9" />
          <rect x="9.5" y="14.5" width="5" height="1.3" fill="#5a8fc9" />
        </>
      );
    case 'torch':
      return (
        <>
          <rect x="10.8" y="10" width="2.4" height="11" fill="#8a5a3a" />
          <path d="M12 10 C9 7 9.5 4 12 2 C14.5 4 15 7 12 10 Z" fill="#e0a94a" />
          <path d="M12 8.3 C10.6 6.5 11 5 12 3.5 C13 5 13.4 6.5 12 8.3 Z" fill="#c9536b" />
        </>
      );
    case 'goldStatue':
      return (
        <>
          <rect x="5" y="17" width="14" height="4" rx="0.8" fill="#8a7454" />
          <path d="M8 17 C8 10 9.5 6 12 6 C14.5 6 16 10 16 17 Z" fill="#e0c25a" />
          <circle cx="12" cy="5" r="2.4" fill="#e0c25a" />
          <path d="M9.5 5 L8 2.5 M14.5 5 L16 2.5" stroke="#c9a06b" strokeWidth="1.2" strokeLinecap="round" />
        </>
      );
    case 'stela':
      return (
        <>
          <path d="M6 21 L6 5 C6 3.5 7 2.5 8.5 2.5 H15.5 C17 2.5 18 3.5 18 5 V21 Z" fill="#c9a06b" />
          <rect x="8.5" y="6" width="7" height="2" fill="#8a5a3a" />
          <circle cx="10.5" cy="11" r="1" fill="#8a5a3a" />
          <rect x="13" y="10" width="2" height="2" fill="#8a5a3a" />
          <path d="M9 15 L15 15" stroke="#8a5a3a" strokeWidth="1" />
          <path d="M9 17.5 L15 17.5" stroke="#8a5a3a" strokeWidth="1" />
        </>
      );
    case 'airlock':
      return (
        <>
          <circle cx="12" cy="12" r="9.5" fill="#6b7280" />
          <circle cx="12" cy="12" r="9.5" fill="none" stroke="#3a3f4a" strokeWidth="1.2" />
          <circle cx="12" cy="12" r="6.5" fill="#4b5160" />
          <circle cx="12" cy="12" r="4" fill="#7cc9e8" opacity="0.8" />
          <circle cx="12" cy="12" r="4" fill="none" stroke="#2f333d" strokeWidth="1" />
          <circle cx="12" cy="4" r="1" fill="#e0a94a" />
          <circle cx="20" cy="12" r="1" fill="#e0a94a" />
          <circle cx="12" cy="20" r="1" fill="#e0a94a" />
          <circle cx="4" cy="12" r="1" fill="#e0a94a" />
        </>
      );
    case 'satelliteDish':
      return (
        <>
          <path
            d="M4 13 C4 8 8 5 13 5 C13.6 5 13.8 5.8 13.3 6.1 C9.4 8.3 6.8 11.2 6.3 14.4 C6.2 15 5.4 15.1 5.1 14.6 Z"
            fill="#b0aca2"
            stroke="#6b7280"
            strokeWidth="0.8"
          />
          <path d="M13 5 L17 12" stroke="#6b7280" strokeWidth="1" strokeLinecap="round" />
          <circle cx="17" cy="12" r="1.2" fill="#e0a94a" />
          <rect x="11" y="14" width="2" height="7" fill="#8a8f9c" />
          <path d="M6 21 L18 21" stroke="#5a5f6b" strokeWidth="1.4" strokeLinecap="round" />
        </>
      );
    case 'cryopod':
      return (
        <>
          <rect x="5" y="2" width="14" height="20" rx="3" fill="#8a8f9c" />
          <rect x="6.5" y="3.5" width="11" height="17" rx="2.2" fill="#4b5160" />
          <ellipse cx="12" cy="11" rx="4" ry="6.5" fill="#7cc9e8" opacity="0.75" />
          <ellipse cx="12" cy="11" rx="4" ry="6.5" fill="none" stroke="#2f333d" strokeWidth="0.8" />
          <circle cx="12" cy="19" r="1" fill="#6bb88a" />
        </>
      );
    case 'examTable':
      return (
        <>
          <rect x="3" y="11.5" width="18" height="6" rx="1.5" fill="#eaf3f0" />
          <rect x="3" y="8.5" width="6" height="4" rx="1.3" fill="#d7ebe3" />
          <rect x="3" y="8.5" width="6" height="1.3" fill="#c3ddd2" />
          <path d="M5 17.5 L4.4 21" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M19 17.5 L19.6 21" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M8 17.5 L7.6 21" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M16 17.5 L16.4 21" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </>
      );
    case 'medicineCabinet':
      return (
        <>
          <rect x="4" y="2.5" width="16" height="19" rx="1.2" fill="#eef2f0" stroke="currentColor" strokeWidth="1" />
          <line x1="12" y1="4" x2="12" y2="20.5" stroke="currentColor" strokeWidth="1" />
          <circle cx="10.6" cy="15" r="0.6" fill="#8a958f" />
          <circle cx="13.4" cy="15" r="0.6" fill="#8a958f" />
          <rect x="10.9" y="6" width="2.2" height="7" fill="#d9524a" />
          <rect x="8.4" y="8.5" width="7.2" height="2.2" fill="#d9524a" />
        </>
      );
    case 'horse':
      return (
        <>
          <ellipse cx="10.5" cy="12.5" rx="6.2" ry="3.5" fill="#b08154" />
          <path d="M8 9.6 C10 9 13 9.2 14.8 10.4 L14.2 12.2 C12.4 11.2 10.2 11.2 8.4 12 Z" fill="#c9536b" />
          <path d="M14.5 10.5 L17 5.5 L19.8 6.2 L19.5 8.5 L17.5 11.5 Z" fill="#b08154" />
          <path d="M17 5.5 L17.2 3.8 L18.4 5 Z" fill="#8a5a3a" />
          <circle cx="18.2" cy="6.6" r="0.5" fill="#3f2f22" />
          <path d="M4.5 11 C3 11.5 2.5 13 3 15 C4 13.8 4.6 13.4 5.5 13.2 Z" fill="#8a5a3a" />
          <path d="M6.5 15.5 L6 20.5 M9.5 15.8 L9.5 20.5 M12.5 15.8 L13 20.5" stroke="#8a5a3a" strokeWidth="1.4" strokeLinecap="round" />
        </>
      );
    case 'cactus':
      return (
        <>
          <path d="M12 21 L12 6" stroke="#4f9a5c" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M12 12.5 L9.2 12.5 L9.2 9.5" fill="none" stroke="#4f9a5c" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 15 L14.8 15 L14.8 12" fill="none" stroke="#4f9a5c" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
    case 'wagon':
      return (
        <>
          <path d="M3 8 L21 8 L18.5 15 L5.5 15 Z" fill="#c9a06b" />
          <path d="M4.5 8 C7 3.5 17 3.5 19.5 8 Z" fill="#e8c9a0" />
          <path d="M8.5 7.8 L9.5 4.6 M12 7.8 L12 3.9 M15.5 7.8 L14.5 4.6" stroke="#a9764f" strokeWidth="0.9" strokeLinecap="round" />
          <circle cx="7.5" cy="18.5" r="2.6" fill="none" stroke="#8a5a3a" strokeWidth="1.3" />
          <circle cx="16.5" cy="18.5" r="2.6" fill="none" stroke="#8a5a3a" strokeWidth="1.3" />
          <circle cx="7.5" cy="18.5" r="0.7" fill="#8a5a3a" />
          <circle cx="16.5" cy="18.5" r="0.7" fill="#8a5a3a" />
        </>
      );
    case 'trough':
      return (
        <>
          <path d="M4 9 L20 9 L18 17 L6 17 Z" fill="#a9764f" />
          <path d="M4.6 9.8 L19.4 9.8 L19 12 L5 12 Z" fill="#7cc9e8" opacity="0.85" />
          <path d="M6.5 17 L5.5 20.5 M17.5 17 L18.5 20.5" stroke="#8a5a3a" strokeWidth="1.3" strokeLinecap="round" />
        </>
      );
    case 'goal':
      return (
        <>
          <path d="M3 6.5 L3 17.5 M21 6.5 L21 17.5 M3 6.5 L21 6.5" stroke="#e8e5df" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M5.5 9 L18.5 9 M5.5 12 L18.5 12 M5.5 15 L18.5 12 M5.5 12 L18.5 15 M8 9 L8 17.5 M12 9 L12 17.5 M16 9 L16 17.5 M5.5 15 L18.5 15 M5.5 9 L5.5 15 M18.5 9 L18.5 15" stroke="#8a857c" strokeWidth="0.7" strokeLinejoin="round" />
          <path d="M3 17.5 L21 17.5" stroke="#e8e5df" strokeWidth="1.6" strokeLinecap="round" />
        </>
      );
    case 'ball':
      return (
        <>
          <circle cx="12" cy="12" r="9" fill="#f4f2ec" stroke="currentColor" strokeWidth="1.2" />
          <path d="M12 8.2 L15.4 10.7 L14.1 14.7 L9.9 14.7 L8.6 10.7 Z" fill="#2f2f2f" />
          <path d="M12 8.2 L12 4 M15.4 10.7 L19.8 9.3 M14.1 14.7 L16.9 18.1 M9.9 14.7 L7.1 18.1 M8.6 10.7 L4.2 9.3" stroke="#2f2f2f" strokeWidth="1" />
        </>
      );
    case 'seat':
      return (
        <>
          <rect x="7" y="4" width="10" height="9" rx="1.6" fill="#c94f4f" />
          <rect x="6" y="11" width="12" height="5" rx="1.6" fill="#a83d3d" />
          <path d="M8.5 16 L8.5 20 M15.5 16 L15.5 20" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </>
      );
    case 'treadmill':
      return (
        <>
          <path d="M5 17 L7 11 L17 11 L19 17 Z" fill="#5f6672" />
          <path d="M6.3 15.5 L7.8 12.5 L16.2 12.5 L17.7 15.5 Z" fill="#9aa3b2" />
          <path d="M5.5 17.5 L4.5 20.5 M18.5 17.5 L19.5 20.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M7 11 L7 5.5 M17 11 L17 5.5 M7 5.5 L17 5.5" stroke="#4b5160" strokeWidth="1.4" strokeLinecap="round" fill="none" />
          <rect x="14" y="3.2" width="5" height="2.4" rx="0.8" fill="#3b4350" />
        </>
      );
    case 'exerciseBike':
      return (
        <>
          <circle cx="9" cy="15" r="4.2" fill="none" stroke="#4b5160" strokeWidth="1.6" />
          <circle cx="9" cy="15" r="1.1" fill="#4b5160" />
          <path d="M9 15 L15 8.5 M13.2 15 L9 15" stroke="#4b5160" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M12.8 15.6 L16.5 18.5 M16.5 18.5 L18 20.5 M16.5 18.5 L15 20.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M13.5 8 L15.5 5.5 M15.5 5.5 L18.5 5 M15.5 5.5 L15.5 4" stroke="#4b5160" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="11.4" y="6.6" width="4.4" height="1.9" rx="0.9" fill="#c94f4f" />
        </>
      );
    case 'hurdle':
      return (
        <>
          <path d="M4 7.5 L20 7.5 M4 12 L20 12" stroke="#e8b64c" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M5.5 6 L5.5 18 M18.5 6 L18.5 18" stroke="#8a857c" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M5.5 15 L5.5 15.01" stroke="currentColor" strokeWidth="1.5" />
          <path d="M4.5 18 L7.5 15.5 M19.5 18 L16.5 15.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <rect x="5" y="4.5" width="1" height="3" rx="0.5" fill="#8a857c" />
          <rect x="18" y="4.5" width="1" height="3" rx="0.5" fill="#8a857c" />
        </>
      );
    case 'table':
      return (
        <>
          <rect x="3" y="8" width="18" height="5" rx="1.2" fill="#dcb489" />
          <rect x="3.5" y="8.8" width="17" height="1.8" rx="0.9" fill="#e8c9a0" />
          <path d="M5.5 13 L4.5 20 M18.5 13 L19.5 20 M12 13 L12 20" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </>
      );
    case 'basketball':
      return (
        <>
          <circle cx="12" cy="12" r="9" fill="#e07b39" stroke="#b3552f" strokeWidth="1.1" />
          <path d="M12 3 V21 M3 12 H21" stroke="#2a2a2a" strokeWidth="1" />
          <path d="M5.6 5.6 C9 9 9 15 5.6 18.4 M18.4 5.6 C15 9 15 15 18.4 18.4" stroke="#2a2a2a" strokeWidth="1" fill="none" />
        </>
      );
    case 'toilet':
      return (
        <>
          <path d="M6 4.5 H18 L17.2 9.5 C17 11 15.8 12 14.3 12 H9.7 C8.2 12 7 11 6.8 9.5 Z" fill="#f4f2ec" stroke="currentColor" strokeWidth="0.9" />
          <ellipse cx="12" cy="16.8" rx="6.5" ry="2.6" fill="#f4f2ec" stroke="currentColor" strokeWidth="0.9" />
          <path d="M8.5 12 V14.5 M15.5 12 V14.5" stroke="#b3aea6" strokeWidth="1.4" />
          <circle cx="12" cy="7" r="0.8" fill="#b3aea6" />
        </>
      );
    case 'camera':
      return (
        <>
          <rect x="8.5" y="6.5" width="9" height="6.5" rx="1.6" fill="#5f6672" />
          <circle cx="13" cy="9.7" r="2" fill="#9aa3b2" stroke="currentColor" strokeWidth="0.7" />
          <circle cx="13" cy="9.7" r="0.8" fill="#3b4350" />
          <path d="M8.5 8.5 L5.5 7.2 L5.5 12.3 L8.5 11" fill="#5f6672" />
          <path d="M13 13 L13 17 M13 17 L9.5 20.5 M13 17 L16.5 20.5 M13 17 L13 20.5" stroke="#8a857c" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="18.6" cy="7.2" r="0.7" fill="#d9524a" />
        </>
      );
    case 'toolbox':
      return (
        <>
          <rect x="3.5" y="9" width="17" height="9.5" rx="1.4" fill="#c9536b" />
          <rect x="3.5" y="9" width="17" height="2.6" rx="1.3" fill="#a83d53" />
          <path d="M9 9 V7.2 C9 6.4 9.6 5.8 10.4 5.8 H13.6 C14.4 5.8 15 6.4 15 7.2 V9" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <rect x="10.8" y="10.6" width="2.4" height="2.4" rx="0.5" fill="#e0a94a" />
          <path d="M6 15.5 H18" stroke="#a83d53" strokeWidth="1.4" strokeLinecap="round" />
        </>
      );
    case 'bathtub':
      return (
        <>
          <path d="M4 10.5 H20 V16 C20 17.6 18.6 19 17 19 H7 C5.4 19 4 17.6 4 16 Z" fill="#e9f1f6" />
          <path d="M4 10.5 H20 V13 H4 Z" fill="#b9d4e4" />
          <path d="M5.5 10.5 V6.5 C5.5 5.1 6.6 4 8 4 C9.4 4 10.5 5.1 10.5 6.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M6.5 19.5 L5.5 21" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M17.5 19.5 L18.5 21" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="8.2" cy="15.3" r="0.8" fill="#8fb7cc" />
          <circle cx="12" cy="15.8" r="0.8" fill="#8fb7cc" />
        </>
      );
    case 'jacuzzi':
      return (
        <>
          <path d="M3.5 10 H20.5 V15.5 C20.5 17.4 18.9 19 17 19 H7 C5.1 19 3.5 17.4 3.5 15.5 Z" fill="#cfe7f0" />
          <path d="M3.5 10 H20.5 V12.8 H3.5 Z" fill="#8fc3d8" />
          <circle cx="8" cy="15" r="1.1" fill="none" stroke="#ffffff" strokeWidth="0.9" />
          <circle cx="12" cy="16.2" r="1.1" fill="none" stroke="#ffffff" strokeWidth="0.9" />
          <circle cx="16" cy="15" r="1.1" fill="none" stroke="#ffffff" strokeWidth="0.9" />
          <path d="M6 8.5 L6 6" stroke="#b9e0f0" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M12 8.2 L12 5.6" stroke="#b9e0f0" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M18 8.5 L18 6" stroke="#b9e0f0" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M6 21 L6.6 19.4 M18 21 L17.4 19.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </>
      );
    case 'tv':
      return (
        <>
          <rect x="3.5" y="6" width="17" height="11" rx="1.6" fill="#2e3440" />
          <rect x="5" y="7.5" width="14" height="8" rx="0.8" fill="#5a8db8" />
          <path d="M8.5 7.5 L12.5 15.5 M12.5 7.5 L16.5 15.5" stroke="#7fb0d8" strokeWidth="1" />
          <path d="M12 17 V19.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M8.5 19.8 H15.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </>
      );
    case 'floorLamp':
      return (
        <>
          <path d="M8.5 4.5 H15.5 L17 9 H7 Z" fill="#e8c970" />
          <path d="M7 9 H17 V10.5 H7 Z" fill="#c9a53f" />
          <path d="M12 10.5 V18.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M12 18.5 L8.5 21 M12 18.5 L15.5 21 M12 18.5 V21" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M9.5 6.5 L10.5 8 M14.5 6.5 L13.5 8" stroke="#f5e4a8" strokeWidth="0.9" strokeLinecap="round" />
        </>
      );
    case 'keyBox':
      return (
        <>
          <rect x="3.5" y="5" width="17" height="14" rx="1.4" fill="#b98d5e" />
          <rect x="3.5" y="5" width="17" height="2.4" fill="#9c7248" />
          <path d="M10.5 5 V19" stroke="#9c7248" strokeWidth="1.2" />
          <circle cx="7" cy="10.5" r="0.6" fill="#e0c89a" />
          <circle cx="7" cy="14" r="0.6" fill="#e0c89a" />
          <circle cx="7" cy="17.5" r="0.6" fill="#e0c89a" />
          <path d="M14 9 V16" stroke="#e0c89a" strokeWidth="1.1" />
          <circle cx="14" cy="8" r="1.2" fill="none" stroke="#e0c89a" strokeWidth="1.1" />
          <circle cx="17" cy="8" r="1.2" fill="none" stroke="#e0c89a" strokeWidth="1.1" />
          <path d="M17 9 V16" stroke="#e0c89a" strokeWidth="1.1" />
        </>
      );
    case 'journal':
      return (
        <>
          <rect x="5" y="3.5" width="14.5" height="17" rx="1.2" fill="#a06a3a" />
          <rect x="6.8" y="3.5" width="12.7" height="17" rx="1" fill="#f2ead9" />
          <path d="M6.8 5 H19.5 M6.8 7.5 H19.5 M6.8 10 H16.5 M6.8 12.5 H17.5 M6.8 15 H15" stroke="#8a7350" strokeWidth="0.9" strokeLinecap="round" />
          <rect x="5" y="3.5" width="14.5" height="17" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.1" />
          <path d="M9.5 17.5 H16.5" stroke="#a06a3a" strokeWidth="1.6" strokeLinecap="round" />
        </>
      );
    case 'palm':
      return (
        <>
          <path d="M13.5 21 C13 16 12.5 12 11 8.5" stroke="#8a6642" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M11 8.5 C9 6.5 6.5 6.3 4.5 7.5 C6.8 7.8 8.5 8.6 9.8 10" fill="#5fa85a" />
          <path d="M11 8.5 C12.8 6.2 15.6 5.8 17.8 7 C15.4 7.4 13.6 8.4 12.2 10" fill="#5fa85a" />
          <path d="M11 8.5 C10.6 5.9 12 3.8 14.4 3 C13.2 5 12.8 6.7 13 8.6" fill="#6fbb63" />
          <path d="M11 8.5 C8.6 8.3 6.6 9.7 5.8 12 C7.6 10.5 9.3 9.8 11 10" fill="#4e9450" />
          <path d="M11 8.5 C13.4 8.6 15.3 10.1 16 12.4 C14.3 10.7 12.6 10 11 9.8" fill="#4e9450" />
          <circle cx="10.2" cy="9.4" r="0.9" fill="#8a5a33" />
          <circle cx="12" cy="9.6" r="0.9" fill="#8a5a33" />
        </>
      );
    case 'rock':
      return (
        <>
          <path d="M5 19 L7 10.5 L11 8 L15.5 9 L19.5 13.5 L19 19 Z" fill="#9a9690" />
          <path d="M7 10.5 L11 8 L13 11 L11.5 19 L5 19 Z" fill="#8a867e" />
          <path d="M13 11 L15.5 9 L19.5 13.5 L19 19 L11.5 19 Z" fill="#a8a49c" />
          <path d="M9 13.5 L11 12.5 M14.5 14 L16.5 13" stroke="#787470" strokeWidth="0.9" strokeLinecap="round" />
        </>
      );
    case 'coconut':
      return (
        <>
          <circle cx="12" cy="13.5" r="7" fill="#8a5a33" />
          <circle cx="12" cy="13.5" r="7" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <path d="M8.5 9.5 C9.5 8 10.5 7.2 12 6.8" stroke="#a8754a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <circle cx="10" cy="11.5" r="1.3" fill="#5a3a20" />
          <circle cx="13.8" cy="12.2" r="1.3" fill="#5a3a20" />
          <circle cx="11.8" cy="15.6" r="1.3" fill="#5a3a20" />
        </>
      );
    case 'hammock':
      return (
        <>
          <path d="M3.5 4.5 L4.5 19.5" stroke="#8a6642" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M20.5 4.5 L19.5 19.5" stroke="#8a6642" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M4.2 10 C8 14.5 16 14.5 19.8 10" fill="#e3c46a" stroke="#c9a53f" strokeWidth="1" />
          <path d="M4.2 10 C8 14.5 16 14.5 19.8 10" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <path d="M6.5 10.8 H17.5" stroke="#c9a53f" strokeWidth="0.9" strokeLinecap="round" />
          <path d="M5.5 7.2 L4.6 9.8 M18.5 7.2 L19.4 9.8" stroke="#c9536b" strokeWidth="1" strokeLinecap="round" />
        </>
      );
    case 'hut':
      return (
        <>
          <path d="M12 3.5 L20.5 12 H3.5 Z" fill="#c9a56b" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M12 3.5 L16.2 8.2 L7.8 8.2 Z" fill="#a8814a" />
          <path d="M6 12 H18 V19.5 H6 Z" fill="#b98d5e" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M8.5 12 V19.5 M12 12 V19.5 M15.5 12 V19.5" stroke="#9c7248" strokeWidth="0.8" />
          <path d="M10 19.5 V15.5 C10 14.4 10.9 13.5 12 13.5 C13.1 13.5 14 14.4 14 15.5 V19.5" fill="#5a4636" />
          <path d="M3.5 12 H20.5" stroke="currentColor" strokeWidth="1.2" />
        </>
      );
    case 'bottle':
      return (
        <>
          <path d="M10.5 3.5 H13.5 V6.5 C13.5 7.5 14.2 8 15 8.8 C16.2 10 17 11.3 17 13 V18.5 C17 19.6 16.1 20.5 15 20.5 H9 C7.9 20.5 7 19.6 7 20.5 V18.5 L7 13 C7 11.3 7.8 10 9 8.8 C9.8 8 10.5 7.5 10.5 6.5 Z" fill="#bcd9e8" opacity="0.9" />
          <rect x="10" y="2.5" width="4" height="2" rx="0.6" fill="#a06a3a" />
          <path d="M8 13.5 H16" stroke="#8fb7cc" strokeWidth="0.9" />
          <rect x="8.8" y="15" width="6.4" height="4.2" rx="0.5" fill="#f2ead9" />
          <path d="M9.8 16.2 H14.2 M9.8 17.4 H13" stroke="#8a7350" strokeWidth="0.7" strokeLinecap="round" />
        </>
      );
    case 'shell':
      return (
        <>
          <path d="M12 20.5 C7.5 20.5 4 16.5 4 11.5 C4 7 6.5 3.8 12 3.5 C17.5 3.8 20 7 20 11.5 C20 16.5 16.5 20.5 12 20.5 Z" fill="#f0d9c9" stroke="currentColor" strokeWidth="1.2" />
          <path d="M12 20.5 L12 3.5 M12 20.5 L7 5.5 M12 20.5 L16.5 5.5 M12 20.5 L4.5 10 M12 20.5 L19.5 10" stroke="#d9b8a3" strokeWidth="0.9" strokeLinecap="round" />
          <path d="M8.5 17.5 C7 16 6.2 14 6.2 11.8 M15.5 17.5 C17 16 17.8 14 17.8 11.8" stroke="#d9b8a3" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        </>
      );
    case 'lamp':
      return (
        <>
          <path d="M12 3.5 V6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M7.5 9 C7.5 7.3 9 6 12 6 C15 6 16.5 7.3 16.5 9 Z" fill="#e8c970" stroke="#c9a53f" strokeWidth="1" />
          <circle cx="12" cy="12" r="3.2" fill="#f5e4a8" stroke="#e0a94a" strokeWidth="1.1" />
          <path d="M8.8 12 L5.5 9.5 M15.2 12 L18.5 9.5 M8.8 14.5 L6 15.5 M15.2 14.5 L18 15.5 M9.6 10.5 L8 8.2 M14.4 10.5 L16 8.2" stroke="#e8c970" strokeWidth="1" strokeLinecap="round" />
          <path d="M8 16.5 H16 L17 20.5 H7 Z" fill="#8a857c" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
        </>
      );
    case 'boat':
      return (
        <>
          <path d="M3 14.5 H21 L18.5 19 H5.5 Z" fill="#b3552f" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M3.5 14.5 L20.5 14.5 L19.8 16 H4.2 Z" fill="#8a3d20" />
          <path d="M12 3 V13.5" stroke="#8a6642" strokeWidth="1.4" />
          <path d="M12.6 3.6 L12.6 13 H19.5 C17.5 9.5 15.3 6 12.6 3.6 Z" fill="#f2ead9" stroke="#d9cdb5" strokeWidth="0.8" />
          <path d="M11.4 5.5 L11.4 13 H6.5 C7.8 10.3 9.5 7.6 11.4 5.5 Z" fill="#f2ead9" stroke="#d9cdb5" strokeWidth="0.8" />
          <path d="M5 21 L4 22.5 M19 21 L20 22.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </>
      );
    case 'berth':
      return (
        <>
          <path d="M4 4.5 H20" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M4.8 4.5 V19.5 M19.2 4.5 V19.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          <rect x="5.6" y="6.5" width="12.8" height="4.5" rx="1" fill="#c9536b" stroke="#8a3a4e" strokeWidth="0.9" />
          <rect x="5.6" y="6.5" width="12.8" height="1.6" rx="0.8" fill="#e08aa0" />
          <rect x="5.6" y="13" width="12.8" height="4.5" rx="1" fill="#4d8dff" stroke="#3a5f9e" strokeWidth="0.9" />
          <rect x="5.6" y="13" width="12.8" height="1.6" rx="0.8" fill="#8ab2ff" />
        </>
      );
    case 'samovar':
      return (
        <>
          <ellipse cx="12" cy="19.5" rx="5.5" ry="1.6" fill="#8a857c" />
          <path d="M8 9 C8 6 9.5 4.5 12 4.5 C14.5 4.5 16 6 16 9 C16 13 15 15.5 14 17.5 H10 C9 15.5 8 13 8 9 Z" fill="#e0a94a" stroke="#a3762a" strokeWidth="1.1" />
          <rect x="9.6" y="17.5" width="4.8" height="2" fill="#c98f38" stroke="#a3762a" strokeWidth="0.9" />
          <path d="M12 2 V4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M6.5 9 C5.2 9.8 5 11.5 6 12.8 M17.5 9 C18.8 9.8 19 11.5 18 12.8" stroke="#e0a94a" strokeWidth="1.1" fill="none" strokeLinecap="round" />
          <path d="M10 7.5 C11 6.8 13 6.8 14 7.5" stroke="#f5df9e" strokeWidth="1" fill="none" strokeLinecap="round" />
        </>
      );
    case 'luggageRack':
      return (
        <>
          <path d="M4.5 5.5 H19.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M5.5 5.5 V19 M18.5 5.5 V19" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <rect x="6.5" y="8.5" width="4.6" height="6.5" rx="0.8" fill="#a06a3a" stroke="#7a4e28" strokeWidth="0.9" />
          <path d="M7.4 10.2 H10.2 M7.4 11.6 H10.2" stroke="#7a4e28" strokeWidth="0.8" strokeLinecap="round" />
          <rect x="12.6" y="7.5" width="4.6" height="7.5" rx="0.8" fill="#c9536b" stroke="#8a3a4e" strokeWidth="0.9" />
          <path d="M13.5 9.4 H16.3 M13.5 10.8 H16.3" stroke="#8a3a4e" strokeWidth="0.8" strokeLinecap="round" />
        </>
      );
    case 'throne':
      return (
        <>
          <path d="M7 21 V9 C7 5.5 9 4 12 4 C15 4 17 5.5 17 9 V21" fill="#c9536b" stroke="#8a3a4e" strokeWidth="1.1" />
          <rect x="6" y="12" width="12" height="9" rx="1" fill="#a33a52" stroke="#7a2f42" strokeWidth="1" />
          <path d="M9 6.5 C9.5 5.5 10.5 5 12 5 C13.5 5 14.5 5.5 15 6.5" stroke="#e0a94a" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          <circle cx="12" cy="6.8" r="1.1" fill="#e0c25a" stroke="#a3762a" strokeWidth="0.8" />
          <path d="M6 21 H18" stroke="#8a5a3a" strokeWidth="1.4" strokeLinecap="round" />
        </>
      );
    case 'candleStand':
      return (
        <>
          <path d="M12 7 V19" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <ellipse cx="12" cy="20" rx="3.5" ry="1.4" fill="#8a857c" stroke="currentColor" strokeWidth="0.9" />
          <rect x="11" y="4.5" width="2" height="3" fill="#f2ead9" stroke="#d9cdb5" strokeWidth="0.7" />
          <path d="M12 1.8 C12.7 2.6 12.7 3.4 12 4.2 C11.3 3.4 11.3 2.6 12 1.8 Z" fill="#e8c970" stroke="#c9a53f" strokeWidth="0.7" />
          <path d="M7 10.5 C6.2 11.2 6.2 12 7 12.8 M17 10.5 C17.8 11.2 17.8 12 17 12.8 M7 14.5 C6.2 15.2 6.2 16 7 16.8 M17 14.5 C17.8 15.2 17.8 16 17 16.8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </>
      );
    case 'armorStand':
      return (
        <>
          <path d="M12 3.5 C13.2 3.5 14 4.4 14 5.5 V12 H10 V5.5 C10 4.4 10.8 3.5 12 3.5 Z" fill="#aeb6c2" stroke="currentColor" strokeWidth="1" />
          <path d="M8 8 C6.5 9 6 11 6.5 13.5 M16 8 C17.5 9 18 11 17.5 13.5" stroke="#aeb6c2" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <circle cx="12" cy="2.6" r="1.1" fill="#8a857c" stroke="currentColor" strokeWidth="0.7" />
          <path d="M9 12 H15 L14 15.5 H10 Z" fill="#8f97a3" stroke="currentColor" strokeWidth="0.9" />
          <path d="M12 15.5 V19" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M8.5 20.5 H15.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </>
      );
    case 'weaponRack':
      return (
        <>
          <path d="M5 4.5 H19" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M5.5 4.5 V19.5 M18.5 4.5 V19.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M8 4.5 L8 17" stroke="#8a6642" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M12 4.5 L12 18.5" stroke="#8a6642" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M16 4.5 L16 17" stroke="#8a6642" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M7 17 L9 17 M11 18.5 L13 18.5 M15 17 L17 17" stroke="#b3552f" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M11.3 4.5 L12.7 4.5 L12.7 3.2 L11.3 3.2 Z" fill="#b3552f" />
        </>
      );
    case 'well':
      return (
        <>
          <ellipse cx="12" cy="16" rx="7.5" ry="3" fill="#8a857c" stroke="currentColor" strokeWidth="1.1" />
          <ellipse cx="12" cy="15" rx="7.5" ry="3" fill="#a9a49a" stroke="currentColor" strokeWidth="1.1" />
          <ellipse cx="12" cy="15" rx="4" ry="1.5" fill="#3a5f7a" stroke="currentColor" strokeWidth="0.8" />
          <path d="M5.5 14.5 V6 M18.5 14.5 V6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M4 6 H20" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M12 6 V10" stroke="#8a6642" strokeWidth="1.1" />
          <rect x="10.4" y="10" width="3.2" height="2.6" rx="0.5" fill="#a06a3a" stroke="#7a4e28" strokeWidth="0.8" />
        </>
      );
    case 'ferrisWheel':
      return (
        <>
          <path d="M12 4.5 V19" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M4.5 12 H19.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          <path d="M6.7 6.7 L17.3 17.3 M17.3 6.7 L6.7 17.3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          <circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M12 4.5 L8.4 8 L12 11.5 L15.6 8 Z M12 11.5 L8.4 15 L12 18.5 L15.6 15 Z M12 11.5 L8.4 8 M12 11.5 L15.6 8 M12 11.5 L8.4 15 M12 11.5 L15.6 15" stroke="#c9536b" strokeWidth="1" fill="none" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="1.6" fill="#e0a94a" stroke="currentColor" strokeWidth="0.9" />
          <path d="M4.5 12 L2.5 13.5 M4.5 12 L3 10 M19.5 12 L21 13.5 M19.5 12 L21.5 10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          <path d="M8 19 H16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </>
      );
    case 'carousel':
      return (
        <>
          <ellipse cx="12" cy="18.5" rx="7.5" ry="2.2" fill="#e8c9a0" stroke="currentColor" strokeWidth="1" />
          <path d="M12 3 L12 17.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M12 3 L8.5 7 H12 Z M12 3 L15.5 7 H12 Z" fill="#c9536b" stroke="#8a3a4e" strokeWidth="0.7" />
          <path d="M6 9 C6 6.5 8.5 5.5 12 5.5 C15.5 5.5 18 6.5 18 9 Z" fill="#e0a94a" stroke="#a3762a" strokeWidth="0.9" />
          <path d="M6 9 H18 V16.5 C18 17.5 17 18 16 18 H8 C7 18 6 17.5 6 16.5 Z" fill="#4d8dff" opacity="0.35" stroke="currentColor" strokeWidth="1" />
          <path d="M8.5 9 V17.5 M12 9 V17.5 M15.5 9 V17.5" stroke="#c9536b" strokeWidth="0.9" />
          <rect x="8" y="11" width="3" height="4" rx="0.8" fill="#f2ead9" stroke="#d9cdb5" strokeWidth="0.7" />
          <rect x="13" y="11" width="3" height="4" rx="0.8" fill="#f2ead9" stroke="#d9cdb5" strokeWidth="0.7" />
        </>
      );
    case 'slide':
      return (
        <>
          <path d="M4.5 4.5 H9 V9 H4.5 Z" fill="#4d8dff" opacity="0.85" stroke="#3a5f9e" strokeWidth="0.9" />
          <path d="M9 5.5 C14 5.5 18 8 19.5 13.5" stroke="#e0a94a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M9 8 C13 8 16 10 17.5 14" stroke="#c98f38" strokeWidth="0.9" fill="none" strokeLinecap="round" />
          <path d="M19.5 13.5 L20.5 18 H15.5 L17.5 14" fill="#e0a94a" stroke="#a3762a" strokeWidth="0.9" strokeLinejoin="round" />
          <path d="M4.5 9 V18.5 H9" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5.5 11 H8 M5.5 13.5 H8 M5.5 16 H8" stroke="#3a5f9e" strokeWidth="0.8" strokeLinecap="round" />
          <path d="M3 18.5 H21" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </>
      );
    case 'shootingGallery':
      return (
        <>
          <rect x="3.5" y="5" width="17" height="11" rx="1" fill="#8a6642" stroke="currentColor" strokeWidth="1.1" />
          <rect x="3.5" y="5" width="17" height="3" fill="#6e4f31" />
          <path d="M6 10.5 H18 M6 13 H18" stroke="#5a3d24" strokeWidth="0.8" strokeLinecap="round" />
          <circle cx="8" cy="8.8" r="1.2" fill="#f2ead9" stroke="#d9cdb5" strokeWidth="0.6" />
          <circle cx="12.5" cy="11.5" r="1.2" fill="#f2ead9" stroke="#d9cdb5" strokeWidth="0.6" />
          <circle cx="16.5" cy="8.8" r="1.2" fill="#f2ead9" stroke="#d9cdb5" strokeWidth="0.6" />
          <path d="M10 16 L11.5 13 L13 16 Z" fill="#c9536b" stroke="#8a3a4e" strokeWidth="0.6" />
          <path d="M14 16 L15.5 13 L17 16 Z" fill="#c9536b" stroke="#8a3a4e" strokeWidth="0.6" />
          <path d="M12 18.5 C12 20 13.5 21 13.5 21 C13.5 21 15 20 15 18.5 C15 17.7 14.3 17 13.5 17 C12.7 17 12 17.7 12 18.5 Z" fill="#2a2a2a" />
        </>
      );
    case 'popcornStand':
      return (
        <>
          <path d="M6.5 8.5 H17.5 L18.5 20 H5.5 Z" fill="#e8c970" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
          <path d="M7.5 11 H16.5 M7.3 14.5 H16.7 M7.1 17.5 H16.9" stroke="#c9536b" strokeWidth="1.1" strokeLinecap="round" />
          <path d="M6.5 8.5 C6.5 6 8.5 4.5 12 4.5 C15.5 4.5 17.5 6 17.5 8.5" fill="none" stroke="#c9536b" strokeWidth="1.2" />
          <path d="M8.5 8.5 C8.5 7.2 9.8 6.3 12 6.3 C14.2 6.3 15.5 7.2 15.5 8.5" fill="#f5e4a8" stroke="#e0a94a" strokeWidth="0.8" />
          <circle cx="9.8" cy="7.4" r="0.6" fill="#fff" opacity="0.8" />
          <circle cx="12.8" cy="6.9" r="0.6" fill="#fff" opacity="0.8" />
          <path d="M8 20 C8 21 8.5 21.5 9 21.5 M12 20 C12 21 12.5 21.5 13 21.5 M16 20 C16 21 16.5 21.5 17 21.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </>
      );
    case 'plane':
      return (
        <>
          <path d="M12 3.2 L13.2 6.2 L20 10.6 C20.7 11 20.7 11.9 20 12.2 L13.2 13.4 L12.8 17.2 L15 19.2 L14.6 20.3 L12 19.4 L9.4 20.3 L9 19.2 L11.2 17.2 L10.8 13.4 L4 12.2 C3.3 11.9 3.3 11 4 10.6 L10.8 6.2 Z" fill="#e8edf2" stroke="currentColor" strokeWidth="0.9" strokeLinejoin="round" />
          <path d="M12 3.2 L13.2 6.2 L10.8 6.2 Z" fill="#c9536b" stroke="currentColor" strokeWidth="0.6" strokeLinejoin="round" />
          <circle cx="12" cy="10" r="1.1" fill="#4d8dff" stroke="#3a5f9e" strokeWidth="0.6" />
          <path d="M10.8 13.4 L13.2 13.4" stroke="#8a99a8" strokeWidth="0.8" strokeLinecap="round" />
        </>
      );
    case 'windsock':
      return (
        <>
          <path d="M6 3.5 V20" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="6" cy="4" r="1.4" fill="#e0a94a" stroke="#a3762a" strokeWidth="0.8" />
          <path d="M7.5 6 C11 4.8 15 5.2 18 7.2 L16.8 11 C14 9.6 10.5 9.4 8 10.4 Z" fill="#e8642c" stroke="#a8441c" strokeWidth="0.9" strokeLinejoin="round" />
          <path d="M10.6 5.7 L9.9 9.9 M14.2 5.7 L13.4 10" stroke="#a8441c" strokeWidth="0.9" />
          <path d="M16.8 11 C17.4 11.4 17.4 12.2 16.8 12.5 C16.2 12.8 15.4 12.4 15.4 11.7 Z" fill="#f2ead9" stroke="#a8441c" strokeWidth="0.7" />
        </>
      );
    case 'baggageCart':
      return (
        <>
          <path d="M4.5 7.5 H18 V16 H4.5 Z" fill="#4d8dff" opacity="0.28" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
          <path d="M4.5 7.5 H18" stroke="#3a5f9e" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M6.2 7.5 V5 H9 V7.5 M10.6 7.5 V4.4 H13.4 V7.5 M15 7.5 V5.2 H17.4 V7.5" stroke="#8a6642" strokeWidth="1" strokeLinejoin="round" />
          <rect x="5.6" y="9.6" width="5.4" height="3.6" rx="0.6" fill="#8a6642" stroke="#5a3d24" strokeWidth="0.8" />
          <rect x="12.4" y="9.2" width="5" height="4.4" rx="0.6" fill="#c9536b" stroke="#8a3a4e" strokeWidth="0.8" />
          <circle cx="7.5" cy="17.2" r="1.7" fill="#2a2a2a" stroke="currentColor" strokeWidth="0.8" />
          <circle cx="15.5" cy="17.2" r="1.7" fill="#2a2a2a" stroke="currentColor" strokeWidth="0.8" />
          <path d="M7.5 17.2 H15.5" stroke="#2a2a2a" strokeWidth="1.2" />
          <path d="M18 10.5 H20.5 V15" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" fill="none" />
        </>
      );
    case 'lion':
      return (
        <>
          <ellipse cx="12" cy="15" rx="6.5" ry="5.5" fill="#d9a441" stroke="#a3762a" strokeWidth="0.9" />
          <circle cx="12" cy="8.5" r="5.2" fill="#e0a94a" stroke="#a3762a" strokeWidth="0.9" />
          <path d="M7.5 8.5 C7.5 4.8 9.5 3.2 12 3.2 C14.5 3.2 16.5 4.8 16.5 8.5 C16.5 6.5 15.5 5.8 14.5 6.2 C14 5 13 4.6 12 5.4 C11 4.6 10 5 9.5 6.2 C8.5 5.8 7.5 6.5 7.5 8.5 Z" fill="#c98f38" stroke="#a3762a" strokeWidth="0.7" />
          <path d="M8 9.5 C6.5 9 5.5 9.8 5.5 11 M16 9.5 C17.5 9 18.5 9.8 18.5 11" stroke="#c98f38" strokeWidth="1" fill="none" strokeLinecap="round" />
          <circle cx="10.2" cy="8.5" r="0.7" fill="#3a2a1a" />
          <circle cx="13.8" cy="8.5" r="0.7" fill="#3a2a1a" />
          <path d="M11.3 10.5 L12.7 10.5 M12 10.5 V11.5" stroke="#3a2a1a" strokeWidth="0.7" strokeLinecap="round" />
          <path d="M6.5 14 C5 13.5 4 14.5 4.5 16 M17.5 14 C19 13.5 20 14.5 19.5 16" stroke="#a3762a" strokeWidth="1.1" fill="none" strokeLinecap="round" />
          <path d="M12.5 20.5 L12.5 22" stroke="#a3762a" strokeWidth="1" strokeLinecap="round" />
        </>
      );
    case 'giraffe':
      return (
        <>
          <path d="M10 10.5 C10 8.5 8.5 8 7.5 6 L9 4.5 C10.5 5.5 11 7 11 8.5 C11.5 7 12.5 5.5 14 4.5 L15.5 6 C14.5 8 14 8.5 14 10.5 Z" fill="#e0a94a" stroke="#a3762a" strokeWidth="0.8" strokeLinejoin="round" />
          <ellipse cx="12" cy="15.5" rx="6" ry="5" fill="#e8c970" stroke="#a3762a" strokeWidth="0.9" />
          <circle cx="7" cy="5.2" r="1.3" fill="#e0a94a" stroke="#a3762a" strokeWidth="0.7" />
          <circle cx="17" cy="5.2" r="1.3" fill="#e0a94a" stroke="#a3762a" strokeWidth="0.7" />
          <circle cx="7" cy="5.2" r="0.4" fill="#3a2a1a" />
          <circle cx="17" cy="5.2" r="0.4" fill="#3a2a1a" />
          <path d="M9 8.8 L10.2 9.2 M15 8.8 L13.8 9.2" stroke="#a3762a" strokeWidth="0.7" strokeLinecap="round" />
          <path d="M9.5 13.5 h1.6 M13 13.5 h1.6 M10.5 16 h1.6 M13.8 16.5 h1.4 M9.8 18 h1.4" stroke="#c98f38" strokeWidth="1" strokeLinecap="round" />
          <path d="M7 20.5 V22 M17 20.5 V22" stroke="#a3762a" strokeWidth="1.1" strokeLinecap="round" />
        </>
      );
    case 'monkey':
      return (
        <>
          <circle cx="12" cy="9" r="5.5" fill="#9b6b45" stroke="#6e4a2c" strokeWidth="0.9" />
          <ellipse cx="12" cy="10.5" rx="3.6" ry="3" fill="#e8c9a0" stroke="#c9a878" strokeWidth="0.6" />
          <circle cx="10.5" cy="9.3" r="0.8" fill="#3a2a1a" />
          <circle cx="13.5" cy="9.3" r="0.8" fill="#3a2a1a" />
          <path d="M11.2 11.5 Q12 12.2 12.8 11.5" stroke="#3a2a1a" strokeWidth="0.7" fill="none" strokeLinecap="round" />
          <path d="M9.2 7.5 C8.8 5.8 9.8 4.5 11 4.2 M14.8 7.5 C15.2 5.8 14.2 4.5 13 4.2" stroke="#6e4a2c" strokeWidth="0.9" fill="none" strokeLinecap="round" />
          <ellipse cx="12" cy="16.5" rx="5" ry="4" fill="#9b6b45" stroke="#6e4a2c" strokeWidth="0.9" />
          <path d="M8 15.5 C6 16 5.5 18 7 19.5 M16 15.5 C18 16 18.5 18 17 19.5" stroke="#6e4a2c" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <ellipse cx="12" cy="16.5" rx="2.6" ry="2.2" fill="#e8c9a0" opacity="0.85" />
          <path d="M9.8 20.3 L8.5 21.5 M14.2 20.3 L15.5 21.5" stroke="#6e4a2c" strokeWidth="1" strokeLinecap="round" />
        </>
      );
    case 'hippo':
      return (
        <>
          <ellipse cx="12" cy="14" rx="8" ry="6" fill="#8f9aa8" stroke="#5c6878" strokeWidth="0.9" />
          <ellipse cx="12" cy="8" rx="6" ry="4.5" fill="#a3aebc" stroke="#5c6878" strokeWidth="0.9" />
          <ellipse cx="12" cy="8.8" rx="3.8" ry="2.6" fill="#c9a8b8" opacity="0.7" />
          <circle cx="7.6" cy="7.5" r="1.1" fill="#e8c970" stroke="#5c6878" strokeWidth="0.5" />
          <circle cx="16.4" cy="7.5" r="1.1" fill="#e8c970" stroke="#5c6878" strokeWidth="0.5" />
          <circle cx="7.6" cy="7.5" r="0.4" fill="#3a2a1a" />
          <circle cx="16.4" cy="7.5" r="0.4" fill="#3a2a1a" />
          <circle cx="9.8" cy="8.2" r="0.6" fill="#5c6878" />
          <circle cx="14.2" cy="8.2" r="0.6" fill="#5c6878" />
          <path d="M10.5 9.6 Q12 10.6 13.5 9.6" stroke="#5c6878" strokeWidth="0.8" fill="none" strokeLinecap="round" />
          <path d="M5 13 C3.5 12.5 2.8 13.5 3.2 15 M19 13 C20.5 12.5 21.2 13.5 20.8 15" stroke="#5c6878" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M8.5 19.8 L8.5 21.3 M15.5 19.8 L15.5 21.3" stroke="#5c6878" strokeWidth="1.1" strokeLinecap="round" />
        </>
      );
    case 'zebra':
      return (
        <>
          <ellipse cx="12" cy="15" rx="6" ry="5.5" fill="#f2f2f2" stroke="#3a3a3a" strokeWidth="0.9" />
          <path d="M9 11.5 C8.5 13 9 14.5 10 15.5 M12 10.8 C11.5 12.5 12 14 13 15.2 M15 11.5 C14.5 13 15 14.5 16 15.5" stroke="#3a3a3a" strokeWidth="1.1" fill="none" strokeLinecap="round" />
          <path d="M9.5 17.5 C10.5 18 11.5 18 12 17.5 M12.5 18.5 C13.5 19 14.5 18.8 15 18.2" stroke="#3a3a3a" strokeWidth="0.9" fill="none" strokeLinecap="round" />
          <ellipse cx="12" cy="7" rx="4.5" ry="3.5" fill="#f2f2f2" stroke="#3a3a3a" strokeWidth="0.9" />
          <path d="M8.5 6 C8 7 8.5 7.8 9.5 8 M12 3.8 C11.3 4.6 11.5 5.6 12.3 6.2 M15.5 6 C16 7 15.5 7.8 14.5 8" stroke="#3a3a3a" strokeWidth="1" fill="none" strokeLinecap="round" />
          <path d="M9 7.5 C8.2 7.8 8 8.6 8.5 9.3 M15 7.5 C15.8 7.8 16 8.6 15.5 9.3" stroke="#3a3a3a" strokeWidth="0.8" fill="none" strokeLinecap="round" />
          <circle cx="10.5" cy="7" r="0.6" fill="#3a3a3a" />
          <circle cx="13.5" cy="7" r="0.6" fill="#3a3a3a" />
          <path d="M10.8 8.5 L13.2 8.5 M12 8.5 V9.3" stroke="#3a3a3a" strokeWidth="0.6" strokeLinecap="round" />
          <path d="M7.5 16.8 C6 16.5 5.2 17.5 5.8 18.8 M16.5 16.8 C18 16.5 18.8 17.5 18.2 18.8" stroke="#3a3a3a" strokeWidth="1.1" fill="none" strokeLinecap="round" />
          <path d="M9 20.5 V21.8 M15 20.5 V21.8" stroke="#3a3a3a" strokeWidth="1" strokeLinecap="round" />
        </>
      );
    case 'penguin':
      return (
        <>
          <ellipse cx="12" cy="13.5" rx="6" ry="7.5" fill="#37414f" stroke="#20262f" strokeWidth="0.9" />
          <ellipse cx="12" cy="14.5" rx="4" ry="5.5" fill="#f2f2f2" />
          <circle cx="12" cy="7" r="4.2" fill="#37414f" stroke="#20262f" strokeWidth="0.8" />
          <circle cx="10.7" cy="6.7" r="0.7" fill="#fff" />
          <circle cx="13.3" cy="6.7" r="0.7" fill="#fff" />
          <circle cx="10.7" cy="6.8" r="0.35" fill="#20262f" />
          <circle cx="13.3" cy="6.8" r="0.35" fill="#20262f" />
          <path d="M10.8 8.3 C11.3 9.3 12.7 9.3 13.2 8.3 C12.7 10.3 11.3 10.3 10.8 8.3 Z" fill="#e8a13a" stroke="#b5761f" strokeWidth="0.5" />
          <path d="M7 10 C5.5 11.5 5.5 14 6.5 16 M17 10 C18.5 11.5 18.5 14 17.5 16" stroke="#37414f" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M9.5 20.5 C9.5 21.4 10.5 21.4 10.5 20.6 M13.5 20.5 C13.5 21.4 14.5 21.4 14.5 20.6" stroke="#e8a13a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M10 4.2 C10.8 3.4 13.2 3.4 14 4.2" stroke="#20262f" strokeWidth="0.8" fill="none" />
        </>
      );
    case 'clueBoard':
      return (
        <>
          <rect x="2.5" y="3" width="19" height="17.5" rx="1.2" fill="#c9a876" />
          <rect x="4" y="4.5" width="16" height="14.5" rx="0.6" fill="#e6cfa8" />
          <rect x="5.6" y="6.6" width="5.6" height="4" rx="0.5" fill="#f7f3ea" transform="rotate(-6 8.4 8.6)" />
          <rect x="12.6" y="10.2" width="5.6" height="4" rx="0.5" fill="#f7f3ea" transform="rotate(5 15.4 12.2)" />
          <path d="M8.9 7.2 L15.1 11.1" stroke="#d9524a" strokeWidth="0.7" opacity="0.85" />
          <path d="M15.1 11.4 L9.8 16.2" stroke="#d9524a" strokeWidth="0.7" opacity="0.85" />
          <circle cx="8.7" cy="7" r="0.8" fill="#d9524a" />
          <circle cx="15.3" cy="11" r="0.8" fill="#d9524a" />
          <circle cx="9.6" cy="16.4" r="0.8" fill="#5a8fc9" />
          <path d="M6.2 18.4 L18.2 18.4" stroke="currentColor" strokeWidth="0.8" opacity="0.35" />
        </>
      );
    case 'clapperboard':
      return (
        <>
          <path d="M3.5 7 H20.5 V19.5 H3.5 Z" fill="#2a2a2a" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
          <path d="M3.5 7 L20.5 10.6 V7 Z" fill="#e8edf2" stroke="currentColor" strokeWidth="0.9" strokeLinejoin="round" />
          <path d="M6.4 6.9 L10.9 7.5 M11.9 7.6 L16.4 8.2 M17.4 8.3 L20.5 8.7" stroke="#2a2a2a" strokeWidth="0.8" />
          <path d="M3.5 7 L20.5 10.6" stroke="#c9536b" strokeWidth="1.2" />
          <path d="M6 13.5 H12 M6 16.2 H9" stroke="#e8edf2" strokeWidth="1" strokeLinecap="round" />
        </>
      );
    case 'spotlight':
      return (
        <>
          <path d="M9 4.5 H17 L18.5 10 H7.5 Z" fill="#3f4550" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
          <circle cx="13" cy="7.2" r="2" fill="#ffe9a8" stroke="#e0a94a" strokeWidth="0.8" />
          <rect x="10.5" y="10" width="5" height="3" rx="0.8" fill="#5a6270" stroke="currentColor" strokeWidth="0.9" />
          <path d="M13 13 V17.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M9.5 20.5 H16.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M6.5 4 C4.8 5.5 3.8 7.6 3.7 9.8 M4.6 3.2 C2.6 5 1.4 7.5 1.3 10.2" stroke="#e0a94a" strokeWidth="0.9" strokeLinecap="round" fill="none" />
        </>
      );
    case 'makeupMirror':
      return (
        <>
          <circle cx="12" cy="10" r="7.5" fill="#dcefe9" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="12" cy="10" r="5.6" fill="#f2f8f5" stroke="#8fa89f" strokeWidth="0.9" />
          <path d="M8.2 6.4 C9.4 5.4 11 5 12.6 5.3" stroke="#fff" strokeWidth="1" strokeLinecap="round" fill="none" />
          <circle cx="12" cy="10" r="7.5" fill="none" stroke="#e0a94a" strokeWidth="0.7" strokeDasharray="1.6 2.2" />
          <rect x="10.8" y="17.4" width="2.4" height="3" fill="#8a857c" stroke="currentColor" strokeWidth="0.8" />
          <path d="M7.5 20.5 H16.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </>
      );
    case 'movieCamera':
      return (
        <>
          <rect x="3" y="7" width="12.5" height="10" rx="1.5" fill="#3f4550" stroke="currentColor" strokeWidth="1.1" />
          <circle cx="8.4" cy="12" r="2.6" fill="#5a6270" stroke="currentColor" strokeWidth="0.9" />
          <circle cx="8.4" cy="12" r="1.1" fill="#ffe9a8" />
          <circle cx="13.4" cy="10" r="1.2" fill="#c9536b" stroke="#8a3a4e" strokeWidth="0.6" />
          <path d="M15.5 9.5 L20 7 V17 L15.5 14.5 Z" fill="#5a6270" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
          <rect x="5" y="4.6" width="2.2" height="2.4" rx="0.5" fill="#8a857c" stroke="currentColor" strokeWidth="0.7" />
          <rect x="8.6" y="4.6" width="2.2" height="2.4" rx="0.5" fill="#8a857c" stroke="currentColor" strokeWidth="0.7" />
          <path d="M6 17 V19.5 M12 17 V19.5 M4.5 20.5 H13.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </>
      );
    default:
      return <rect x="6" y="6" width="12" height="12" rx="2" fill="#cccccc" />;
  }
}

export function ItemIcon({ itemType, size = 30 }: ItemIconProps) {
  // Designer art takes precedence; the built-in switch below is the fallback while the
  // icon library is being filled (see docs/assets.md).
  const Custom = itemIconRegistry[itemType.icon];
  if (Custom) {
    return <Custom className={`item-icon item-icon--${itemType.kind}`} width={size} height={size} />;
  }
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`item-icon item-icon--${itemType.kind}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {renderIconShape(itemType.icon)}
    </svg>
  );
}
