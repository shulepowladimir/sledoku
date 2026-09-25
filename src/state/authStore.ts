import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useProgressStore } from './progressStore';
import { useLevelDraftStore } from './levelDraftStore';
import { useGameStore } from './gameStore';

interface AuthStore {
  session: Session | null;
  username: string | null;
  status: 'loading' | 'ready';
  error: string | null;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

async function loadUsername(userId: string): Promise<string | null> {
  const { data } = await supabase.from('profiles').select('username').eq('id', userId).maybeSingle();
  return data?.username ?? null;
}

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  username: null,
  status: 'loading',
  error: null,

  signUp: async (email, password, username) => {
    set({ error: null });
    const trimmed = username.trim();
    if (trimmed.length < 3) {
      set({ error: 'Имя игрока должно быть не короче 3 символов' });
      return;
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      set({ error: translateAuthError(error.message) });
      return;
    }
    const userId = data.user?.id;
    if (userId) {
      const { error: profileError } = await supabase.from('profiles').insert({ id: userId, username: trimmed });
      if (profileError) {
        set({
          error: profileError.message.includes('duplicate')
            ? 'Это имя игрока уже занято, выбери другое'
            : profileError.message,
        });
        return;
      }
    }
    if (!data.session) {
      set({
        error: 'Проверь почту — нужно подтвердить регистрацию по ссылке в письме, потом войди снова',
      });
    }
    // Если сессия уже открыта (подтверждение email отключено), useAuthStore и
    // useProgressStore обновятся сами через onAuthStateChange ниже.
  },

  signIn: async (email, password) => {
    set({ error: null });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ error: translateAuthError(error.message) });
    }
    // Успешный вход тоже обрабатывается через onAuthStateChange.
  },

  signOut: async () => {
    await supabase.auth.signOut();
    // session/username и прогресс сбросятся через onAuthStateChange.
  },

  clearError: () => set({ error: null }),
}));

// Единая точка входа: любое изменение сессии (вход, выход, восстановление
// при перезагрузке страницы, обновление токена) проходит здесь.
// Отсюда управляем загрузкой прогресса и черновиков, чтобы данные не оставались
// "прилипшими" к предыдущему аккаунту при входе или выходе.
let lastHandledUserId: string | null | undefined;

supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.setState({ session, status: 'ready' });

  const userId = session?.user.id ?? null;
  if (userId === lastHandledUserId) return;
  const previousUserId = lastHandledUserId;
  lastHandledUserId = userId;
  if (previousUserId !== undefined && useGameStore.getState().screen === 'game') {
    useGameStore.getState().goToMenu();
  }

  if (session) {
    useAuthStore.setState({ username: null });
    loadUsername(session.user.id).then((username) => useAuthStore.setState({ username }));
    void useProgressStore.getState().hydrateAccount(session.user.id);
    void useLevelDraftStore.getState().hydrateAccount(session.user.id);
  } else {
    useAuthStore.setState({ username: null });
    useProgressStore.getState().hydrateGuest();
    useLevelDraftStore.getState().hydrateGuest();
  }
});

function translateAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) return 'Неверный email или пароль';
  if (message.includes('User already registered')) return 'Этот email уже зарегистрирован';
  if (message.includes('Password should be at least')) return 'Пароль слишком короткий (минимум 6 символов)';
  return message;
}
