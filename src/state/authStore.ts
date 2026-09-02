import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { syncOnLogin } from '../utils/cloudSync';

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
    if (data.session) {
      set({ session: data.session, username: trimmed });
      void syncOnLogin(data.session.user.id);
    } else {
      set({
        error: 'Проверь почту — нужно подтвердить регистрацию по ссылке в письме, потом войди снова',
      });
    }
  },

  signIn: async (email, password) => {
    set({ error: null });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ error: translateAuthError(error.message) });
      return;
    }
    if (data.session) {
      const username = await loadUsername(data.session.user.id);
      set({ session: data.session, username });
      void syncOnLogin(data.session.user.id);
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, username: null });
  },

  clearError: () => set({ error: null }),
}));

// Слушаем изменения сессии (в т.ч. восстановление при перезагрузке страницы).
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.setState({ session, status: 'ready' });
  if (session) {
    loadUsername(session.user.id).then((username) => useAuthStore.setState({ username }));
  } else {
    useAuthStore.setState({ username: null });
  }
});

function translateAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) return 'Неверный email или пароль';
  if (message.includes('User already registered')) return 'Этот email уже зарегистрирован';
  if (message.includes('Password should be at least')) return 'Пароль слишком короткий (минимум 6 символов)';
  return message;
}
