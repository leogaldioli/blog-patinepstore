-- Fatos pesquisados na web (com fontes) no momento da criação do tópico —
-- o redator (Haiku, sem web) escreve posts de novidade a partir DESTES fatos.
ALTER TABLE blog_topics
  ADD COLUMN IF NOT EXISTS research TEXT;
