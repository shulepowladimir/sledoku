import { createClient } from '@supabase/supabase-js';

// Ключи проекта Supabase. Значение "anon public" безопасно хранить в коде,
// который выполняется в браузере, — доступ к данным ограничивается
// политиками Row Level Security, настроенными на стороне базы (см. supabase/schema.sql).
const SUPABASE_URL = 'https://izzxqpumywcpmztajbrl.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6enhxcHVteXdjcG16dGFqYnJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNzczMzEsImV4cCI6MjEwMzk1MzMzMX0.qQ6GuRPwgpu9n01YB6UfQi9r9SW0k8bn-LOg3yavWkg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
