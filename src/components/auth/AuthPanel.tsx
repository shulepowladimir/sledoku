import { useState } from 'react';
import { useAuthStore } from '../../state/authStore';
import { ProfileModal } from '../profile/ProfileModal';

export function AuthPanel() {
  const { session, username, error, signIn, signUp, clearError } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (session) {
    return (
      <div className="auth-panel">
        <button type="button" className="auth-panel__username" onClick={() => setProfileOpen(true)}>
          {username ?? '...'}
        </button>
        {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (mode === 'signin') {
      await signIn(email, password);
    } else {
      await signUp(email, password, displayName);
    }
    setSubmitting(false);
  };

  return (
    <div className="auth-panel">
      <button type="button" className="menu-button" onClick={() => setOpen((v) => !v)}>
        Войти
      </button>
      {open && (
        <div className="auth-popover" role="dialog" aria-label="Вход и регистрация">
          <div className="auth-popover__tabs">
            <button
              type="button"
              className={`auth-popover__tab${mode === 'signin' ? ' auth-popover__tab--active' : ''}`}
              onClick={() => {
                setMode('signin');
                clearError();
              }}
            >
              Вход
            </button>
            <button
              type="button"
              className={`auth-popover__tab${mode === 'signup' ? ' auth-popover__tab--active' : ''}`}
              onClick={() => {
                setMode('signup');
                clearError();
              }}
            >
              Регистрация
            </button>
          </div>
          <form className="auth-popover__form" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <input
                type="text"
                placeholder="Имя игрока"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                minLength={3}
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            {error && <p className="auth-popover__error">{error}</p>}
            <button type="submit" className="menu-button auth-popover__submit" disabled={submitting}>
              {submitting ? 'Секунду...' : mode === 'signin' ? 'Войти' : 'Создать аккаунт'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
