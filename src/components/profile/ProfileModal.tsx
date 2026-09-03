import { useState } from 'react';
import { useAuthStore } from '../../state/authStore';
import { ProfileStats } from './ProfileStats';
import { ProfileLeaderboardTab } from './ProfileLeaderboardTab';

interface Props {
  onClose: () => void;
}

export function ProfileModal({ onClose }: Props) {
  const { username, signOut } = useAuthStore();
  const [tab, setTab] = useState<'stats' | 'leaderboard'>('stats');

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal__header">
          <h2>{username ?? 'Профиль'}</h2>
          <button type="button" className="profile-modal__close" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>

        <div className="profile-modal__tabs">
          <button
            type="button"
            className={`profile-modal__tab${tab === 'stats' ? ' profile-modal__tab--active' : ''}`}
            onClick={() => setTab('stats')}
          >
            Статистика
          </button>
          <button
            type="button"
            className={`profile-modal__tab${tab === 'leaderboard' ? ' profile-modal__tab--active' : ''}`}
            onClick={() => setTab('leaderboard')}
          >
            Таблица лидеров
          </button>
        </div>

        <div className="profile-modal__body">{tab === 'stats' ? <ProfileStats /> : <ProfileLeaderboardTab />}</div>

        <div className="profile-modal__footer">
          <button type="button" className="profile-modal__signout" onClick={handleSignOut}>
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
}
