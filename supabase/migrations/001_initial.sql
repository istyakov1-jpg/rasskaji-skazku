-- ============================================================
-- Расскажи Сказку — начальная схема БД
-- Выполнить в Supabase SQL Editor
-- ============================================================

-- Таблица сказок
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  child_name TEXT NOT NULL,
  characters TEXT[] NOT NULL,
  moral TEXT NOT NULL,
  wishes TEXT,
  story_text TEXT NOT NULL,
  tts_task_id TEXT,
  tts_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS stories_slug_idx ON stories (slug);
CREATE INDEX IF NOT EXISTS stories_created_at_idx ON stories (created_at DESC);

-- Таблица для rate limiting (по IP)
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS rate_limits_ip_created_idx ON rate_limits (ip, created_at);

-- Автоочистка старых записей rate_limits (старше 2 часов)
-- Можно запускать периодически через Supabase pg_cron или просто оставить — таблица маленькая
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('cleanup-rate-limits', '0 * * * *', 
--   'DELETE FROM rate_limits WHERE created_at < NOW() - INTERVAL ''2 hours''');

-- RLS (Row Level Security)
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Политики: только серверный код (service_role) может писать
-- Читать сказки может анонимный пользователь (для шеринга ссылок)
CREATE POLICY "Public stories are viewable by everyone"
  ON stories FOR SELECT
  USING (true);

CREATE POLICY "Only service role can insert stories"
  ON stories FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Only service role can update stories"
  ON stories FOR UPDATE
  TO service_role
  USING (true);

-- Rate limits — только service_role
CREATE POLICY "Only service role can manage rate limits"
  ON rate_limits FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Пример данных (опционально, можно удалить)
-- INSERT INTO stories (slug, child_name, characters, moral, story_text) VALUES (
--   'primer-skazki',
--   'Маша',
--   ARRAY['Зайчик', 'Мишка'],
--   'Дружба важна',
--   'Жила-была девочка Маша...'
-- );
